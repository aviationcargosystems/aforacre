"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { useEffect } from "react";

const SOUTH_BANGALORE_CENTER: [number, number] = [12.72, 77.55];

const pinIcon = L.divIcon({
  className: "",
  html: `<div style="
    width:20px;height:20px;border-radius:50%;
    background:#c56a4a;border:3px solid #fff;
    box-shadow:0 2px 6px rgba(0,0,0,0.4);
    transform:translate(-50%, -50%);
  "></div>`,
  iconSize: [0, 0],
});

function ClickToPlace({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function RecenterOnChange({ position }: { position: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.setView(position, Math.max(map.getZoom(), 14));
  }, [position, map]);
  return null;
}

export default function PinLocationMap({
  lat,
  lng,
  onPick,
}: {
  lat: number | null;
  lng: number | null;
  onPick: (lat: number, lng: number) => void;
}) {
  const position: [number, number] | null = lat !== null && lng !== null ? [lat, lng] : null;

  return (
    <MapContainer
      center={position ?? SOUTH_BANGALORE_CENTER}
      zoom={position ? 14 : 10}
      scrollWheelZoom
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickToPlace onPick={onPick} />
      <RecenterOnChange position={position} />
      {position && (
        <Marker
          position={position}
          icon={pinIcon}
          draggable
          eventHandlers={{
            dragend: (e) => {
              const marker = e.target as L.Marker;
              const { lat: newLat, lng: newLng } = marker.getLatLng();
              onPick(newLat, newLng);
            },
          }}
        />
      )}
    </MapContainer>
  );
}
