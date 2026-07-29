"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Circle, CircleMarker, Tooltip, useMap } from "react-leaflet";
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

const POSITRON = {
  url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; CARTO',
};

const BENGALURU: [number, number] = [12.9716, 77.5946];
const FOREST = "#1f3a2e";
const TERRACOTTA = "#c56a4a";

/** Stacked rings, widest and faintest first, so each project reads as a bloom. */
const HEAT_BANDS = [
  { radius: 9000, opacity: 0.06 },
  { radius: 6000, opacity: 0.08 },
  { radius: 3600, opacity: 0.11 },
  { radius: 1800, opacity: 0.16 },
];

function FitToRegion({ areas }: { areas: CoverageArea[] }) {
  const map = useMap();
  useEffect(() => {
    const points: [number, number][] = [
      ...areas.map((a) => [a.lat, a.lng] as [number, number]),
      ...GROWTH_ANCHORS.map((a) => [a.lat, a.lng] as [number, number]),
      BENGALURU,
    ];
    map.fitBounds(L.latLngBounds(points).pad(0.1), { animate: false });
  }, [areas, map]);
  return null;
}

export default function SouthBangaloreMap({ areas }: { areas: CoverageArea[] }) {
  return (
    <MapContainer
      center={BENGALURU}
      zoom={10}
      // A diagram, not a tool. Free panning invites people to treat it as a
      // search surface, which is what /explore is for.
      dragging={false}
      scrollWheelZoom={false}
      doubleClickZoom={false}
      zoomControl={false}
      attributionControl
      className="h-full w-full bg-transparent"
    >
      <TileLayer url={POSITRON.url} attribution={POSITRON.attribution} />
      <FitToRegion areas={areas} />

      {/* Heat blooms, one per committed project. */}
      {GROWTH_ANCHORS.map((anchor) =>
        HEAT_BANDS.map((band) => (
          <Circle
            key={`${anchor.id}-${band.radius}`}
            center={[anchor.lat, anchor.lng]}
            radius={band.radius}
            interactive={false}
            pathOptions={{ stroke: false, fillColor: TERRACOTTA, fillOpacity: band.opacity }}
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
          <Tooltip direction="top" offset={[0, -6]}>
            <span className="font-medium">{anchor.title}</span>
          </Tooltip>
        </CircleMarker>
      ))}

      {/* The city, for orientation only. */}
      <CircleMarker
        center={BENGALURU}
        radius={5}
        pathOptions={{ color: "#8a8578", weight: 2, fillColor: "#ffffff", fillOpacity: 1 }}
      >
        <Tooltip direction="right" offset={[8, 0]} permanent className="aa-map-label">
          Bengaluru
        </Tooltip>
      </CircleMarker>

      {/* Our listings, secondary to the infrastructure story. */}
      {areas.map((area) => (
        <CircleMarker
          key={`${area.area}-${area.lat}`}
          center={[area.lat, area.lng]}
          radius={Math.min(9, 4 + area.count)}
          pathOptions={{ color: "#ffffff", weight: 1.5, fillColor: FOREST, fillOpacity: 0.9 }}
        >
          <Tooltip direction="top" offset={[0, -5]}>
            <span className="font-medium">{area.area}</span>
            <span className="text-muted-foreground">
              {" "}
              · {area.count} {area.count === 1 ? "plot" : "plots"}
            </span>
          </Tooltip>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
