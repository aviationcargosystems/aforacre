"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Ruler } from "lucide-react";
import type { Property } from "@/lib/types";
import { formatINR } from "@/lib/tax";

const SOUTH_BANGALORE_CENTER: [number, number] = [12.72, 77.55];

type Basemap = "satellite" | "terrain" | "map";

/**
 * Satellite leads because these are real plots on real land. A flat street map
 * shows roads and labels but tells you nothing about tree cover, water or what
 * the neighbouring land is doing, which is most of what someone is trying to
 * read when they look at farmland. Terrain sits between the two. All three are
 * free and need no key, same terms as the rest of the stack.
 */
const BASEMAPS: Record<Basemap, { label: string; url: string; attribution: string; maxZoom: number }> = {
  satellite: {
    label: "Satellite",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "Imagery &copy; Esri, Maxar, Earthstar Geographics",
    maxZoom: 18,
  },
  terrain: {
    label: "Terrain",
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://opentopomap.org">OpenTopoMap</a>, &copy; OpenStreetMap contributors',
    maxZoom: 17,
  },
  map: {
    label: "Map",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  },
};

/**
 * The pin says where, not how much.
 *
 * Price on every pin turned the map into a wall of numbers and led with cost,
 * which is not how someone browses land. The label is the place name; the price
 * appears once you open a pin and are actually looking at that plot.
 */
function placeIcon(property: Property, active: boolean) {
  const label = property.location.area;
  const bg = active ? "#c56a4a" : "#1f3a2e";
  const width = Math.max(56, label.length * 6.6 + 22);

  return L.divIcon({
    className: "aa-place-pin",
    html: `
      <div style="position:relative;transform:translate(-50%,-100%);">
        <div style="
          display:flex;align-items:center;gap:5px;
          background:${bg};color:#fff;
          padding:5px 11px;border-radius:999px;
          font-size:11.5px;font-weight:600;letter-spacing:0.01em;
          white-space:nowrap;font-family:inherit;
          border:2px solid #fff;
          box-shadow:0 4px 14px rgba(15,23,42,0.28);
        ">
          <span style="width:5px;height:5px;border-radius:50%;background:#fff;opacity:0.75;"></span>
          ${label}
        </div>
        <div style="
          position:absolute;left:50%;bottom:-5px;
          width:9px;height:9px;background:${bg};
          border-right:2px solid #fff;border-bottom:2px solid #fff;
          transform:translateX(-50%) rotate(45deg);
        "></div>
      </div>`,
    iconSize: [width, 30],
    iconAnchor: [width / 2, 30],
    popupAnchor: [0, -32],
  });
}

function FitBounds({ properties }: { properties: Property[] }) {
  const map = useMap();
  useEffect(() => {
    if (properties.length === 0) return;
    const bounds = L.latLngBounds(properties.map((p) => [p.location.lat, p.location.lng]));
    // Tighter than before. The old 40px padding with maxZoom 12 pulled the view
    // out far enough to show half of Karnataka around a handful of pins.
    map.fitBounds(bounds.pad(0.12), { maxZoom: 13, animate: false });
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
  const [basemap, setBasemap] = useState<Basemap>("satellite");

  return (
    <div className="relative h-full w-full">
      <MapContainer center={SOUTH_BANGALORE_CENTER} zoom={11} scrollWheelZoom className="h-full w-full">
        <TileLayer
          key={basemap}
          attribution={BASEMAPS[basemap].attribution}
          url={BASEMAPS[basemap].url}
          maxZoom={BASEMAPS[basemap].maxZoom}
        />
        <FitBounds properties={properties} />
        {properties.map((property) => (
          <Marker
            key={property.slug}
            position={[property.location.lat, property.location.lng]}
            icon={placeIcon(property, hoveredSlug === property.slug)}
            zIndexOffset={hoveredSlug === property.slug ? 1000 : 0}
            eventHandlers={{
              mouseover: () => onHover(property.slug),
              mouseout: () => onHover(null),
            }}
          >
            <Popup className="property-popup" minWidth={228} maxWidth={228}>
              <div className="w-[228px]">
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
                  <Image src={property.images[0]} alt={property.title} fill sizes="228px" className="object-cover" />
                  <div className="absolute inset-x-0 bottom-0 bg-[linear-gradient(180deg,transparent,rgba(8,18,14,0.72))] px-3 pb-2 pt-6">
                    <p className="flex items-center gap-1 text-[11px] font-medium text-white/90">
                      <MapPin className="h-3 w-3 shrink-0" />
                      {property.location.area}, {property.location.corridor}
                    </p>
                  </div>
                </div>
                <div className="space-y-2 p-3">
                  <p className="font-heading text-sm font-semibold leading-snug text-foreground">{property.title}</p>
                  <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <Ruler className="h-3 w-3 shrink-0" />
                    {property.extentAcres} acres · {property.distanceFromBangaloreKm}km from the city
                  </p>
                  <div className="flex items-center justify-between gap-2 border-t border-border/60 pt-2">
                    <span className="text-[11px] text-muted-foreground">{formatINR(property.totalPrice)}</span>
                    <Link
                      href={`/property/${property.slug}`}
                      className="text-[11px] font-semibold text-accent hover:underline"
                    >
                      View listing
                    </Link>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Above Leaflet's own panes, which sit at z-index 400 and up. */}
      <div className="pointer-events-auto absolute right-3 top-3 z-[500] flex overflow-hidden rounded-full border border-border/70 bg-white/95 shadow-[0_6px_20px_rgba(15,23,42,0.14)] backdrop-blur">
        {(Object.keys(BASEMAPS) as Basemap[]).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setBasemap(option)}
            className={`px-3 py-1.5 text-xs font-medium transition-colors ${
              basemap === option ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {BASEMAPS[option].label}
          </button>
        ))}
      </div>
    </div>
  );
}
