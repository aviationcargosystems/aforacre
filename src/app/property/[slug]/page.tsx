import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CheckCircle2,
  Droplets,
  Fence,
  MapPin,
  Route,
  Ruler,
  ScrollText,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { getProperty } from "@/lib/store/properties";
import { USE_CASES } from "@/data/use-cases";
import { karnatakaLegalTerms } from "@/data/legal";
import { formatINR, formatINRFull } from "@/lib/tax";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PropertyLocationMap } from "@/components/map/property-location-map";
import { SectionHeading } from "@/components/section-heading";
import { VERIFIED_FIELDS } from "@/components/admin/property-form-shared";
import { EnquiryForm } from "@/components/enquiry-form";

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
    <div className="rounded-2xl border border-border/70 bg-white/70 p-4 shadow-[0_10px_28px_rgba(15,23,42,0.04)] backdrop-blur-sm">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-foreground">{label}</span>
        <span className="text-muted-foreground">{score}/100</span>
      </div>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary" style={{ width: `${score}%` }} />
      </div>
      {note && <p className="mt-2 text-xs leading-6 text-muted-foreground">{note}</p>}
    </div>
  );
}

export default async function PropertyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const property = await getProperty(slug);
  if (!property) notFound();

  // Best use for this plot, from its stored scores. A plot attribute, not a
  // category the buyer picked.
  const topUseCase = USE_CASES.reduce(
    (best, useCase) => (property.useCaseFit[useCase.id] > property.useCaseFit[best.id] ? useCase : best),
    USE_CASES[0]
  );

  return (
    <div className="pb-16">
      <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div className="relative overflow-hidden rounded-[1.75rem] bg-muted sm:col-span-2 sm:row-span-2 min-h-[340px]">
            <Image
              src={property.images[0]}
              alt={property.title}
              fill
              sizes="(max-width: 768px) 100vw, 66vw"
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,18,14,0.02)_0%,rgba(8,18,14,0.12)_45%,rgba(8,18,14,0.70)_100%)]" />
            <div className="absolute left-4 top-4 flex flex-wrap gap-2">
              {property.featured && <Badge className="bg-white/90 text-foreground">Featured</Badge>}
              {property.fid && <Badge className="bg-white/90 text-foreground">FID {property.fid}</Badge>}
              <Badge className="bg-white/15 text-white">
                {property.useCaseFit[topUseCase.id]}% fit for {topUseCase.label.toLowerCase()}
              </Badge>
            </div>
            <div className="absolute inset-x-4 bottom-4 rounded-[1.5rem] border border-white/15 bg-white/10 p-4 text-white backdrop-blur-xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">Property overview</p>
              <h1 className="mt-2 font-heading text-3xl font-semibold leading-tight sm:text-4xl">{property.title}</h1>
              <p className="mt-2 flex items-center gap-1.5 text-sm text-white/80">
                <MapPin className="h-4 w-4" />
                {property.location.area}, {property.location.corridor} - {property.distanceFromBangaloreKm}km from Bangalore
              </p>
            </div>
          </div>
          {property.images.slice(1, 4).map((image, index) => (
            <div key={image} className="relative hidden overflow-hidden rounded-[1.75rem] bg-muted sm:block">
              <Image
                src={image}
                alt={`${property.title} photo ${index + 2}`}
                fill
                sizes="33vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-8 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 border-b border-border/70 pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="flex flex-wrap gap-2">
              {property.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="px-3 py-1.5">
                  {tag}
                </Badge>
              ))}
            </div>
            <SectionHeading
              kicker="Listing detail"
              title={property.title}
              subtitle={property.description}
              className="mt-4"
            />
          </div>
          <div className="rounded-[1.75rem] border border-white/70 bg-white/70 p-5 text-left shadow-[0_16px_45px_rgba(15,23,42,0.08)] backdrop-blur-xl lg:text-right">
            <p className="font-heading text-4xl font-semibold tracking-tight text-primary">{formatINR(property.totalPrice)}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {formatINR(property.pricePerAcre)}/acre - {property.extentAcres} acres
            </p>
            <p className="mt-2 text-xs text-muted-foreground">Standard 2% platform fee applies on purchase.</p>
          </div>
        </div>
      </section>

      <div className="mx-auto mt-10 grid grid-cols-1 max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1.7fr_0.9fr] lg:px-8">
        <div className="space-y-10">
          <Card className="p-6 sm:p-7">
            <CardContent className="space-y-6 p-0">
              <SectionHeading
                kicker="About"
                title="What this land feels like"
                subtitle="A clean read on the site before you start comparing paperwork or site visits."
              />
              <p className="max-w-3xl text-pretty leading-8 text-muted-foreground">{property.description}</p>
            </CardContent>
          </Card>

          <Card className="p-6 sm:p-7">
            <CardContent className="space-y-6 p-0">
              <SectionHeading kicker="Key facts" title="Core property details" />
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                <FactItem icon={Ruler} label="Extent" value={`${property.extentAcres} acres`} />
                <FactItem icon={Droplets} label="Water source" value={property.waterSources.join(", ") || "None"} />
                <FactItem icon={Route} label="Road access" value={property.roadAccess} />
                <FactItem icon={Fence} label="Fencing" value={property.fencing ? "Fenced" : "Not fenced"} />
                <FactItem icon={Zap} label="Electricity" value={property.electricity ? "Connected" : "Not connected"} />
                <FactItem icon={ScrollText} label="Soil type" value={property.soilType} />
              </div>
            </CardContent>
          </Card>

          <Card className="p-6 sm:p-7">
            <CardContent className="space-y-6 p-0">
              <SectionHeading kicker="Suitability" title="How this land scores" subtitle="Each score is a quick read on whether the site works for a specific use." />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {(Object.keys(property.suitability) as (keyof typeof property.suitability)[]).map((key) => (
                  <ScoreBar
                    key={key}
                    label={suitabilityLabels[key]}
                    score={property.suitability[key].score}
                    note={property.suitability[key].note}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="p-6 sm:p-7">
            <CardContent className="space-y-6 p-0">
              <SectionHeading kicker="Taxes" title="Karnataka charges, summarized" />
              <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
                Indicative estimate based on guidance value of {formatINR(property.taxes.guidanceValuePerAcre)}/acre.
                Always confirm with a registered document writer before transacting.
              </p>
              <div className="overflow-hidden rounded-[1.5rem] border border-border/70 bg-white/75 shadow-[0_14px_40px_rgba(15,23,42,0.05)]">
                <div className="divide-y divide-border/70">
                  {property.taxes.lineItems.map((item) => (
                    <div key={item.label} className="flex items-start justify-between gap-4 px-5 py-4">
                      <div>
                        <p className="text-sm font-medium text-foreground">{item.label}</p>
                        {item.note && <p className="mt-1 text-xs leading-6 text-muted-foreground">{item.note}</p>}
                      </div>
                      <p className="whitespace-nowrap text-sm font-medium text-foreground">{formatINRFull(item.amount)}</p>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between bg-secondary/45 px-5 py-4">
                  <p className="font-heading text-base font-semibold text-foreground">Total charges</p>
                  <p className="font-heading text-lg font-semibold text-primary">{formatINRFull(property.taxes.total)}</p>
                </div>
              </div>
              <p className="text-xs leading-6 text-muted-foreground">
                Est. annual land revenue: {formatINRFull(property.taxes.estimatedAnnualLandRevenue)}. Figures are
                illustrative, not a legal quote.
              </p>
            </CardContent>
          </Card>

          <Card className="p-6 sm:p-7">
            <CardContent className="space-y-6 p-0">
              <SectionHeading kicker="Legal" title="Legal status" />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <LegalRow label="Khata" value={property.legal.khata === "none" ? "Not applicable" : `Khata ${property.legal.khata}`} />
                <LegalRow label="DC conversion" value={property.legal.dcConverted ? "Converted" : "Not converted"} />
                <LegalRow label="RTC available" value={property.legal.rtcAvailable ? "Yes" : "No"} />
                <LegalRow label="Encumbrance" value={property.legal.encumbranceClear ? "Clear" : "Needs verification"} />
                <LegalRow label="Survey number" value={property.legal.surveyNumber} span />
              </div>
              {property.legal.notes.length > 0 && (
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {property.legal.notes.map((note) => (
                    <li key={note}>- {note}</li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card className="p-6 sm:p-7">
            <CardContent className="space-y-6 p-0">
              <SectionHeading kicker="Verification" title="Verified Badge" />
              {(() => {
                const checked = VERIFIED_FIELDS.filter((f) => property.verified[f.key]);
                return checked.length > 0 ? (
                  <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {checked.map((f) => (
                      <li key={f.key} className="flex items-center gap-2 text-sm text-foreground">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" /> {f.label}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ShieldCheck className="h-4 w-4 shrink-0" /> Verification in progress — check back soon.
                  </p>
                );
              })()}
            </CardContent>
          </Card>

          <Card className="p-6 sm:p-7">
            <CardContent className="space-y-6 p-0">
              <SectionHeading kicker="Location" title="Where it sits" />
              <div className="h-[340px] overflow-hidden rounded-[1.5rem] border border-border/70">
                <PropertyLocationMap property={property} />
              </div>
              <div className="flex flex-wrap gap-2">
                {property.nearbyLandmarks.map((landmark) => (
                  <Badge key={landmark} variant="outline" className="px-3 py-1.5">
                    {landmark}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-6">
          <Card className="p-6">
            <CardContent className="space-y-4 p-0">
              <h3 className="font-heading text-2xl font-semibold text-foreground">Interested in this land?</h3>
              <p className="text-sm leading-7 text-muted-foreground">
                Leave your number and our team will call you back to arrange a site visit.
              </p>
              <EnquiryForm context="property" propertySlug={property.slug} ctaLabel="Request a call back" />
            </CardContent>
          </Card>

          <Card className="p-6">
            <CardContent className="space-y-4 p-0">
              <h3 className="font-heading text-lg font-semibold text-foreground">Karnataka land basics</h3>
              {karnatakaLegalTerms.slice(0, 3).map((term) => (
                <div key={term.term}>
                  <p className="text-sm font-medium text-foreground">{term.term}</p>
                  <p className="mt-1 text-xs leading-6 text-muted-foreground">{term.explanation}</p>
                </div>
              ))}
              <Separator />
              <Link href="/explore" className="text-sm font-medium text-accent hover:underline">
                Browse more land like this
              </Link>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function FactItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2.5 rounded-2xl border border-border/70 bg-white/75 p-4 backdrop-blur-sm">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-1 text-sm font-medium capitalize text-foreground">{value}</p>
      </div>
    </div>
  );
}

function LegalRow({ label, value, span }: { label: string; value: string; span?: boolean }) {
  return (
    <div
      className={`flex items-center justify-between rounded-2xl border border-border/70 bg-white/75 px-4 py-3 backdrop-blur-sm ${
        span ? "sm:col-span-2" : ""
      }`}
    >
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}
