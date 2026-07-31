"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Clock, Maximize2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { CORE_REGIONS, isPlaced } from "@/lib/regions";
import type { RegionPin } from "@/components/v1/geography-map";

const GeographyMap = dynamic(() => import("@/components/v1/geography-map"), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full rounded-[1.75rem]" />,
});

/**
 * The villages we work in, as a list you can drive the map with.
 *
 * Clicking a name flies the map to it, which is the only reason this is a
 * client component: the list and the map have to share one piece of state.
 * Two of the villages have no usable coordinate from OpenStreetMap under any
 * spelling tried, so they are named but not plotted and not clickable — a pin
 * guessed from a place name would put a confident dot in the wrong field.
 */
export function GeographySection() {
  const pins: RegionPin[] = CORE_REGIONS.filter(isPlaced).map((region) => ({
    name: region.name,
    lat: region.lat,
    lng: region.lng,
  }));
  const [focus, setFocus] = useState<RegionPin | null>(null);
  const [resetKey, setResetKey] = useState(0);

  return (
    <section id="geography" className="scroll-mt-24 py-16 lg:py-20">
      <div className="mx-auto grid max-w-[1400px] gap-10 px-4 sm:px-6 lg:grid-cols-[minmax(0,24rem)_minmax(0,1fr)] lg:items-center lg:gap-14 lg:px-10">
        <div className="aa-slide-left">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">
            Our geography
          </p>
          <h2 className="mt-3 font-heading text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
            Every property we curate is within an easy weekend drive.
          </h2>
          <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            Target travel time <span className="font-semibold text-foreground">60 to 90 minutes</span>
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setFocus(null);
                setResetKey((k) => k + 1);
              }}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:border-accent/50 hover:text-accent"
            >
              <Maximize2 className="h-3 w-3" />
              Show all
            </button>
            <span className="text-[11px] text-muted-foreground">or pick a village</span>
          </div>

          <ul className="mt-3 flex flex-wrap gap-2">
            {CORE_REGIONS.map((region) => {
              if (!isPlaced(region)) {
                return (
                  <li
                    key={region.name}
                    className="rounded-full border border-dashed border-border px-3 py-1.5 text-xs font-medium text-muted-foreground"
                  >
                    {region.name}
                    <span className="ml-1.5 text-muted-foreground/70">· not plotted</span>
                  </li>
                );
              }
              const active = focus?.name === region.name;
              return (
                <li key={region.name}>
                  <button
                    type="button"
                    onClick={() =>
                      setFocus(
                        active ? null : { name: region.name, lat: region.lat, lng: region.lng }
                      )
                    }
                    aria-pressed={active}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                      active
                        ? "border-accent bg-accent text-accent-foreground"
                        : "border-border bg-background text-foreground hover:border-accent/50 hover:text-accent"
                    }`}
                  >
                    {region.name}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="aa-rise">
          {/* isolate: Leaflet numbers its panes in the 400-700 range, which
              outranks the sticky header without a stacking context here. */}
          <div className="relative isolate z-0 h-[22rem] overflow-hidden rounded-[1.75rem] sm:h-[26rem] lg:h-[30rem]">
            <GeographyMap pins={pins} focus={focus} onSelect={setFocus} resetKey={resetKey} />
          </div>
          <p className="mt-2.5 text-right text-[10px] leading-none text-muted-foreground/55">
            © OpenStreetMap contributors, © CARTO
          </p>
        </div>
      </div>
    </section>
  );
}
