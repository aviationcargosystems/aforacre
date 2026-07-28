import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  BadgeCheck,
  Clock,
  LayoutGrid,
  Map as MapIcon,
  MapPin,
  Route,
  Search,
  ShieldCheck,
  Sprout,
  TrendingUp,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { FeaturedLandCarousel } from "@/components/featured-land-carousel";
import { SectionHeading } from "@/components/section-heading";
import { featuredProperties } from "@/lib/store/properties";
import { HeroVideo } from "@/components/hero-video";

export const dynamic = "force-dynamic";

const HOLISTIC_CRITERIA = [
  { icon: Sprout, title: "Rich soil", description: "Fertile land, ready to grow." },
  {
    icon: LayoutGrid,
    title: "Fit for everything",
    description: "Room for a polyhouse, garden, pet house, container home, and staff quarters, all in one plot.",
  },
  { icon: Route, title: "Real road access", description: "Every plot reachable by vehicle, no guesswork." },
  { icon: Clock, title: "1 to 1.5 hrs from the city", description: "Close enough for a weekend, far enough to feel like an escape." },
  { icon: TrendingUp, title: "Built to appreciate", description: "Selected for long-term land value, not just today's price." },
];

export default async function Home() {
  const featured = await featuredProperties();
  const closingImage = featured[0]?.images[0];

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
                Holistic farmland, farmhouse plots, and weekend escapes across South Bangalore, matched to how
                you&apos;ll actually use them.
              </p>
            </div>

            <form action="/explore" className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  name="q"
                  placeholder="Search location, land type, or use case — e.g. rental farmland"
                  className="w-full rounded-full border border-border/70 bg-white/80 py-3 pl-11 pr-4 text-sm text-foreground shadow-sm outline-none backdrop-blur-sm focus-visible:ring-3 focus-visible:ring-ring/50"
                />
              </div>
              <div className="flex gap-2.5">
                <Button type="submit" variant="pill" size="pill" className="flex-1 sm:flex-none">
                  Search <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
                <Button asChild variant="pill-outline" size="pill" className="flex-1 sm:flex-none">
                  <Link href="/explore">
                    <MapIcon className="mr-1.5 h-4 w-4" /> Map
                  </Link>
                </Button>
              </div>
            </form>

            <Link href="/match" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
              Not sure yet? Take our 2-minute match quiz <ArrowRight className="h-3.5 w-3.5" />
            </Link>

            <div className="-mx-4 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:overflow-visible sm:px-0 sm:pb-0">
              <div className="flex w-max gap-2 sm:w-auto sm:flex-wrap">
                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border/70 bg-white/65 px-3 py-1.5 text-xs font-medium text-foreground/80 backdrop-blur-sm">
                  <Sprout className="h-3.5 w-3.5 text-primary" /> Search by use case
                </span>
                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border/70 bg-white/65 px-3 py-1.5 text-xs font-medium text-foreground/80 backdrop-blur-sm">
                  <Wrench className="h-3.5 w-3.5 text-primary" /> Setup help on tap
                </span>
                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border/70 bg-white/65 px-3 py-1.5 text-xs font-medium text-foreground/80 backdrop-blur-sm">
                  <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Tax &amp; legal
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
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/65">
                        A for Acre
                      </p>
                      <p className="mt-1 font-heading text-xl font-semibold">
                        Verified before it reaches you.
                      </p>
                    </div>
                    <Badge className="bg-white/15 text-white">Minimum 1 acre</Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading
          align="center"
          className="mx-auto mb-10"
          kicker="What makes land holistic"
          title="Every plot we list, checked against five things."
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {HOLISTIC_CRITERIA.map((item) => (
            <div key={item.title} className="rounded-2xl border border-border/70 bg-white/70 p-5 text-center backdrop-blur-sm">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <item.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-3 font-heading text-base font-semibold text-foreground">{item.title}</h3>
              <p className="mt-1.5 text-xs leading-6 text-muted-foreground">{item.description}</p>
            </div>
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
                <BadgeCheck className="h-6 w-6" />
              </div>
              <h3 className="font-heading text-2xl font-semibold">Verified before it&apos;s listed</h3>
              <p className="text-sm leading-7 text-muted-foreground">
                Ownership, survey, GPS, road access, documents, and a physical site visit - checked by our team before
                a plot gets its Farm ID.
              </p>
            </CardContent>
          </Card>
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
