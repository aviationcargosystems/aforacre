import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FeaturedLandCarousel } from "@/components/featured-land-carousel";
import { SectionHeading } from "@/components/section-heading";
import { WhyThisCorridor } from "@/components/home/why-this-corridor";
import { featuredProperties } from "@/lib/store/properties";
import { HeroVideo } from "@/components/hero-video";

export const dynamic = "force-dynamic";


export default async function Home() {
  const featured = await featuredProperties();
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
          <h1 className="font-heading text-6xl font-semibold leading-[0.96] tracking-tight text-balance text-foreground sm:text-7xl lg:text-8xl">
            Land that fits your life.
          </h1>
          <p className="mt-8 max-w-2xl text-pretty text-lg leading-8 text-muted-foreground sm:text-xl">
            Holistic farmland, farmhouse plots, and weekend escapes across South Bangalore, matched to how
            you&apos;ll actually use them.
          </p>

          {/* No search box. With this few listings a search returns either
              everything or nothing, and it hands the buyer a job the match flow
              is meant to do for them. */}
          <div className="mt-11 grid w-full max-w-md grid-cols-1 gap-3 sm:grid-cols-2">
            <Button asChild variant="pill" size="pill" className="w-full">
              <Link href="/match">
                Find land <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="pill-outline" size="pill" className="w-full">
              <Link href="/explore">See every plot</Link>
            </Button>
          </div>

        </div>

        {/* Second block. No separate background: it sits inside the same
          gradient wrapper as the hero so the colour runs straight through
          instead of stopping at a section edge. Narrower than before and
          dimmed, because it is atmosphere behind the page, not a banner
          asking to be read. */}
        <div className="relative px-4 pb-20 pt-14 sm:px-6 lg:px-8 lg:pb-28 lg:pt-20">
          <div className="relative mx-auto max-w-[52rem]">
            <div className="relative overflow-hidden rounded-[1.75rem] border border-white/60 shadow-[0_24px_60px_rgba(15,23,42,0.16)] sm:rounded-[2rem]">
              <div className="relative aspect-video">
                <HeroVideo poster="/videos/hero-poster.jpg" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(8,18,14,0.52)_0%,rgba(8,18,14,0.34)_55%,rgba(8,18,14,0.20)_100%)]" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <WhyThisCorridor />

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
