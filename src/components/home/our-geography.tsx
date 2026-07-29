import Link from "next/link";
import { ArrowUpRight, Clock } from "lucide-react";

/**
 * The belt we actually work in, named.
 *
 * "South Bangalore" is too vague to mean anything to someone deciding where to
 * spend a crore. Naming the villages is the specific version of the same claim,
 * and it is checkable.
 *
 * Each region links into explore with that name as the query rather than
 * carrying its own map. Per-region maps are a later step; a chip that leads
 * nowhere would be worse than a chip that leads to the listings.
 */

const CORE_REGIONS = [
  "Harohalli",
  "Maralavadi",
  "Dodda Maralavadi",
  "Thattekere",
  "Kaggalipura",
  "Kalanakuppe",
  "Sheetalwadi",
  "Anekal interiors",
  "Bannerghatta surroundings",
];

export function OurGeography() {
  return (
    <section className="mx-auto max-w-[1200px] px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
      <div className="overflow-hidden rounded-[1.5rem] border border-foreground/10 bg-white/55">
        <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
          <div className="border-b border-foreground/10 p-7 sm:p-9 lg:border-b-0 lg:border-r">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">Our geography</p>
            <h2 className="mt-3 font-heading text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
              Every property we curate is within an easy weekend drive from Bengaluru.
            </h2>

            <div className="mt-7 inline-flex items-center gap-2.5 rounded-full border border-border/70 bg-white/80 px-4 py-2.5">
              <Clock className="h-4 w-4 shrink-0 text-primary" />
              <span className="text-sm text-muted-foreground">
                Target travel time <span className="font-semibold text-foreground">60 to 90 minutes</span>
              </span>
            </div>
          </div>

          <div className="p-7 sm:p-9">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Core regions</p>

            <ul className="mt-5 flex flex-wrap gap-2">
              {CORE_REGIONS.map((region) => (
                <li key={region}>
                  <Link
                    href={`/explore?q=${encodeURIComponent(region)}`}
                    className="group inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-white/80 px-4 py-2.5 text-sm text-foreground/85 transition-colors hover:border-primary/35 hover:bg-white hover:text-foreground"
                  >
                    {region}
                    <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>
                </li>
              ))}
            </ul>

            <p className="mt-6 text-sm leading-7 text-muted-foreground">
              We do not list outside this belt. If a plot is further out than a weekend drive, it is somebody else&apos;s
              listing.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
