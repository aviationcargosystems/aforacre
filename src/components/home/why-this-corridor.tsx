"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { GROWTH_ANCHORS, type AnchorCertainty, type AnchorId } from "@/lib/anchors";
import { Button } from "@/components/ui/button";

/**
 * A lightweight schematic rather than a tile map. Three fixed projects do not
 * justify a mapping dependency or network requests on the homepage.
 */

const BOUNDS = { minLat: 12.56, maxLat: 13.05, minLng: 77.4, maxLng: 77.78 };
const VIEW = { w: 440, h: 560 };
const CITY = { lat: 12.9716, lng: 77.5946, label: "Bengaluru" };

function project(lat: number, lng: number) {
  const x = ((lng - BOUNDS.minLng) / (BOUNDS.maxLng - BOUNDS.minLng)) * VIEW.w;
  const y = ((BOUNDS.maxLat - lat) / (BOUNDS.maxLat - BOUNDS.minLat)) * VIEW.h;
  return { x, y };
}

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
    <section className="mx-auto max-w-[1200px] px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
      <div className="grid gap-5 border-t border-foreground/10 pt-8 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,0.72fr)] lg:items-end">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">
            Why South Bangalore, why now
          </p>
          <h2 className="mt-3 max-w-2xl font-heading text-4xl font-semibold leading-[1.04] text-foreground sm:text-5xl">
            Three public projects. One focused search area.
          </h2>
        </div>
        <p className="max-w-xl text-pretty text-sm leading-7 text-muted-foreground sm:text-base">
          We only list land inside three corridors where public investment is already committed or actively being
          evaluated.
        </p>
      </div>

      <div className="mt-10 overflow-hidden rounded-[1.5rem] border border-foreground/10 bg-white/45">
        <div className="grid lg:grid-cols-[0.82fr_1.18fr]">
          <div className="relative min-h-[18rem] overflow-hidden border-b border-foreground/10 bg-[#f3efe6]/65 lg:min-h-[32rem] lg:border-b-0 lg:border-r">
            <div className="absolute left-5 top-5 z-10">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Southward</p>
              <p className="mt-1 font-heading text-lg font-semibold text-foreground">From Bengaluru</p>
            </div>

            <svg
              viewBox={`0 0 ${VIEW.w} ${VIEW.h}`}
              className="absolute inset-0 h-full w-full"
              role="img"
              aria-label="Schematic showing Bengaluru and the three southern growth anchors"
            >
              <path
                d={`M ${city.x} ${city.y} C ${city.x - 8} ${city.y + 80}, ${city.x - 12} ${city.y + 155}, 110 525`}
                fill="none"
                stroke="#1f3a2e"
                strokeOpacity="0.12"
                strokeWidth="1.25"
                strokeDasharray="3 7"
              />
              <circle cx={city.x} cy={city.y} r={4} fill="#8a8578" />
              <text x={city.x + 10} y={city.y + 4} fontSize="12" fill="#6b6659" fontWeight="500">
                {CITY.label}
              </text>

              {GROWTH_ANCHORS.map((anchor) => {
                const p = project(anchor.lat, anchor.lng);
                const style = PIN_STYLE[anchor.certainty];
                const active = activeId === anchor.id;

                return (
                  <g
                    key={anchor.id}
                    opacity={activeId && !active ? 0.3 : 1}
                    style={{ transition: "opacity 180ms ease" }}
                  >
                    <line
                      x1={city.x}
                      y1={city.y}
                      x2={p.x}
                      y2={p.y}
                      stroke="#1f3a2e"
                      strokeOpacity={active ? 0.34 : 0.12}
                      strokeWidth={active ? 1.5 : 1}
                      strokeDasharray="3 6"
                    />
                    {active && <circle cx={p.x} cy={p.y} r={25} fill="#1f3a2e" fillOpacity="0.07" />}
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={active ? 16 : 13}
                      fill={style.fill}
                      stroke={style.stroke}
                      strokeWidth={2}
                      strokeDasharray={style.dash}
                      style={{ transition: "r 180ms ease" }}
                    />
                    <text
                      x={p.x}
                      y={p.y + 3.5}
                      fontSize="9"
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

          <div className="divide-y divide-foreground/10">
            {GROWTH_ANCHORS.map((anchor) => (
              <article
                key={anchor.id}
                onMouseEnter={() => setActiveId(anchor.id)}
                onMouseLeave={() => setActiveId(null)}
                onFocus={() => setActiveId(anchor.id)}
                onBlur={() => setActiveId(null)}
                tabIndex={0}
                className="group grid gap-4 p-5 outline-none transition-colors hover:bg-white/55 focus-visible:bg-white/70 sm:grid-cols-[2rem_1fr] sm:p-7"
              >
                <span className="font-heading text-sm font-semibold text-muted-foreground/55">{anchor.index}</span>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-1 text-[9px] font-semibold tracking-[0.12em] ${CHIP_STYLE[anchor.certainty]}`}
                    >
                      {anchor.chipLabel}
                    </span>
                    <span className="text-xs text-muted-foreground">{anchor.place}</span>
                  </div>
                  <h3 className="mt-3 font-heading text-xl font-semibold leading-snug text-foreground">
                    {anchor.title}
                  </h3>
                  <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">{anchor.body}</p>
                  <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.1em] text-muted-foreground/75">
                    Near {anchor.nearestListings}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-7 flex flex-col gap-5 border-b border-foreground/10 pb-8 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-3xl text-pretty text-sm leading-7 text-muted-foreground">
          Nobody can tell you exactly what land will be worth in ten years. What we can tell you is where the state is
          spending ₹2,800 crore, and that every plot on this site sits inside one of those three rings.
        </p>
        <Button asChild variant="pill" size="pill" className="shrink-0 self-start sm:self-auto">
          <Link href="/explore">
            See the corridors <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
