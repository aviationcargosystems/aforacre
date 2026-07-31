"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { ArrowRight, MapPin, Play } from "lucide-react";
import type { Property } from "@/lib/types";
import { formatINR } from "@/lib/tax";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

/**
 * A listing card whose tags open inside the card rather than over it.
 *
 * Tags went through three shapes before this one. Two of them truncated the
 * list; showing all of them made every card a different height and the grid
 * came out ragged; a popover floated over the neighbouring card and, inside the
 * featured drag-rail, fought the rail for the pointer.
 *
 * So the card opens instead: the photograph gives up height and the white panel
 * takes it, which keeps the card's own footprint almost unchanged and reads as
 * one object rearranging itself. Both halves animate on the same duration, so
 * the image shrinking and the panel growing look like a single movement.
 *
 * The whole card is a link, so the toggle has to swallow its own click —
 * otherwise opening the tags navigates to the listing.
 */

const COLLAPSED_TAGS = 3;

export function PropertyCard({
  property,
  highlightLabel,
}: {
  property: Property;
  highlightLabel?: string;
}) {
  const [open, setOpen] = useState(false);

  const metaItems = [`${property.extentAcres} acres`, ...property.tags, property.roadAccess].filter(
    Boolean
  );
  const shown = open ? metaItems : metaItems.slice(0, COLLAPSED_TAGS);
  const hiddenCount = metaItems.length - COLLAPSED_TAGS;

  const place = [property.location.area, property.location.corridor].filter(Boolean).join(", ");

  return (
    <Link href={`/property/${property.slug}`} className="group block h-full">
      <Card className="h-full overflow-hidden border-white/60 p-0 shadow-[0_8px_24px_rgba(15,23,42,0.07)] transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_14px_36px_rgba(15,23,42,0.11)]">
        {/* Height is set inline rather than by utility class. The two classes
            swap correctly in the DOM but the computed height did not follow,
            and rather than keep hunting the precedence conflict this states the
            value outright — which is also what the transition needs to animate
            between. */}
        <div
          className="relative w-full overflow-hidden bg-muted transition-[height] duration-300 ease-out"
          style={{ height: open ? "9rem" : "13rem" }}
        >
          {/* A listing can exist before its photos do. Passing an undefined src
              to next/image renders a broken frame rather than nothing. */}
          {property.images[0] && (
            <Image
              src={property.images[0]}
              alt={property.title}
              fill
              sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 390px"
              quality={72}
              className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            />
          )}
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,18,14,0)_0%,rgba(8,18,14,0.05)_45%,rgba(8,18,14,0.68)_100%)]" />
          <div className="absolute left-4 top-4 flex flex-wrap gap-2">
            {property.videos.length > 0 && (
              <Badge className="gap-1 bg-black/55 text-white backdrop-blur">
                <Play className="h-3 w-3 fill-current" />
                Video
              </Badge>
            )}
            {property.featured && (
              <Badge className="bg-white/90 text-foreground shadow-[0_10px_24px_rgba(15,23,42,0.12)]">
                Featured
              </Badge>
            )}
            {highlightLabel && <Badge className="bg-accent text-accent-foreground">{highlightLabel}</Badge>}
          </div>
          <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between gap-3 text-white">
            <div className="min-w-0">
              {/* FID is an internal reference — it means nothing to a buyer. */}
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/70">
                South Bangalore
              </p>
              <p className="mt-0.5 line-clamp-2 font-heading text-base font-semibold leading-tight sm:text-lg">
                {property.title}
              </p>
            </div>
            <div className="shrink-0 rounded-xl border border-white/15 bg-white/10 px-2.5 py-1.5 text-right backdrop-blur">
              <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-white/68">Total</p>
              <p className="mt-0.5 whitespace-nowrap font-heading text-base font-semibold leading-none">
                {formatINR(property.totalPrice)}
              </p>
            </div>
          </div>
        </div>

        <CardContent className="space-y-3 p-4 sm:p-5">
          {/* Joined, not interpolated: a plot with no corridor recorded was
              rendering as "Attikuppe, " with a dangling separator. And when a
              listing has neither — which happens on anything created from a
              capture before the area is filled in — the whole row goes, rather
              than leaving a map pin pointing at nothing. */}
          {place && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{place}</span>
            </div>
          )}

          <div className="flex flex-wrap gap-1.5">
            {shown.map((item) => (
              <span
                key={item}
                className="rounded-full border border-border/70 bg-white/75 px-2.5 py-1 text-xs font-medium text-foreground"
              >
                {item}
              </span>
            ))}
            {hiddenCount > 0 && (
              <button
                type="button"
                aria-expanded={open}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  setOpen((v) => !v);
                }}
                className="rounded-full border border-accent/40 bg-accent/10 px-2.5 py-1 text-xs font-semibold text-accent transition-colors hover:bg-accent/20"
              >
                {open ? "Show less" : `+${hiddenCount} more`}
              </button>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-border/70 pt-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Per acre</p>
              <p className="text-base font-semibold tracking-tight text-primary tabular-nums">
                {formatINR(property.pricePerAcre)}
              </p>
            </div>
            <span className="inline-flex items-center gap-1 text-sm font-medium text-foreground transition-transform group-hover:translate-x-0.5">
              View listing
              <ArrowRight className="h-4 w-4" />
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
