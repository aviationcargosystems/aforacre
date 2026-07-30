"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect, useMemo, useState } from "react";
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
 *
 * Only one plot per area carries the name. Three plots in Harohalli used to
 * mean three identical chips stacked on top of each other, which was both
 * unreadable and told the reader nothing the first chip had not already said.
 * The rest are dots: still hoverable, still clickable, no collision.
 */
function placeIcon(label: string | null, active: boolean) {
  const bg = active ? "#c56a4a" : "#1f3a2e";

  if (!label) {
    const size = active ? 14 : 11;
    return L.divIcon({
      className: "aa-place-pin",
      html: `<div style="
        width:${size}px;height:${size}px;border-radius:50%;
        background:${bg};border:2px solid #fff;
        box-shadow:0 2px 8px rgba(15,23,42,0.3);
      "></div>`,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
      popupAnchor: [0, -(size / 2) - 2],
    });
  }

  const width = Math.max(48, label.length * 6.2 + 18);

  return L.divIcon({
    className: "aa-place-pin",
    html: `
      <div style="transform:translate(-50%,-50%);">
        <div style="
          background:${bg};color:#fff;
          padding:3px 9px;border-radius:999px;
          font-size:11px;font-weight:500;letter-spacing:0.01em;
          white-space:nowrap;font-family:inherit;
          box-shadow:0 2px 8px rgba(15,23,42,0.28);
        ">${label}</div>
      </div>`,
    iconSize: [width, 22],
    iconAnchor: [width / 2, 11],
    popupAnchor: [0, -14],
  });
}

/** Rough on-screen size of a chip, matching the markup in placeIcon. */
function chipWidth(label: string): number {
  return Math.max(48, label.length * 6.2 + 18);
}

const CHIP_HEIGHT = 22;
/** Clear space demanded around every chip, so labels read as separate. */
const GUTTER = 10;

/**
 * Decides which area names fit at the current zoom.
 *
 * Deduplicating by area stopped three "Harohalli" chips stacking, but eighteen
 * distinct villages inside one taluk still overlap when the map is pulled out.
 * So placement is resolved in screen space and re-run whenever the view moves:
 * chips are laid down in order and any that would touch one already placed is
 * demoted to a dot. Zoom in and the survivors reappear as the space opens up.
 */
function LabelPlacement({
  candidates,
  onResolve,
}: {
  candidates: Property[];
  onResolve: (slugs: Set<string>) => void;
}) {
  const map = useMap();

  useEffect(() => {
    function resolve() {
      const placed: { left: number; right: number; top: number; bottom: number }[] = [];
      const keep = new Set<string>();

      for (const property of candidates) {
        const point = map.latLngToContainerPoint([property.location.lat, property.location.lng]);
        const halfWidth = chipWidth(property.location.area) / 2 + GUTTER / 2;
        const halfHeight = CHIP_HEIGHT / 2 + GUTTER / 2;
        const box = {
          left: point.x - halfWidth,
          right: point.x + halfWidth,
          top: point.y - halfHeight,
          bottom: point.y + halfHeight,
        };

        const collides = placed.some(
          (other) => box.left < other.right && other.left < box.right && box.top < other.bottom && other.top < box.bottom
        );
        if (collides) continue;

        placed.push(box);
        keep.add(property.slug);
      }

      onResolve(keep);
    }

    resolve();
    map.on("zoomend moveend resize", resolve);
    return () => {
      map.off("zoomend moveend resize", resolve);
    };
  }, [candidates, map, onResolve]);

  return null;
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

  // One candidate per area; which of those actually get a chip is decided at
  // the current zoom by LabelPlacement below.
  const candidates = useMemo(() => {
    const seen = new Set<string>();
    return properties.filter((property) => {
      const area = property.location.area;
      if (seen.has(area)) return false;
      seen.add(area);
      return true;
    });
  }, [properties]);

  const [labelledSlugs, setLabelledSlugs] = useState<Set<string>>(new Set());

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
        <LabelPlacement candidates={candidates} onResolve={setLabelledSlugs} />
        {properties.map((property) => (
          <Marker
            key={property.slug}
            position={[property.location.lat, property.location.lng]}
            icon={placeIcon(
              labelledSlugs.has(property.slug) ? property.location.area : null,
              hoveredSlug === property.slug
            )}
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
                    {property.extentAcres} acres
                    {property.distanceFromBangaloreKm > 0 && ` · ${property.distanceFromBangaloreKm}km from the city`}
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
