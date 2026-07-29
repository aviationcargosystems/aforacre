import Link from "next/link";
import { ArrowUpRight, Clock } from "lucide-react";
import { CORE_REGIONS, isPlaced } from "@/lib/regions";
import { RegionMiniMap } from "./region-mini-map";
import { DragRail } from "@/components/drag-rail";

/**
 * The belt we actually work in, shown rather than listed.
 *
 * Before anyone can care what a plot costs, they need to know where it is. A
 * row of place names asks the reader to already know south Bangalore geography;
 * a thumbnail with a pin does not. Each card opens the listings for that region.
 *
 * Regions we have no verified coordinate for still appear, as plain chips. The
 * alternative was dropping them from the page or inventing a pin, and both are
 * worse than a name without a picture.
 */

export function OurGeography() {
  const placed = CORE_REGIONS.filter(isPlaced);
  const unplaced = CORE_REGIONS.filter((region) => !isPlaced(region));

  return (
    <section className="mx-auto max-w-[1200px] px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
      <div className="max-w-3xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">Our geography</p>
        <h2 className="mt-3 font-heading text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
          Every property we curate is within an easy weekend drive from Bengaluru.
        </h2>
        <div className="mt-6 inline-flex items-center gap-2.5 rounded-full border border-border/70 bg-white/80 px-4 py-2.5">
          <Clock className="h-4 w-4 shrink-0 text-primary" />
          <span className="text-sm text-muted-foreground">
            Target travel time <span className="font-semibold text-foreground">60 to 90 minutes</span>
          </span>
        </div>
      </div>

      {/* A rail rather than a grid. Nine regions wrap into an uneven last row
          at every breakpoint, and the ones that fall off the end read as less
          important than the ones that fit. Scrolling keeps them equal. */}
      <DragRail className="mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {placed.map((region) => (
          <div key={region.name} className="w-[min(60vw,220px)] shrink-0 snap-start">
            <Link
              href={`/explore?q=${encodeURIComponent(region.name)}`}
              className="group block overflow-hidden rounded-[1.25rem] border border-border/70 bg-white/80 transition-all hover:border-primary/35 hover:bg-white hover:shadow-[0_12px_32px_rgba(15,23,42,0.10)]"
            >
              <div className="relative aspect-[4/3] w-full">
                <RegionMiniMap lat={region.lat} lng={region.lng} />
              </div>
              <div className="flex items-center justify-between gap-2 px-3.5 py-3">
                <span className="min-w-0 truncate text-sm font-medium text-foreground/90">{region.name}</span>
                <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </Link>
          </div>
        ))}
      </DragRail>

      {unplaced.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-2">
          {unplaced.map((region) => (
            <li key={region.name}>
              <Link
                href={`/explore?q=${encodeURIComponent(region.name)}`}
                className="group inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-white/80 px-4 py-2.5 text-sm text-foreground/85 transition-colors hover:border-primary/35 hover:bg-white hover:text-foreground"
              >
                {region.name}
                <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
