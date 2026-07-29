"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect } from "react";

/**
 * Where we actually operate, on one map.
 *
 * A light basemap rather than satellite or standard OSM: this is a diagram of
 * our coverage, not a look at any particular plot, so the tiles should recede
 * and let the brand-coloured markers carry the eye. Carto Positron is free and
 * needs no key, same terms as the rest of the stack.
 *
 * Markers are areas, not plots. Nothing here is precise enough to identify a
 * parcel, which is deliberate: exact locations belong on a plot page behind a
 * conversation, not on the homepage.
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

function FitToCoverage({ areas }: { areas: CoverageArea[] }) {
  const map = useMap();
  useEffect(() => {
    const points: [number, number][] = areas.map((a) => [a.lat, a.lng]);
    // Include the city so the map always answers "how far south is this".
    points.push(BENGALURU);
    if (points.length === 0) return;
    map.fitBounds(L.latLngBounds(points).pad(0.16), { animate: false });
  }, [areas, map]);
  return null;
}

export default function SouthBangaloreMap({ areas }: { areas: CoverageArea[] }) {
  return (
    <div className="relative h-full w-full">
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
        className="h-full w-full bg-white"
      >
        <TileLayer url={POSITRON.url} attribution={POSITRON.attribution} />
        <FitToCoverage areas={areas} />

        {/* The city, for reference only. Muted so it does not compete. */}
        <CircleMarker
          center={BENGALURU}
          radius={6}
          pathOptions={{ color: "#8a8578", weight: 2, fillColor: "#ffffff", fillOpacity: 1 }}
        >
          <Tooltip direction="right" offset={[8, 0]} permanent className="aa-map-label">
            Bengaluru
          </Tooltip>
        </CircleMarker>

        {areas.map((area) => (
          <CircleMarker
            key={`${area.area}-${area.lat}`}
            center={[area.lat, area.lng]}
            // Scaled by how much we have there, floored so a single plot is
            // still legible.
            radius={Math.min(16, 7 + area.count * 1.6)}
            pathOptions={{
              color: "#ffffff",
              weight: 2,
              fillColor: area.count > 1 ? FOREST : TERRACOTTA,
              fillOpacity: 0.92,
            }}
          >
            <Tooltip direction="top" offset={[0, -6]}>
              <span className="font-medium">{area.area}</span>
              <span className="text-muted-foreground">
                {" "}
                · {area.count} {area.count === 1 ? "plot" : "plots"}
              </span>
            </Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
