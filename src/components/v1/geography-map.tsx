"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Circle, CircleMarker, Tooltip, useMap, useMapEvent } from "react-leaflet";
import L from "leaflet";
import { useEffect, useState } from "react";

/**
 * The villages we work in, on one map.
 *
 * Framed on the villages themselves rather than on the whole corridor: this
 * section's claim is that they sit close together within an easy drive, and a
 * map zoomed out far enough to show Bengaluru makes them look scattered. A
 * click on a name in the list flies the map to it, so the list and the map are
 * one control rather than two things side by side.
 */

const POSITRON_BASE = "https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png";
const POSITRON_LABELS = "https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png";
const ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; CARTO';

const FOREST = "#1f3a2e";
const TERRACOTTA = "#c56a4a";

/**
 * A soft catchment around each village, in terracotta.
 *
 * Terracotta rather than the brand green: the basemap is already green in every
 * park and field, so a green bloom over it disappeared into the terrain. The
 * accent is the other half of the palette and reads immediately as ours without
 * competing with the map.
 *
 * Stacked widest-and-faintest-first so each reads as a bloom rather than a
 * drawn boundary — these mark roughly where we work, not a line anybody has
 * surveyed, and a hard edge would claim more precision than we have. The radii
 * are in metres.
 */
const HALO_BANDS = [
  { radius: 4200, opacity: 0.07 },
  { radius: 2800, opacity: 0.09 },
  { radius: 1600, opacity: 0.11 },
];

export interface RegionPin {
  name: string;
  lat: number;
  lng: number;
}

function FitToPins({ pins, resetKey }: { pins: RegionPin[]; resetKey: number }) {
  const map = useMap();
  useEffect(() => {
    if (pins.length === 0) return;
    // Tight padding and no zoom back-off. The corridor map on this page pulls
    // back deliberately to show context; this one is about proximity, so it
    // fills the frame with the villages and nothing else.
    map.fitBounds(L.latLngBounds(pins.map((p) => [p.lat, p.lng] as [number, number])), {
      padding: [28, 28],
      animate: false,
    });
    // resetKey is in the dependency list on purpose: bumping it is how the
    // "Show all" control asks for a refit without anything else changing.
  }, [pins, map, resetKey]);
  return null;
}

/**
 * Reports the current zoom, so the blooms can get out of the way.
 *
 * They exist to show roughly where we work when the whole belt is in frame. As
 * soon as somebody zooms into one village they are just a wash of colour over
 * the streets they were trying to look at.
 */
function ZoomWatcher({ onZoom }: { onZoom: (zoom: number) => void }) {
  const map = useMap();
  useEffect(() => {
    onZoom(map.getZoom());
  }, [map, onZoom]);
  useMapEvent("zoomend", () => onZoom(map.getZoom()));
  return null;
}

/** Flies to whichever village was last clicked in the list. */
function FocusPin({ focus }: { focus: RegionPin | null }) {
  const map = useMap();
  useEffect(() => {
    if (!focus) return;
    map.flyTo([focus.lat, focus.lng], 12.5, { duration: 0.9 });
  }, [focus, map]);
  return null;
}

export default function GeographyMap({
  pins,
  focus,
  onSelect,
  resetKey,
}: {
  pins: RegionPin[];
  focus: RegionPin | null;
  onSelect: (pin: RegionPin) => void;
  /** Bumped by the "Show all" control to refit the map to every village. */
  resetKey: number;
}) {
  const [zoom, setZoom] = useState(11);
  // Fully faded out by the time a single village fills the frame.
  const haloOpacity = zoom >= 13 ? 0 : zoom >= 11.5 ? 0.45 : 1;

  return (
    <MapContainer
      center={[12.68, 77.55]}
      zoom={11}
      zoomSnap={0.25}
      scrollWheelZoom={false}
      // Leaflet's own +/- controls, so the map can be zoomed out again after a
      // village has been flown to. "Show all" beside the list is the one-press
      // way back; these are for everything in between.
      zoomControl
      attributionControl={false}
      className="h-full w-full bg-transparent"
    >
      <TileLayer url={POSITRON_BASE} attribution={ATTRIBUTION} />
      <FitToPins pins={pins} resetKey={resetKey} />
      <ZoomWatcher onZoom={setZoom} />
      <FocusPin focus={focus} />

      {/* Blooms under the markers, so a dot always sits on top of its own. */}
      {haloOpacity > 0 &&
        pins.map((pin) =>
        HALO_BANDS.map((band) => (
          <Circle
            key={`${pin.name}-${band.radius}`}
            center={[pin.lat, pin.lng]}
            radius={band.radius}
            interactive={false}
            pathOptions={{
              stroke: false,
              fillColor: TERRACOTTA,
              // The focused village keeps the same hue and simply burns
              // brighter, so a click reads as emphasis rather than as a
              // different kind of place.
              fillOpacity:
                (focus?.name === pin.name ? band.opacity * 2.2 : band.opacity) * haloOpacity,
            }}
          />
          ))
        )}

      {pins.map((pin) => {
        const active = focus?.name === pin.name;
        return (
          <CircleMarker
            key={pin.name}
            center={[pin.lat, pin.lng]}
            radius={active ? 11 : 7}
            eventHandlers={{ click: () => onSelect(pin) }}
            pathOptions={{
              color: "#ffffff",
              weight: 2,
              fillColor: active ? TERRACOTTA : FOREST,
              fillOpacity: 1,
            }}
          >
            {/* Permanent labels: the whole point is to read the village names,
                and a tooltip you have to hover for does not do that. */}
            <Tooltip permanent direction="top" offset={[0, -8]} className="aa-region-label">
              {pin.name}
            </Tooltip>
          </CircleMarker>
        );
      })}

      {/* Last, so place names read over the markers rather than under them. */}
      <TileLayer url={POSITRON_LABELS} className="aa-map-labels" />
    </MapContainer>
  );
}
