import Link from "next/link";
import { ArrowRight, MapPin, ShieldCheck, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JourneyCard } from "@/components/journey-card";
import { PropertyCard } from "@/components/property-card";
import { ProfessionalCard } from "@/components/professional-card";
import { journeys } from "@/data/journeys";
import { featuredProperties } from "@/lib/store/properties";
import { getAllProfessionals } from "@/lib/store/professionals";
import { HeroVideo } from "@/components/hero-video";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [featured, professionals] = await Promise.all([featuredProperties(), getAllProfessionals()]);
  const spotlightProfessionals = professionals.slice(0, 4);

  return (
    <div>
      {/* Hero */}
      <section className="relative h-[92vh] min-h-[560px] overflow-hidden">
        <div className="absolute inset-0">
          <HeroVideo poster="/videos/hero-poster.jpg" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/25 to-black/55" />
        </div>
        <div className="relative mx-auto flex h-full max-w-4xl flex-col items-center justify-center px-4 text-center sm:px-6 lg:px-8">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-white/90">
            <MapPin className="h-3.5 w-3.5" /> South Bangalore&apos;s Trusted Farmland Marketplace
          </span>
          <h1 className="mt-5 font-heading text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
            Find land that fits your life, not the other way around
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-white/85">
            Whether it&apos;s a polyhouse farm, a scaled-up commercial plot, a quiet retirement patch, or a weekend
            escape — start with what you want to do, and we&apos;ll show you the land, taxes, and professionals to make it happen.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Link href="/explore">
                Explore all land <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" className="bg-deep-green text-white hover:bg-deep-green/90">
              <Link href="#journeys">Plan your journey</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Journeys */}
      <section id="journeys" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-2 text-center">
          <h2 className="font-heading text-3xl font-semibold text-foreground">Choose your journey</h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Every buyer arrives with a different intent. Tell us which one is yours and we&apos;ll surface land, checklists, and professionals matched to it.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {journeys.map((journey) => (
            <JourneyCard key={journey.id} journey={journey} />
          ))}
        </div>
      </section>

      {/* Featured properties */}
      <section className="bg-secondary/40 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-heading text-3xl font-semibold text-foreground">Featured land</h2>
              <p className="mt-1 text-muted-foreground">A cross-section of what&apos;s available across South Bangalore right now.</p>
            </div>
            <Button asChild variant="outline">
              <Link href="/explore">
                View all listings <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((property) => (
              <PropertyCard key={property.slug} property={property} />
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h2 className="font-heading text-3xl font-semibold text-foreground">Buying land shouldn&apos;t be a guessing game</h2>
          <p className="mx-auto mt-2 max-w-2xl text-muted-foreground">
            We surface the details that actually decide whether a plot works for you.
          </p>
        </div>
        <div className="grid gap-8 sm:grid-cols-3">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <MapPin className="h-6 w-6" />
            </div>
            <h3 className="mt-4 font-heading text-lg font-semibold">Real land suitability</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Every plot is scored for polyhouse, farming, farmhouse living, and getaway use — not just listed with a price.
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="mt-4 font-heading text-lg font-semibold">Karnataka tax, upfront</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Stamp duty, registration, and DC conversion charges calculated per property — no surprises at the registrar&apos;s office.
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Wrench className="h-6 w-6" />
            </div>
            <h3 className="mt-4 font-heading text-lg font-semibold">Set-up help, on tap</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Solar, irrigation, borewell, and construction professionals matched to your plot and journey.
            </p>
          </div>
        </div>
      </section>

      {/* Professionals spotlight */}
      <section className="bg-secondary/40 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-heading text-3xl font-semibold text-foreground">Professionals ready to help</h2>
              <p className="mt-1 text-muted-foreground">Vetted specialists who set up land across South Bangalore, every day.</p>
            </div>
            <Button asChild variant="outline">
              <Link href="/professionals">
                Browse all professionals <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {spotlightProfessionals.map((professional) => (
              <ProfessionalCard key={professional.slug} professional={professional} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
