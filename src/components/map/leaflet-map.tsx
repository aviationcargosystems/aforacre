"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin } from "lucide-react";
import type { Property } from "@/lib/types";
import { formatINR } from "@/lib/tax";

const SOUTH_BANGALORE_CENTER: [number, number] = [12.72, 77.55];

function pinIcon(active: boolean) {
  return L.divIcon({
    className: "",
    html: `<div style="
      background:${active ? "#c56a4a" : "#1f3a2e"};
      color:#fff;
      padding:4px 8px;
      border-radius:999px;
      font-size:11px;
      font-weight:600;
      white-space:nowrap;
      box-shadow:0 2px 6px rgba(0,0,0,0.35);
      border:2px solid #fff;
      transform:translate(-50%, -100%);
    ">${active ? "●" : ""}</div>`,
    iconSize: [0, 0],
  });
}

function FitBounds({ properties }: { properties: Property[] }) {
  const map = useMap();
  useEffect(() => {
    if (properties.length === 0) return;
    const bounds = L.latLngBounds(properties.map((p) => [p.location.lat, p.location.lng]));
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 });
  }, [properties, map]);
  return null;
}

export default function LeafletMap({
  properties,
  hoveredSlug,
  onHover,
}: {
  properties: Property[];
  hoveredSlug: string | null;
  onHover: (slug: string | null) => void;
}) {
  return (
    <MapContainer
      center={SOUTH_BANGALORE_CENTER}
      zoom={10}
      scrollWheelZoom
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds properties={properties} />
      {properties.map((property) => (
        <Marker
          key={property.slug}
          position={[property.location.lat, property.location.lng]}
          icon={pinIcon(hoveredSlug === property.slug)}
          eventHandlers={{
            mouseover: () => onHover(property.slug),
            mouseout: () => onHover(null),
          }}
        >
          <Popup className="property-popup" minWidth={240} maxWidth={260}>
            <div className="w-60">
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                <Image
                  src={property.images[0]}
                  alt={property.title}
                  fill
                  sizes="240px"
                  className="object-cover"
                />
                {property.featured && (
                  <span className="absolute left-2 top-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-foreground">
                    Featured
                  </span>
                )}
              </div>
              <div className="space-y-1 p-3">
                <p className="font-heading text-sm font-semibold leading-snug text-foreground">{property.title}</p>
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3 shrink-0" />
                  <span className="truncate">
                    {property.location.area}, {property.location.corridor}
                  </span>
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {property.extentAcres} Acres · {property.tags.slice(0, 2).join(" · ")}
                </p>
                <div className="flex items-baseline justify-between pt-0.5">
                  <span className="font-heading text-base font-bold text-primary">{formatINR(property.totalPrice)}</span>
                  <span className="text-[11px] text-muted-foreground">{formatINR(property.pricePerAcre)}/acre</span>
                </div>
                <Link
                  href={`/property/${property.slug}`}
                  className="mt-1.5 flex w-full items-center justify-center rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-accent-foreground hover:bg-accent/90"
                >
                  View details
                </Link>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
