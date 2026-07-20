import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { journeys, getJourney } from "@/data/journeys";
import { propertiesForJourney } from "@/lib/store/properties";
import { getAllProfessionals } from "@/lib/store/professionals";
import { PropertyCard } from "@/components/property-card";
import { ProfessionalCard } from "@/components/professional-card";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return journeys.map((journey) => ({ slug: journey.id }));
}

export default async function JourneyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const journey = getJourney(slug);
  if (!journey) notFound();

  const [matches, professionals] = await Promise.all([propertiesForJourney(journey.id, 6), getAllProfessionals()]);
  const matchedProfessionals = professionals.filter((p) => journey.relevantProfessionalCategories.includes(p.category)).slice(0, 4);

  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image src={journey.heroImage} alt={journey.title} fill priority sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/55 to-background" />
        </div>
        <div className="relative mx-auto max-w-4xl px-4 py-24 text-center sm:px-6 lg:px-8">
          <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white backdrop-blur">
            {journey.accentTag}
          </span>
          <h1 className="mt-4 font-heading text-4xl font-semibold text-white sm:text-5xl">{journey.title}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/85">{journey.description}</p>
          <Button asChild size="lg" className="mt-7 bg-accent text-accent-foreground hover:bg-accent/90">
            <Link href={`/explore?journey=${journey.id}`}>
              See matching land <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="font-heading text-2xl font-semibold text-foreground">What this land needs to have</h2>
            <ul className="mt-4 space-y-3">
              {journey.whatToLookFor.map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <span className="text-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl bg-secondary/50 p-6">
            <h3 className="font-heading text-lg font-semibold text-foreground">Frequently asked</h3>
            <Accordion type="single" collapsible className="mt-2">
              {journey.faqs.map((faq, i) => (
                <AccordionItem key={faq.question} value={`item-${i}`}>
                  <AccordionTrigger className="text-left text-sm font-medium">{faq.question}</AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      <section className="bg-secondary/40 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-heading text-3xl font-semibold text-foreground">Best matches for {journey.shortTitle.toLowerCase()}</h2>
              <p className="mt-1 text-muted-foreground">Ranked by fit score for this journey.</p>
            </div>
            <Button asChild variant="outline">
              <Link href={`/explore?journey=${journey.id}`}>
                See all matches <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {matches.map((property) => (
              <PropertyCard
                key={property.slug}
                property={property}
                highlightJourney={`${property.journeyFit[journey.id]}% match`}
              />
            ))}
          </div>
        </div>
      </section>

      {matchedProfessionals.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="font-heading text-3xl font-semibold text-foreground">Professionals for this journey</h2>
            <p className="mt-1 text-muted-foreground">
              Once you have land, these specialists help you set it up for {journey.shortTitle.toLowerCase()}.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {matchedProfessionals.map((professional) => (
              <ProfessionalCard key={professional.slug} professional={professional} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
