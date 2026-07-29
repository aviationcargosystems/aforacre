import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FeaturedLandCarousel } from "@/components/featured-land-carousel";
import { SectionHeading } from "@/components/section-heading";
import { WhyThisCorridor } from "@/components/home/why-this-corridor";
import { SouthBangaloreMapView } from "@/components/home/south-bangalore-map-view";
import { featuredProperties, getAllProperties } from "@/lib/store/properties";

export const dynamic = "force-dynamic";


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
            Buy holistic lands in south Bengaluru!
          </h1>
          <p className="mt-7 max-w-3xl text-pretty text-lg leading-8 text-muted-foreground sm:text-xl sm:leading-9">
            Within a comfortable 90 minute drive from the city lies an extraordinary landscape of forests, lakes,
            hills and fertile farmland that many Bengaluru residents have never explored.
          </p>

          {/* One CTA. A second button beside it splits attention at the exact
              moment we want a single decision, and everything on this page
              already leads somewhere. */}
          <div className="mt-11 w-full sm:w-auto">
            <Button asChild variant="pill" size="pill" className="h-14 w-full px-10 text-base sm:w-auto">
              <Link href="/match">
                Find myself <ArrowRight className="ml-1.5 h-5 w-5" />
              </Link>
            </Button>
          </div>

        </div>

        {/* Coverage map, in the floating slot the video used to hold. Where we
            operate is a better second beat than atmosphere: it answers "is this
            near me" before anyone has to scroll. */}
        <div className="relative px-4 pb-20 pt-10 sm:px-6 lg:px-8 lg:pb-28 lg:pt-14">
          <div className="relative mx-auto max-w-5xl">
            <div className="absolute inset-x-12 -bottom-8 h-24 rounded-[3rem] bg-deep-green/20 blur-3xl" />
            <div className="relative overflow-hidden rounded-[1.75rem] border border-white/70 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.20)] sm:rounded-[2rem]">
              <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border/60 px-5 py-4 sm:px-7">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">Where we operate</p>
                  <h2 className="mt-1 font-heading text-xl font-semibold text-foreground sm:text-2xl">
                    Every plot, south of the city
                  </h2>
                </div>
                <p className="text-xs text-muted-foreground">
                  {coverage.length} {coverage.length === 1 ? "area" : "areas"} across Kanakapura, Bannerghatta, Sarjapur
                  and Anekal
                </p>
              </div>
              <div className="h-[22rem] sm:h-[30rem]">
                <SouthBangaloreMapView areas={coverage} />
              </div>
            </div>
          </div>
        </div>

        <WhyThisCorridor />

      </div>

      <section className="relative pb-24 pt-4 lg:pb-28">
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
