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
  { radius: 6500, opacity: 0.1 },
  { radius: 4400, opacity: 0.13 },
  { radius: 2600, opacity: 0.16 },
];

export interface RegionPin {
  name: string;
  lat: number;
  lng: number;
}

/**
 * A committed infrastructure project, drawn larger and labelled than a village.
 * The corridor dialog shows these alongside the villages so the argument —
 * "we list inside these rings" — is visible rather than asserted.
 */
export interface AnchorPin extends RegionPin {
  note?: string;
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
  anchors = [],
}: {
  pins: RegionPin[];
  focus: RegionPin | null;
  onSelect: (pin: RegionPin) => void;
  /** Bumped by the "Show all" control to refit the map to every village. */
  resetKey: number;
  /** Infrastructure projects, labelled. Empty on the geography section. */
  anchors?: AnchorPin[];
}) {
  const [zoom, setZoom] = useState(11);
  // Fully faded out by the time a single village fills the frame. The radii
  // above are sized for the pulled-back view, where the blooms are the message;
  // zoomed in they would swamp the streets, so they leave rather than shrink.
  const haloOpacity = zoom >= 13 ? 0 : zoom >= 11.5 ? 0.4 : 1;

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
      <FitToPins pins={[...pins, ...anchors]} resetKey={resetKey} />
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
              // Strongest when nothing is selected — that is the state where
              // the blooms are the message, "here is roughly where we work".
              // Once a village is picked they get out of the way instead of
              // burning brighter: the selected one drops to half so the
              // streets under it stay readable, and the rest recede further so
              // the choice is obvious.
              fillOpacity:
                band.opacity *
                (focus ? (focus.name === pin.name ? 0.5 : 0.25) : 1) *
                haloOpacity,
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

      {/* The projects: bigger, terracotta, always labelled. */}
      {anchors.map((anchor) => (
        <CircleMarker
          key={`anchor-${anchor.name}`}
          center={[anchor.lat, anchor.lng]}
          radius={10}
          pathOptions={{ color: "#ffffff", weight: 2.5, fillColor: TERRACOTTA, fillOpacity: 1 }}
        >
          <Tooltip permanent direction="top" offset={[0, -10]} className="aa-anchor-label">
            {anchor.name}
            {anchor.note && <span className="aa-anchor-note">{anchor.note}</span>}
          </Tooltip>
        </CircleMarker>
      ))}

      {/* Last, so place names read over the markers rather than under them. */}
      <TileLayer url={POSITRON_LABELS} className="aa-map-labels" />
    </MapContainer>
  );
}
