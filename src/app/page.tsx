import Link from "next/link";
import Image from "next/image";
import { ArrowRight, MapPin, ShieldCheck, Sprout, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { JourneyCard } from "@/components/journey-card";
import { FeaturedLandCarousel } from "@/components/featured-land-carousel";
import { ScrollToSectionButton } from "@/components/scroll-to-section-button";
import { ProfessionalCard } from "@/components/professional-card";
import { SectionHeading } from "@/components/section-heading";
import { journeys } from "@/data/journeys";
import { getAllProperties, featuredProperties } from "@/lib/store/properties";
import { getAllProfessionals } from "@/lib/store/professionals";
import { HeroVideo } from "@/components/hero-video";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [allProperties, featured, professionals] = await Promise.all([
    getAllProperties(),
    featuredProperties(),
    getAllProfessionals(),
  ]);

  const spotlightProfessionals = professionals.filter((p) => p.category !== "broker").slice(0, 4);
  const totalAcres = Math.round(allProperties.reduce((sum, property) => sum + property.extentAcres, 0));
  const closingImage = journeys[0]?.heroImage ?? featured[0]?.images[0];

  return (
    <div className="pb-16">
      <section className="relative isolate overflow-hidden pt-8 sm:pt-10">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-[-8%] top-0 h-[520px] w-[520px] rounded-full bg-accent/12 blur-3xl" />
          <div className="absolute right-[-6%] top-20 h-[460px] w-[460px] rounded-full bg-primary/12 blur-3xl" />
        </div>

        <div className="mx-auto grid grid-cols-1 max-w-7xl gap-8 px-4 pb-10 sm:px-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:px-8 lg:pb-16">
          <div className="max-w-2xl space-y-7">
            <div className="space-y-5">
              <h1 className="max-w-3xl font-heading text-6xl font-semibold leading-[0.96] tracking-tight text-foreground sm:text-7xl lg:text-8xl xl:text-[6.5rem]">
                Land that fits your life.
              </h1>
              <p className="max-w-2xl text-pretty text-lg leading-8 text-muted-foreground sm:text-xl">
                Farmland, farmhouse plots, and weekend escapes across South Bangalore, matched to how you&apos;ll
                actually use them.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <Button asChild variant="pill" size="pill" className="w-full sm:w-auto">
                <Link href="/explore">
                  Explore all land <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <ScrollToSectionButton targetId="journeys" className="w-full sm:w-auto">
                Start with a journey
              </ScrollToSectionButton>
            </div>

            <div className="-mx-4 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:overflow-visible sm:px-0 sm:pb-0">
              <div className="flex w-max gap-2 sm:w-auto sm:flex-wrap">
                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border/70 bg-white/65 px-3 py-1.5 text-xs font-medium text-foreground/80 backdrop-blur-sm">
                  <Sprout className="h-3.5 w-3.5 text-primary" /> Search by use case
                </span>
                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border/70 bg-white/65 px-3 py-1.5 text-xs font-medium text-foreground/80 backdrop-blur-sm">
                  <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Tax &amp; legal
                </span>
                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border/70 bg-white/65 px-3 py-1.5 text-xs font-medium text-foreground/80 backdrop-blur-sm">
                  <Wrench className="h-3.5 w-3.5 text-primary" /> Setup help on tap
                </span>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 translate-x-4 translate-y-4 rounded-[2.25rem] bg-deep-green/10 blur-2xl" />
            <div className="relative overflow-hidden rounded-[2.25rem] border border-white/70 bg-white/70 shadow-[0_30px_90px_rgba(15,23,42,0.18)] backdrop-blur-xl">
              <div className="relative aspect-[4/5] min-h-[420px] sm:min-h-[540px]">
                <HeroVideo poster="/videos/hero-poster.jpg" />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,18,14,0.10)_0%,rgba(8,18,14,0.20)_40%,rgba(8,18,14,0.78)_100%)]" />
                <div className="absolute inset-x-4 bottom-4 rounded-[1.5rem] border border-white/15 bg-white/10 p-4 text-white backdrop-blur-xl">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/65">
                        A for Acre
                      </p>
                      <p className="mt-1 font-heading text-xl font-semibold">Calm, practical, reliable.</p>
                    </div>
                    <Badge className="bg-white/15 text-white">Live listing data</Badge>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <div className="rounded-2xl bg-white/10 p-3">
                      <p className="text-[11px] uppercase tracking-[0.14em] text-white/55">Listings</p>
                      <p className="mt-1 font-heading text-lg font-semibold">{allProperties.length}</p>
                    </div>
                    <div className="rounded-2xl bg-white/10 p-3">
                      <p className="text-[11px] uppercase tracking-[0.14em] text-white/55">Acres</p>
                      <p className="mt-1 font-heading text-lg font-semibold">{totalAcres}+</p>
                    </div>
                    <div className="rounded-2xl bg-white/10 p-3">
                      <p className="text-[11px] uppercase tracking-[0.14em] text-white/55">Journeys</p>
                      <p className="mt-1 font-heading text-lg font-semibold">{journeys.length}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="journeys" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeading
          align="center"
          className="mx-auto mb-12"
          kicker="Start here"
          title="Choose your journey"
          subtitle="Every buyer arrives with a different intent. Tell us which one is yours and we'll surface land, checklists, and professionals matched to it."
        />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {journeys.map((journey) => (
            <JourneyCard key={journey.id} journey={journey} />
          ))}
        </div>
      </section>

      <section className="relative py-20">
        <div className="absolute inset-x-0 top-1/2 -z-10 h-[420px] -translate-y-1/2 bg-[radial-gradient(circle_at_center,rgba(87,168,132,0.12),transparent_60%)]" />
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

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeading
          align="center"
          className="mx-auto mb-14"
          kicker="Why A for Acre"
          title="Buying land should not feel like guesswork."
          subtitle="We surface the details that actually decide whether a plot works for you."
        />
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <Card className="p-6">
            <CardContent className="space-y-4 p-0">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <MapPin className="h-6 w-6" />
              </div>
              <h3 className="font-heading text-2xl font-semibold">Real land suitability</h3>
              <p className="text-sm leading-7 text-muted-foreground">
                Every plot is scored for polyhouse, farming, farmhouse living, and getaway use - not just listed with
                a price.
              </p>
            </CardContent>
          </Card>

          <Card className="p-6">
            <CardContent className="space-y-4 p-0">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="font-heading text-2xl font-semibold">Karnataka tax, upfront</h3>
              <p className="text-sm leading-7 text-muted-foreground">
                Stamp duty, registration, and DC conversion charges calculated per property - no surprises at the
                registrar&apos;s office.
              </p>
            </CardContent>
          </Card>

          <Card className="p-6">
            <CardContent className="space-y-4 p-0">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Wrench className="h-6 w-6" />
              </div>
              <h3 className="font-heading text-2xl font-semibold">Setup help, on tap</h3>
              <p className="text-sm leading-7 text-muted-foreground">
                Solar, irrigation, borewell, and construction professionals matched to your plot and journey.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="relative py-20">
        <div className="absolute inset-x-0 bottom-0 -z-10 h-[380px] bg-[radial-gradient(circle_at_center,rgba(201,110,69,0.10),transparent_60%)]" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <SectionHeading
              kicker="Trusted network"
              title="Professionals ready to help"
              subtitle="Vetted specialists who set up land across South Bangalore, every day."
            />
            <Button asChild variant="pill-outline" size="pill">
              <Link href="/professionals">
                Browse all professionals <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {spotlightProfessionals.map((professional) => (
              <ProfessionalCard key={professional.slug} professional={professional} />
            ))}
          </div>
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
