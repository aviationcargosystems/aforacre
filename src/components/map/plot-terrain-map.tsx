"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef, useState } from "react";
import { Map as MapLibreMap, NavigationControl } from "maplibre-gl";
import { Compass, Loader2, Mountain } from "lucide-react";

/**
 * The land in 3D: satellite imagery draped over real elevation, tilted, so you
 * can read the lie of the ground rather than a flat square of green.
 *
 * This is the free route to a Google Earth feel. Google's photorealistic 3D
 * tiles need a billed Maps Platform key, and what they add over this is
 * photogrammetric buildings and tree canopy. On open farmland there is very
 * little of either, so terrain plus imagery carries almost all of the value at
 * none of the cost. If the key ever arrives, only the source below changes.
 *
 * Same privacy rule as the flat view: the centre is coarsened and the plot is a
 * catchment ring, never an exact point.
 */

const COORD_PRECISION = 3;
const AREA_RADIUS_M = 380;

const IMAGERY_TILES = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
/** Terrarium-encoded elevation, free and open, no key. */
const TERRAIN_TILES = "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png";

function coarsen(value: number): number {
  return Number(value.toFixed(COORD_PRECISION));
}

/** A ring polygon, since MapLibre has no circle primitive in metres. */
function ringPolygon(lat: number, lng: number, radiusM: number, points = 72) {
  const coords: [number, number][] = [];
  const latRad = (lat * Math.PI) / 180;
  const dLat = radiusM / 111_320;
  const dLng = radiusM / (111_320 * Math.cos(latRad));

  for (let i = 0; i <= points; i += 1) {
    const angle = (i / points) * 2 * Math.PI;
    coords.push([lng + dLng * Math.cos(angle), lat + dLat * Math.sin(angle)]);
  }
  return coords;
}

export default function PlotTerrainMap({
  lat,
  lng,
  area,
}: {
  lat: number;
  lng: number;
  area: string;
}) {
  const container = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const [ready, setReady] = useState(false);
  // Read inside the error handler without making the effect depend on it:
  // depending on `ready` would tear the map down the instant it loaded.
  const readyRef = useRef(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!container.current || mapRef.current) return;

    const centre: [number, number] = [coarsen(lng), coarsen(lat)];

    const map = new MapLibreMap({
      container: container.current,
      center: centre,
      zoom: 14.2,
      pitch: 62,
      bearing: -18,
      maxPitch: 75,
      attributionControl: { compact: true },
      // Panning off, same reasoning as the flat view: free roaming would let
      // someone find the ring's edges and work back to the centre.
      dragPan: false,
      style: {
        version: 8,
        sources: {
          imagery: {
            type: "raster",
            tiles: [IMAGERY_TILES],
            tileSize: 256,
            maxzoom: 18,
            attribution: "Imagery &copy; Esri, Maxar, Earthstar Geographics",
          },
          terrain: {
            type: "raster-dem",
            tiles: [TERRAIN_TILES],
            tileSize: 256,
            maxzoom: 14,
            encoding: "terrarium",
            attribution: "Elevation &copy; Mapzen, AWS Terrain Tiles",
          },
        },
        layers: [
          { id: "imagery", type: "raster", source: "imagery" },
        ],
        sky: {
          "sky-color": "#8fb8d6",
          "horizon-color": "#e6ddc9",
          "fog-color": "#e6ddc9",
          "sky-horizon-blend": 0.6,
          "horizon-fog-blend": 0.6,
        },
      },
    });

    map.addControl(new NavigationControl({ visualizePitch: true }), "top-right");

    map.on("load", () => {
      // Exaggerated a little: at this scale the real relief is subtle enough
      // that a true 1.0 reads as flat on a phone.
      try {
        map.setTerrain({ source: "terrain", exaggeration: 1.5 });
      } catch {
        // Elevation is a nice-to-have. Flat imagery is still worth showing.
      }

      map.addSource("plot-area", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: { type: "Polygon", coordinates: [ringPolygon(coarsen(lat), coarsen(lng), AREA_RADIUS_M)] },
        },
      });
      map.addLayer({
        id: "plot-area-fill",
        type: "fill",
        source: "plot-area",
        paint: { "fill-color": "#c56a4a", "fill-opacity": 0.16 },
      });
      map.addLayer({
        id: "plot-area-line",
        type: "line",
        source: "plot-area",
        paint: { "line-color": "#c56a4a", "line-width": 2, "line-dasharray": [2, 2] },
      });
      readyRef.current = true;
      setReady(true);
    });

    // Terrain tiles come from a third party. If they are unreachable the map
    // should still show flat imagery rather than an empty box.
    map.on("error", (event: { error?: { url?: string } }) => {
      const url = event.error?.url ?? "";
      if (url.includes("elevation-tiles")) {
        try {
          map.setTerrain(null);
        } catch {
          // Already cleared, nothing to do.
        }
      } else if (!readyRef.current) {
        setFailed(true);
      }
    });

    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [lat, lng]);

  function orbit() {
    const map = mapRef.current;
    if (!map) return;
    map.easeTo({ bearing: map.getBearing() + 90, duration: 1400 });
  }

  return (
    <div className="relative h-full w-full overflow-hidden">
      <div ref={container} className="h-full w-full" />

      {!ready && !failed && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-muted">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}
      {failed && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-muted px-6 text-center">
          <p className="text-sm text-muted-foreground">
            The 3D view could not load. The flat satellite view above still shows this area.
          </p>
        </div>
      )}

      {ready && (
        <button
          type="button"
          onClick={orbit}
          className="absolute left-3 top-3 z-10 flex items-center gap-1.5 rounded-full border border-white/30 bg-black/45 px-3 py-1.5 text-xs font-medium text-white backdrop-blur transition-colors hover:bg-black/60"
        >
          <Compass className="h-3.5 w-3.5" />
          Rotate
        </button>
      )}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-[linear-gradient(180deg,transparent,rgba(8,18,14,0.8))] px-4 pb-4 pt-10">
        <p className="flex items-center gap-1.5 text-sm font-semibold text-white">
          <Mountain className="h-3.5 w-3.5" />
          {area}, in 3D
        </p>
        <p className="mt-0.5 text-[11px] text-white/75">
          Approximate area. Exact boundaries are shared on a site visit.
        </p>
      </div>
    </div>
  );
}
