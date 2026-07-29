"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Circle, CircleMarker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect } from "react";
import { GROWTH_ANCHORS } from "@/lib/anchors";

/**
 * What is being built south of the city, and where we list against it.
 *
 * The infrastructure is the point of this map; our own coverage is context, so
 * the projects get heat blooms and the listing areas get small markers. A light
 * basemap keeps the tiles out of the way, since this is a diagram rather than
 * somewhere to look at a specific plot.
 *
 * Only the three projects with real coordinates are plotted. The STRR, the
 * metro extension and general connectivity are named in the copy beside this
 * map but not drawn: their alignments are not settled enough to put a line on a
 * map without inventing one.
 */

export interface CoverageArea {
  area: string;
  corridor: string;
  lat: number;
  lng: number;
  count: number;
}

/**
 * Positron, split into its base and its labels.
 *
 * Place names are baked into the raster in the combined `light_all` tiles, so
 * there is no way to restyle them once they arrive. Taking the labels as their
 * own layer puts them in a separate DOM container, which a CSS filter can then
 * darken — the point being that someone should be able to find Harohalli or
 * Anekal at a glance rather than squinting at grey-on-grey.
 *
 * The label layer also sits above the heat blooms, so names stay readable where
 * a bloom passes under them.
 */
const POSITRON_BASE = "https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png";
const POSITRON_LABELS = "https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png";
const ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; CARTO';

const BENGALURU: [number, number] = [12.9716, 77.5946];
const FOREST = "#1f3a2e";
const TERRACOTTA = "#c56a4a";

/**
 * Stacked rings, widest and faintest first, so each project reads as a bloom.
 *
 * The reach is deliberately wide, but the falloff is gentle and the core stays
 * light. Stacking opacity steeply towards the centre gave each project a solid
 * disc that read as a boundary someone had drawn, which is a stronger claim
 * than we can make: these mark where investment is landing, not a catchment
 * with an edge.
 */
const HEAT_BANDS = [
  { radius: 14000, opacity: 0.035 },
  { radius: 10000, opacity: 0.045 },
  { radius: 7000, opacity: 0.055 },
  { radius: 4500, opacity: 0.07 },
  { radius: 2600, opacity: 0.085 },
  { radius: 1300, opacity: 0.1 },
];

/** Fractions of a zoom level to pull back after fitting, for breathing room. */
const ZOOM_BACK_OFF = 1.75;

function FitToRegion({ areas }: { areas: CoverageArea[] }) {
  const map = useMap();
  useEffect(() => {
    // Framed on the projects, not on everything we have a coordinate for.
    // Including the city and every listing pulled the centre north and left the
    // blooms — the actual subject — small and off to one side.
    const points = GROWTH_ANCHORS.map((a) => [a.lat, a.lng] as [number, number]);
    // Fit tight, then step back a fixed fraction of a zoom level.
    //
    // Pulling back with padding instead looks fine on a wide desktop frame and
    // falls apart on a phone: the padding is in pixels, so on a 350px-tall box
    // a 260px inset leaves almost nothing to fit the bounds into and Leaflet
    // bottoms out at its minimum zoom. A zoom delta is proportional, so the
    // framing is the same at every size.
    map.fitBounds(L.latLngBounds(points), { padding: [36, 36], animate: false });
    map.setZoom(map.getZoom() - ZOOM_BACK_OFF, { animate: false });
  }, [areas, map]);
  return null;
}

export default function SouthBangaloreMap({ areas }: { areas: CoverageArea[] }) {
  return (
    <MapContainer
      center={BENGALURU}
      zoom={10}
      // Leaflet snaps to whole zoom levels by default, which would round the
      // fractional back-off above away to nothing.
      zoomSnap={0.25}
      // A diagram, not a tool. Free panning invites people to treat it as a
      // search surface, which is what /explore is for.
      dragging={false}
      scrollWheelZoom={false}
      doubleClickZoom={false}
      zoomControl={false}
      // Carto and OSM still require credit, so it is not dropped — it moves to
      // a plain line under the map instead of Leaflet's white bar, which was
      // cutting across the rounded bottom corners.
      attributionControl={false}
      className="h-full w-full bg-transparent"
    >
      <TileLayer url={POSITRON_BASE} attribution={ATTRIBUTION} />
      <FitToRegion areas={areas} />

      {/* Heat blooms, one per committed project. */}
      {GROWTH_ANCHORS.map((anchor) =>
        HEAT_BANDS.map((band, i) => (
          <Circle
            key={`${anchor.id}-${band.radius}`}
            center={[anchor.lat, anchor.lng]}
            radius={band.radius}
            interactive={false}
            pathOptions={{
              stroke: false,
              fillColor: TERRACOTTA,
              fillOpacity: band.opacity,
              // Index drives the animation offset, so the rings breathe outward
              // rather than all brightening on the same beat.
              className: `aa-heat-band aa-heat-band-${i}`,
            }}
          />
        ))
      )}

      {GROWTH_ANCHORS.map((anchor) => (
        <CircleMarker
          key={anchor.id}
          center={[anchor.lat, anchor.lng]}
          radius={7}
          pathOptions={{ color: "#ffffff", weight: 2, fillColor: TERRACOTTA, fillOpacity: 1 }}
        >
          <Popup>
            <span className="font-medium">{anchor.title}</span>
            {anchor.disclaimer && (
              <span className="mt-0.5 block text-muted-foreground">{anchor.disclaimer}</span>
            )}
          </Popup>
        </CircleMarker>
      ))}

      {/* The city, for orientation only. */}
      <CircleMarker
        center={BENGALURU}
        radius={5}
        pathOptions={{ color: "#8a8578", weight: 2, fillColor: "#ffffff", fillOpacity: 1 }}
      >
        <Popup>Bengaluru</Popup>
      </CircleMarker>

      {/* Our listings, secondary to the infrastructure story. */}
      {areas.map((area) => (
        <CircleMarker
          key={`${area.area}-${area.lat}`}
          center={[area.lat, area.lng]}
          radius={Math.min(9, 4 + area.count)}
          pathOptions={{ color: "#ffffff", weight: 1.5, fillColor: FOREST, fillOpacity: 0.9 }}
        >
          <Popup>
            <span className="font-medium">{area.area}</span>
            <span className="text-muted-foreground">
              {" "}
              · {area.count} {area.count === 1 ? "plot" : "plots"}
            </span>
          </Popup>
        </CircleMarker>
      ))}

      {/* Last, so place names read over the blooms rather than under them. */}
      <TileLayer url={POSITRON_LABELS} className="aa-map-labels" />
    </MapContainer>
  );
}
