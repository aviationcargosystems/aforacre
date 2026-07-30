import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FeaturedLandCarousel } from "@/components/featured-land-carousel";
import { SectionHeading } from "@/components/section-heading";
import { OurGeography } from "@/components/home/our-geography";
import { SouthBangaloreMapView } from "@/components/home/south-bangalore-map-view";
import { featuredProperties, getAllProperties } from "@/lib/store/properties";

export const dynamic = "force-dynamic";

/**
 * What is driving the corridor. `mapped` marks the three with confirmed sites,
 * which are the ones drawn on the map; the rest are real but not yet placeable,
 * so they are listed rather than plotted.
 */
const INFRASTRUCTURE = [
  { label: "New IIM Bengaluru campus", mapped: true },
  { label: "Upcoming international cricket stadium", mapped: true },
  { label: "Proposed Bengaluru international airport (south)", mapped: true },
  { label: "Satellite Town Ring Road (STRR)", mapped: false },
  { label: "Metro expansion", mapped: false },
  { label: "Future connectivity improvements", mapped: false },
];


export default async function Home() {
  const [featured, allProperties] = await Promise.all([featuredProperties(), getAllProperties()]);

  // One marker per area, not per plot. Several listings in the same village
  // should read as depth there rather than as clutter.
  const coverage = Array.from(
    allProperties.reduce((byArea, property) => {
      const key = property.location.area;
      const existing = byArea.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        byArea.set(key, {
          area: key,
          corridor: property.location.corridor,
          lat: property.location.lat,
          lng: property.location.lng,
          count: 1,
        });
      }
      return byArea;
    }, new Map<string, { area: string; corridor: string; lat: number; lng: number; count: number }>())
      .values()
  );
  const closingImage = featured[0]?.images[0];

  return (
    <div className="pb-16">
      {/* Ambient colour lives on one fixed, full-viewport layer below. Nothing
          in the page flow paints a background, so there is no boundary for a
          gradient to stop at and no seam to see. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        <div className="animate-drift-slow absolute left-[-12%] top-[-10%] h-[620px] w-[620px] rounded-full bg-accent/14 blur-3xl" />
        <div className="animate-drift-slower absolute right-[-10%] top-[6%] h-[560px] w-[560px] rounded-full bg-primary/12 blur-3xl" />
        <div className="animate-drift-slow absolute left-[30%] top-[48%] h-[460px] w-[460px] rounded-full bg-[#e0bd7c]/10 blur-3xl [animation-delay:-9s]" />
      </div>

      <div className="relative pt-16 sm:pt-24 lg:pt-32">
        {/* Centered hero. The old two-column split fought the display type for
            width and left the headline wrapping awkwardly at every breakpoint. */}
        <div className="mx-auto flex max-w-4xl flex-col items-center px-4 pb-6 text-center sm:px-6 lg:px-8">
          <h1 className="font-heading text-5xl font-semibold leading-[1.02] tracking-tight text-balance text-foreground sm:text-6xl lg:text-7xl">
            Buy lands in south Bengaluru!
          </h1>
          <p className="mt-6 font-heading text-xl font-medium tracking-tight text-foreground/70 sm:text-2xl">
            Discover. Own. Build. Grow.
          </p>
        </div>

        {/* No card, no border. The map is the section, not something sitting
            inside one. Infrastructure carries it; our listings are context. */}
        <div className="relative mt-14 lg:mt-20">
          <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
            {/* On a phone the map leads: the point of this section is where the
                corridor is, and a list of project names lands better once you
                have seen them placed. Side by side, reading order wins and the
                text goes first. */}
            <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
              <div className="order-2 lg:order-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">Why south Bengaluru</p>
                <h2 className="mt-3 font-heading text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
                  Everything being built south of Bengaluru.
                </h2>
                {/* A rule per item rather than a bullet or an index. Numbering
                    these would imply a sequence or a ranking, and there is
                    neither: they are six things happening at once. The rule
                    still carries the one distinction that matters, accent for
                    the three we can place on the map. */}
                <ul className="mt-8 grid gap-x-6 gap-y-6 sm:grid-cols-2">
                  {INFRASTRUCTURE.map((item) => (
                    <li
                      key={item.label}
                      className={`border-l-2 pl-4 ${item.mapped ? "border-accent/70" : "border-border"}`}
                    >
                      <span className="text-sm leading-6 text-foreground/80">{item.label}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-9">
                  <Button asChild variant="pill" size="pill" className="h-14 w-full px-10 text-base sm:w-auto">
                    <Link href="/match">
                      Find myself <ArrowRight className="ml-1.5 h-5 w-5" />
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="order-1 h-[46dvh] max-h-[21rem] sm:h-[22rem] sm:max-h-none lg:order-2 lg:h-[26rem]">
                <SouthBangaloreMapView areas={coverage} />
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Featured sits third, directly after the map: once someone has seen
          where the corridor is, the next honest question is what is actually
          for sale there. The corridor argument follows as supporting evidence. */}
      <section className="relative pb-24 pt-16 lg:pb-28 lg:pt-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <SectionHeading
              kicker="Live listings"
              title="Featured land"
              subtitle="Browse featured listings in a swipeable row instead of a static wall of cards."
            />
            <Button asChild variant="pill-outline" size="pill">
              <Link href="/explore">
                View all listings <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <FeaturedLandCarousel properties={featured} />
        </div>
      </section>

      {/* WhyThisCorridor is deliberately absent: it walked through the same
          three projects the map section above already covers, so on this page
          it was the argument made twice. The component still ships and still
          carries the airport's "Site not yet finalised." clause wherever it is
          used. */}
      <OurGeography />

      {closingImage && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[2.25rem] border border-white/70 shadow-[0_30px_90px_rgba(15,23,42,0.18)]">
            <div className="relative h-[420px] w-full">
              <Image src={closingImage} alt="South Bangalore farmland" fill sizes="100vw" className="object-cover" />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,18,14,0.10)_0%,rgba(8,18,14,0.22)_35%,rgba(8,18,14,0.72)_100%)]" />
              <div className="relative mx-auto flex h-full max-w-4xl flex-col items-center justify-center px-4 text-center text-white sm:px-6 lg:px-8">
                <Badge className="bg-white/15 text-white">Ready to explore</Badge>
                <h2 className="mt-5 max-w-2xl font-heading text-4xl font-semibold leading-tight sm:text-5xl">
                  Let&apos;s find the land you&apos;ve been picturing.
                </h2>
                <p className="mx-auto mt-4 max-w-2xl text-pretty text-white/84 sm:text-lg">
                  From a weekend escape to a working farm, it starts with one conversation.
                </p>
                <Button asChild variant="pill" size="pill" className="mt-8">
                  <Link href="/explore">
                    Explore all land <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
