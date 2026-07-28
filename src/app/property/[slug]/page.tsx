import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CheckCircle2,
  Clock,
  LayoutGrid,
  Sprout,
  TrendingUp,
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
import { formatINR } from "@/lib/tax";
import { Badge } from "@/components/ui/badge";
import { GrowthAnchors } from "@/components/property/growth-anchors";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PlotAreaView } from "@/components/map/plot-area-view";
import { PlotTerrainView } from "@/components/map/plot-terrain-view";
import { SectionHeading } from "@/components/section-heading";
import { VERIFIED_FIELDS } from "@/components/admin/property-form-shared";
import { EnquiryForm } from "@/components/enquiry-form";

export const dynamic = "force-dynamic";

/**
 * The five checks every plot we list has to pass. These used to be a homepage
 * section; they belong against an actual plot, where they are a claim about
 * this land rather than a marketing promise.
 */
const HOLISTIC_CHECKS = [
  { icon: Sprout, label: "Rich soil" },
  { icon: LayoutGrid, label: "Fit for everything" },
  { icon: Route, label: "Real road access" },
  { icon: Clock, label: "1 to 1.5 hrs from the city" },
  { icon: TrendingUp, label: "Built to appreciate" },
];


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

  // Up to two companion shots. The layout adapts to however many exist rather
  // than assuming a full set.
  const extraImages = property.images.slice(1, 3);

  return (
    <div className="pb-16">
      <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        {/* Two explicit columns rather than a 4-up grid with spans. The old
            version reserved four columns and gave the hero two of them, so a
            listing with fewer than four photos left dead space beside the hero
            and the whole header read as broken. */}
        <div
          className={
            extraImages.length > 0
              ? "grid grid-cols-1 gap-4 lg:grid-cols-[1.7fr_1fr]"
              : "grid grid-cols-1 gap-4"
          }
        >
          <div className="relative min-h-[380px] overflow-hidden rounded-[1.75rem] bg-muted sm:min-h-[460px]">
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
          {extraImages.length > 0 && (
            <div className="hidden gap-4 lg:grid lg:grid-rows-2">
              {extraImages.map((image, index) => (
                <div key={image} className="relative overflow-hidden rounded-[1.75rem] bg-muted">
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
          )}
        </div>
      </section>

      <section className="mx-auto mt-8 max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* A fixed sidebar column, not justify-between. The old flex row let the
            price card drift to the far edge of a wide screen, leaving a canyon
            between it and the copy. */}
        <div className="grid grid-cols-1 items-start gap-6 border-b border-border/70 pb-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0">
            <div className="flex flex-wrap gap-2">
              {property.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="px-3 py-1.5">
                  {tag}
                </Badge>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {HOLISTIC_CHECKS.map((check) => (
                <span
                  key={check.label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-white/70 px-3 py-1.5 text-xs font-medium text-foreground/80"
                >
                  <check.icon className="h-4 w-4 text-primary" />
                  {check.label}
                </span>
              ))}
            </div>
            <SectionHeading
              kicker="Listing detail"
              title={property.title}
              subtitle={property.description}
              className="mt-4"
            />
          </div>
          <div className="rounded-[1.75rem] border border-white/70 bg-white/70 p-5 shadow-[0_16px_45px_rgba(15,23,42,0.08)] backdrop-blur-xl">
            <p className="text-4xl font-semibold tracking-tight text-primary tabular-nums">
              {formatINR(property.totalPrice)}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {formatINR(property.pricePerAcre)}/acre · {property.extentAcres} acres
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
              {/* Satellite, so the setting is legible: tree cover, neighbouring
                  land, where the water and roads are. Deliberately an area and
                  not a pin, see PlotAreaMap. */}
              <div className="h-[420px] overflow-hidden rounded-[1.5rem] border border-border/70">
                <PlotAreaView lat={property.location.lat} lng={property.location.lng} area={property.location.area} />
              </div>

              {/* Satellite draped over real elevation, tilted. Free route to a
                  Google Earth feel: what Google's paid 3D tiles add is
                  photogrammetric buildings and canopy, and open farmland has
                  little of either. */}
              <div className="h-[460px] overflow-hidden rounded-[1.5rem] border border-border/70">
                <PlotTerrainView
                  lat={property.location.lat}
                  lng={property.location.lng}
                  area={property.location.area}
                />
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

          <GrowthAnchors lat={property.location.lat} lng={property.location.lng} />

          <Card className="p-6">
            <CardContent className="space-y-4 p-0">
              <h3 className="font-heading text-base font-semibold text-foreground">Verified before it is listed</h3>
              <p className="text-sm leading-7 text-muted-foreground">
                Ownership, survey, GPS, road access, documents and a physical site visit, all checked by our team
                before a plot gets its Farm ID.
              </p>
              <h3 className="pt-1 font-heading text-base font-semibold text-foreground">Karnataka tax, upfront</h3>
              <p className="text-sm leading-7 text-muted-foreground">
                Stamp duty, registration and DC conversion charges are worked out per property, so there are no
                surprises at the registrar&apos;s office.
              </p>
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
