"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Circle, useMap } from "react-leaflet";
import { Maximize2 } from "lucide-react";

/**
 * The land, from above, without giving away exactly where it is.
 *
 * A buyer wants to see the setting: what the neighbouring land is doing, how
 * much tree cover there is, where the water and the roads are. They do not need
 * the survey point, and we should not hand it over before a conversation: an
 * exact pin lets anyone walk up to the owner and route around us entirely.
 *
 * So the centre is deliberately coarsened and the plot is drawn as a catchment
 * circle rather than a marker. The imagery is real and at the right place; the
 * precision is not.
 */

/** Roughly 300 to 400m of slop, which is the width of the circle we draw. */
const COORD_PRECISION = 3;
const AREA_RADIUS_M = 380;

const IMAGERY = {
  url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  attribution: "Imagery &copy; Esri, Maxar, Earthstar Geographics",
};
const LABELS = {
  url: "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
};

function coarsen(value: number): number {
  return Number(value.toFixed(COORD_PRECISION));
}

function ZoomButtons() {
  const map = useMap();
  return (
    <div className="absolute right-3 top-3 z-[500] flex flex-col overflow-hidden rounded-xl border border-white/40 bg-black/45 backdrop-blur">
      {[
        { label: "+", onClick: () => map.zoomIn() },
        { label: "-", onClick: () => map.zoomOut() },
      ].map((btn) => (
        <button
          key={btn.label}
          type="button"
          onClick={btn.onClick}
          className="h-8 w-8 text-lg font-medium leading-none text-white transition-colors hover:bg-white/15"
        >
          {btn.label}
        </button>
      ))}
    </div>
  );
}

export default function PlotAreaMap({
  lat,
  lng,
  area,
}: {
  lat: number;
  lng: number;
  area: string;
}) {
  const centre: [number, number] = [coarsen(lat), coarsen(lng)];

  return (
    <div className="relative h-full w-full overflow-hidden">
      <MapContainer
        center={centre}
        zoom={15}
        // Panning away would let someone triangulate the centre by finding the
        // circle's edges, and it is not what this view is for.
        dragging={false}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        zoomControl={false}
        attributionControl
        className="h-full w-full"
      >
        <TileLayer url={IMAGERY.url} attribution={IMAGERY.attribution} maxZoom={18} />
        {/* Place names on top of the imagery, so the setting is readable. */}
        <TileLayer url={LABELS.url} maxZoom={18} />

        <Circle
          center={centre}
          radius={AREA_RADIUS_M}
          pathOptions={{
            color: "#c56a4a",
            weight: 2,
            opacity: 0.9,
            fillColor: "#c56a4a",
            fillOpacity: 0.14,
            dashArray: "6 6",
          }}
        />
        <ZoomButtons />
      </MapContainer>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[500] bg-[linear-gradient(180deg,transparent,rgba(8,18,14,0.78))] px-4 pb-4 pt-10">
        <p className="text-sm font-semibold text-white">{area}</p>
        <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-white/75">
          <Maximize2 className="h-3 w-3" />
          Approximate area. Exact boundaries are shared on a site visit.
        </p>
      </div>
    </div>
  );
}
