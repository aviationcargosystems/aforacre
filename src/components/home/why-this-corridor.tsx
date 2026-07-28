"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { GROWTH_ANCHORS, type AnchorCertainty, type AnchorId } from "@/lib/anchors";
import { Button } from "@/components/ui/button";

/**
 * Why these three corridors and not the rest of Bangalore.
 *
 * The map is a projected SVG rather than a tile map: three fixed pins on a
 * fixed extent do not justify shipping a mapping library and its tile requests
 * to every homepage visit, and this keeps the section free of network work.
 */

// Extent covers Bengaluru and all three anchors with a margin.
const BOUNDS = { minLat: 12.56, maxLat: 13.05, minLng: 77.40, maxLng: 77.78 };
const VIEW = { w: 440, h: 560 };

const CITY = { lat: 12.9716, lng: 77.5946, label: "Bengaluru" };

/** Equirectangular projection. Fine at this scale and trivially reversible. */
function project(lat: number, lng: number) {
  const x = ((lng - BOUNDS.minLng) / (BOUNDS.maxLng - BOUNDS.minLng)) * VIEW.w;
  const y = ((BOUNDS.maxLat - lat) / (BOUNDS.maxLat - BOUNDS.minLat)) * VIEW.h;
  return { x, y };
}

/**
 * Chip weight tracks certainty. A cabinet approval and a shortlisted site must
 * not look alike, so the styles are deliberately unequal: solid, then tinted,
 * then outline only.
 */
const CHIP_STYLE: Record<AnchorCertainty, string> = {
  under_construction: "bg-primary text-primary-foreground",
  cabinet_approved: "bg-primary/12 text-primary",
  under_evaluation: "border border-muted-foreground/35 text-muted-foreground",
};

const PIN_STYLE: Record<AnchorCertainty, { fill: string; stroke: string; dash?: string }> = {
  under_construction: { fill: "#1f3a2e", stroke: "#ffffff" },
  cabinet_approved: { fill: "#4b6b58", stroke: "#ffffff" },
  under_evaluation: { fill: "transparent", stroke: "#1f3a2e", dash: "3 3" },
};

export function WhyThisCorridor() {
  const [activeId, setActiveId] = useState<AnchorId | null>(null);
  const city = project(CITY.lat, CITY.lng);

  return (
    <section className="mx-auto max-w-[1200px] px-4 py-24 sm:px-6 lg:px-8 lg:py-28">
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">
          Why South Bangalore, why now
        </p>
        <h2 className="mt-4 font-heading text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
          Three things are being built south of you.
        </h2>
        <p className="mt-5 text-pretty text-base leading-8 text-muted-foreground sm:text-lg">
          We do not list land across Bangalore. We list it inside three corridors where public money is already
          committed. That is the entire selection criteria.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-[45fr_55fr] lg:gap-10">
        {/* Map. Sticky beside the cards on desktop, a plain banner on mobile. */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="overflow-hidden rounded-[1.75rem] border border-border/70 bg-[#f3efe6]">
            <svg
              viewBox={`0 0 ${VIEW.w} ${VIEW.h}`}
              className="aspect-video w-full lg:aspect-[440/560]"
              role="img"
              aria-label="South Bangalore, showing the three growth anchors"
            >
              <defs>
                <radialGradient id="corridorGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#1f3a2e" stopOpacity="0.10" />
                  <stop offset="100%" stopColor="#1f3a2e" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Corridor rings, one per anchor, sized by nothing more than
                  legibility. They are a visual grouping device, not a claim
                  about catchment. */}
              {GROWTH_ANCHORS.map((anchor) => {
                const p = project(anchor.lat, anchor.lng);
                return <circle key={`ring-${anchor.id}`} cx={p.x} cy={p.y} r={78} fill="url(#corridorGlow)" />;
              })}

              {/* City reference. Without it the pins float with no sense of
                  which way town is. */}
              <circle cx={city.x} cy={city.y} r={4.5} fill="#8a8578" />
              <text x={city.x + 10} y={city.y + 4} fontSize="12" fill="#6b6659" fontWeight="500">
                {CITY.label}
              </text>

              {GROWTH_ANCHORS.map((anchor) => {
                const p = project(anchor.lat, anchor.lng);
                const style = PIN_STYLE[anchor.certainty];
                const active = activeId === anchor.id;
                return (
                  <g key={anchor.id} opacity={activeId && !active ? 0.42 : 1} style={{ transition: "opacity 200ms" }}>
                    <line
                      x1={city.x}
                      y1={city.y}
                      x2={p.x}
                      y2={p.y}
                      stroke="#1f3a2e"
                      strokeOpacity={active ? 0.32 : 0.14}
                      strokeWidth={1.25}
                      strokeDasharray="4 5"
                    />
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={active ? 19 : 16}
                      fill={style.fill}
                      stroke={style.stroke}
                      strokeWidth={2}
                      strokeDasharray={style.dash}
                      style={{ transition: "r 200ms" }}
                    />
                    <text
                      x={p.x}
                      y={p.y + 4}
                      fontSize="11"
                      fontWeight="700"
                      textAnchor="middle"
                      fill={anchor.certainty === "under_evaluation" ? "#1f3a2e" : "#ffffff"}
                    >
                      {anchor.index}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        <div className="space-y-4">
          {GROWTH_ANCHORS.map((anchor) => (
            <article
              key={anchor.id}
              onMouseEnter={() => setActiveId(anchor.id)}
              onMouseLeave={() => setActiveId(null)}
              className="rounded-[1.5rem] border border-border/70 bg-white/70 p-6 transition-colors hover:border-primary/30 hover:bg-white/90"
            >
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-heading text-sm font-semibold text-muted-foreground/70">{anchor.index}</span>
                <span
                  className={`rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-[0.12em] ${CHIP_STYLE[anchor.certainty]}`}
                >
                  {anchor.chipLabel}
                </span>
              </div>

              <h3 className="mt-3 font-heading text-xl font-semibold leading-snug text-foreground">{anchor.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{anchor.place}</p>
              <p className="mt-4 text-sm leading-7 text-muted-foreground">{anchor.body}</p>

              <p className="mt-4 border-t border-border/60 pt-3 text-xs text-muted-foreground">
                Nearest listings: {anchor.nearestListings}
              </p>
            </article>
          ))}
        </div>
      </div>

      <div className="mt-10 border-t border-border/60 pt-8">
        <p className="max-w-3xl text-pretty text-sm leading-8 text-muted-foreground sm:text-base">
          Nobody can tell you exactly what land will be worth in ten years. What we can tell you is where the state is
          spending ₹2,800 crore, and that every plot on this site sits inside one of those three rings.
        </p>
        {/* TODO: when a defensible appreciation source exists, it is Kaveri
            guidance values. Public rate data for this belt is unreliable, so we
            ship no percentage rather than one we cannot stand behind. */}
        <Button asChild variant="pill" size="pill" className="mt-6">
          <Link href="/explore">
            See land in these corridors <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
