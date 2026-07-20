import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Droplets,
  Fence,
  MapPin,
  Phone,
  Route,
  Ruler,
  ScrollText,
  Zap,
} from "lucide-react";
import { getProperty } from "@/lib/store/properties";
import { getAllProfessionals } from "@/lib/store/professionals";
import { journeys } from "@/data/journeys";
import { karnatakaLegalTerms } from "@/data/legal";
import { formatINR, formatINRFull } from "@/lib/tax";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ProfessionalCard } from "@/components/professional-card";
import { PropertyLocationMap } from "@/components/map/property-location-map";

export const dynamic = "force-dynamic";

const suitabilityLabels: Record<string, string> = {
  polyhouse: "Polyhouse Farming",
  openFarming: "Open Farming",
  orchard: "Orchard",
  residentialFarmhouse: "Farmhouse Living",
  getaway: "Weekend Getaway",
};

function ScoreBar({ label, score, note }: { label: string; score: number; note?: string }) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-foreground">{label}</span>
        <span className="text-muted-foreground">{score}/100</span>
      </div>
      <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: `${score}%` }}
        />
      </div>
      {note && <p className="mt-1.5 text-xs text-muted-foreground">{note}</p>}
    </div>
  );
}

export default async function PropertyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const property = await getProperty(slug);
  if (!property) notFound();

  const topJourney = journeys.reduce((best, j) =>
    property.journeyFit[j.id] > property.journeyFit[best.id] ? j : best
  , journeys[0]);

  const professionals = await getAllProfessionals();
  const matchedProfessionals = professionals
    .filter((p) => topJourney.relevantProfessionalCategories.includes(p.category))
    .slice(0, 3);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Gallery */}
      <div className="grid gap-2 sm:grid-cols-3 sm:grid-rows-2">
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-muted sm:col-span-2 sm:row-span-2 sm:aspect-auto">
          <Image src={property.images[0]} alt={property.title} fill sizes="(max-width: 768px) 100vw, 66vw" className="object-cover" priority />
        </div>
        {property.images.slice(1).map((img, i) => (
          <div key={i} className="relative hidden aspect-[4/3] overflow-hidden rounded-xl bg-muted sm:block">
            <Image src={img} alt={`${property.title} photo ${i + 2}`} fill sizes="33vw" className="object-cover" />
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="mt-6 flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap gap-1.5">
            {property.tags.map((tag) => (
              <Badge key={tag} variant="secondary">{tag}</Badge>
            ))}
          </div>
          <h1 className="mt-2 font-heading text-3xl font-semibold text-foreground">{property.title}</h1>
          <p className="mt-1 flex items-center gap-1.5 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            {property.location.area}, {property.location.corridor} · {property.distanceFromBangaloreKm}km from Bangalore
          </p>
        </div>
        <div className="text-left sm:text-right">
          <p className="font-heading text-3xl font-semibold text-primary">{formatINR(property.totalPrice)}</p>
          <p className="text-sm text-muted-foreground">{formatINR(property.pricePerAcre)}/acre · {property.extentAcres} acres</p>
        </div>
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-3">
        <div className="space-y-10 lg:col-span-2">
          {/* Description */}
          <section>
            <h2 className="font-heading text-xl font-semibold text-foreground">About this land</h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">{property.description}</p>
          </section>

          {/* Key facts */}
          <section>
            <h2 className="font-heading text-xl font-semibold text-foreground">Key facts</h2>
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
              <FactItem icon={Ruler} label="Extent" value={`${property.extentAcres} acres`} />
              <FactItem icon={Droplets} label="Water source" value={property.waterSources.join(", ") || "None"} />
              <FactItem icon={Route} label="Road access" value={property.roadAccess} />
              <FactItem icon={Fence} label="Fencing" value={property.fencing ? "Fenced" : "Not fenced"} />
              <FactItem icon={Zap} label="Electricity" value={property.electricity ? "Connected" : "Not connected"} />
              <FactItem icon={ScrollText} label="Soil type" value={property.soilType} />
            </div>
          </section>

          {/* Journey fit + suitability */}
          <section>
            <h2 className="font-heading text-xl font-semibold text-foreground">Land suitability</h2>
            <p className="mt-1 text-sm text-muted-foreground">How this plot scores across common uses.</p>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              {(Object.keys(property.suitability) as (keyof typeof property.suitability)[]).map((key) => (
                <ScoreBar
                  key={key}
                  label={suitabilityLabels[key]}
                  score={property.suitability[key].score}
                  note={property.suitability[key].note}
                />
              ))}
            </div>
          </section>

          {/* Tax breakdown */}
          <section>
            <h2 className="font-heading text-xl font-semibold text-foreground">Taxes & charges (Karnataka)</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Indicative estimate based on guidance value of {formatINR(property.taxes.guidanceValuePerAcre)}/acre. Always confirm with a registered document writer before transacting.
            </p>
            <Card className="mt-4">
              <CardContent className="divide-y divide-border p-0">
                {property.taxes.lineItems.map((item) => (
                  <div key={item.label} className="flex items-start justify-between gap-4 px-5 py-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.label}</p>
                      {item.note && <p className="text-xs text-muted-foreground">{item.note}</p>}
                    </div>
                    <p className="whitespace-nowrap text-sm font-medium text-foreground">{formatINRFull(item.amount)}</p>
                  </div>
                ))}
                <div className="flex items-center justify-between bg-secondary/50 px-5 py-4">
                  <p className="font-heading text-base font-semibold text-foreground">Total charges</p>
                  <p className="font-heading text-lg font-semibold text-primary">{formatINRFull(property.taxes.total)}</p>
                </div>
              </CardContent>
            </Card>
            <p className="mt-3 text-xs text-muted-foreground">
              Est. annual land revenue: {formatINRFull(property.taxes.estimatedAnnualLandRevenue)}. Figures are illustrative, not a legal quote.
            </p>
          </section>

          {/* Legal status */}
          <section>
            <h2 className="font-heading text-xl font-semibold text-foreground">Legal status</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <LegalRow label="Khata" value={property.legal.khata === "none" ? "Not applicable" : `Khata ${property.legal.khata}`} />
              <LegalRow label="DC conversion" value={property.legal.dcConverted ? "Converted" : "Not converted"} />
              <LegalRow label="RTC available" value={property.legal.rtcAvailable ? "Yes" : "No"} />
              <LegalRow label="Encumbrance" value={property.legal.encumbranceClear ? "Clear" : "Needs verification"} />
              <LegalRow label="Survey number" value={property.legal.surveyNumber} span />
            </div>
            {property.legal.notes.length > 0 && (
              <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                {property.legal.notes.map((note) => (
                  <li key={note}>· {note}</li>
                ))}
              </ul>
            )}
          </section>

          {/* Map */}
          <section>
            <h2 className="font-heading text-xl font-semibold text-foreground">Location</h2>
            <div className="mt-4 h-[320px] overflow-hidden rounded-xl border border-border">
              <PropertyLocationMap property={property} />
            </div>
            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
              {property.nearbyLandmarks.map((landmark) => (
                <span key={landmark}>· {landmark}</span>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardContent className="space-y-4">
              <h3 className="font-heading text-lg font-semibold text-foreground">Interested in this land?</h3>
              <p className="text-sm text-muted-foreground">
                Enquiries connect you with the listing broker for a site visit. This is a demo build — enquiry submission isn&apos;t wired up yet.
              </p>
              <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled>
                <Phone className="mr-1.5 h-4 w-4" /> Request a call back
              </Button>
            </CardContent>
          </Card>

          {matchedProfessionals.length > 0 && (
            <div>
              <h3 className="font-heading text-lg font-semibold text-foreground">Set this land up</h3>
              <p className="mt-1 text-sm text-muted-foreground">Matched for {topJourney.shortTitle.toLowerCase()}.</p>
              <div className="mt-4 space-y-4">
                {matchedProfessionals.map((professional) => (
                  <ProfessionalCard key={professional.slug} professional={professional} />
                ))}
              </div>
            </div>
          )}

          <Card>
            <CardContent className="space-y-3">
              <h3 className="font-heading text-base font-semibold text-foreground">Karnataka land basics</h3>
              {karnatakaLegalTerms.slice(0, 3).map((term) => (
                <div key={term.term}>
                  <p className="text-sm font-medium text-foreground">{term.term}</p>
                  <p className="text-xs text-muted-foreground">{term.explanation}</p>
                </div>
              ))}
              <Separator />
              <Link href="/explore" className="text-sm font-medium text-accent hover:underline">
                Browse more land like this
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function FactItem({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5 rounded-lg border border-border p-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium capitalize text-foreground">{value}</p>
      </div>
    </div>
  );
}

function LegalRow({ label, value, span }: { label: string; value: string; span?: boolean }) {
  return (
    <div className={`flex items-center justify-between rounded-lg border border-border px-3 py-2.5 ${span ? "sm:col-span-2" : ""}`}>
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}
