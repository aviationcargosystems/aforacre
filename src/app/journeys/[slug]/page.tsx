import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { journeys, getJourney } from "@/data/journeys";
import { propertiesForJourney } from "@/lib/store/properties";
import { getAllProfessionals } from "@/lib/store/professionals";
import { PropertyCard } from "@/components/property-card";
import { ProfessionalCard } from "@/components/professional-card";
import { SectionHeading } from "@/components/section-heading";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return journeys.map((journey) => ({ slug: journey.id }));
}

export default async function JourneyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const journey = getJourney(slug);
  if (!journey) notFound();

  const [matches, professionals] = await Promise.all([propertiesForJourney(journey.id, 6), getAllProfessionals()]);
  const matchedProfessionals = professionals
    .filter((professional) => journey.relevantProfessionalCategories.includes(professional.category))
    .slice(0, 4);

  return (
    <div className="pb-16">
      <section className="relative isolate overflow-hidden pt-8">
        <div className="absolute inset-0 -z-10">
          <Image src={journey.heroImage} alt={journey.title} fill priority sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,18,14,0.18)_0%,rgba(8,18,14,0.45)_40%,rgba(8,18,14,0.82)_100%)]" />
        </div>
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-20 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-end lg:px-8 lg:py-24">
          <div className="max-w-3xl text-white">
            <Badge className="bg-white/15 text-white">{journey.accentTag}</Badge>
            <h1 className="mt-5 font-heading text-5xl font-semibold leading-[0.96] tracking-tight sm:text-6xl lg:text-7xl">
              {journey.title}
            </h1>
            <p className="mt-5 max-w-2xl text-pretty text-lg leading-8 text-white/84 sm:text-xl">
              {journey.description}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="pill" size="pill">
                <Link href={`/explore?journey=${journey.id}`}>
                  See matching land <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="pill-outline" size="pill" className="border-white/20 text-white hover:text-white">
                <Link href="/professionals">Find specialists</Link>
              </Button>
            </div>
          </div>

          <Card className="border-white/15 bg-white/10 p-5 text-white shadow-[0_18px_55px_rgba(0,0,0,0.22)] backdrop-blur-xl">
            <CardContent className="space-y-4 p-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">What to look for</p>
              <ul className="space-y-3">
                {journey.whatToLookFor.slice(0, 4).map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm leading-6 text-white/85">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2 p-6 sm:p-7">
            <CardContent className="space-y-5 p-0">
              <SectionHeading
                kicker="Journey guide"
                title="What this land needs to have"
                subtitle="A practical checklist for matching land to the way you plan to use it."
              />
              <ul className="space-y-3 pt-2">
                {journey.whatToLookFor.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 rounded-2xl border border-border/70 bg-muted/25 px-4 py-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <span className="text-sm leading-7 text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="p-6 sm:p-7">
            <CardContent className="p-0">
              <SectionHeading kicker="Frequently asked" title="Common questions" />
              <Accordion type="single" collapsible className="mt-4">
                {journey.faqs.map((faq, index) => (
                  <AccordionItem key={faq.question} value={`item-${index}`}>
                    <AccordionTrigger className="text-left text-sm font-medium">{faq.question}</AccordionTrigger>
                    <AccordionContent className="text-sm leading-7 text-muted-foreground">{faq.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="relative py-20">
        <div className="absolute inset-x-0 top-1/2 -z-10 h-[420px] -translate-y-1/2 bg-[radial-gradient(circle_at_center,rgba(87,168,132,0.12),transparent_60%)]" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <SectionHeading
              kicker="Best matches"
              title={`Best matches for ${journey.shortTitle.toLowerCase()}`}
              subtitle="Ranked by fit score for this journey."
            />
            <Button asChild variant="pill-outline" size="pill">
              <Link href={`/explore?journey=${journey.id}`}>
                See all matches <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <SectionHeading
            kicker="Support network"
            title="Professionals for this journey"
            subtitle={`Once you have land, these specialists help you set it up for ${journey.shortTitle.toLowerCase()}.`}
            className="mb-10"
          />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {matchedProfessionals.map((professional) => (
              <ProfessionalCard key={professional.slug} professional={professional} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
