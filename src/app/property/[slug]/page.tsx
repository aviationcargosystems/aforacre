import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BadgeCheck,
  Droplets,
  MapPin,
  Mountain,
  Route,
  Ruler,
  ScrollText,
} from "lucide-react";
import { getProperty } from "@/lib/store/properties";
import { formatINR } from "@/lib/tax";
import { iconForTag } from "@/lib/tag-icons";
import { acresToGunta, acresToSqft } from "@/lib/land-units";
import { GrowthAnchors } from "@/components/property/growth-anchors";
import { PlotAreaView } from "@/components/map/plot-area-view";
import { PlotTerrainView } from "@/components/map/plot-terrain-view";
import { VERIFIED_FIELDS } from "@/components/admin/property-form-shared";
import { EnquiryForm } from "@/components/enquiry-form";
import { PropertyMediaGallery } from "@/components/property/property-media-gallery";

export const dynamic = "force-dynamic";


export default async function PropertyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const property = await getProperty(slug);
  if (!property) notFound();

  const verified = VERIFIED_FIELDS.filter((field) => property.verified[field.key]);
  const gallery = property.images.filter(Boolean);
  const locationLabel = [property.location.area, property.location.corridor].filter(Boolean).join(", ");

  return (
    <main className="pb-20">
      <header className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        <nav className="mb-5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground" aria-label="Breadcrumb">
          <Link href="/explore" className="transition-colors hover:text-foreground">Explore land</Link>
          {property.location.corridor && (
            <>
              <span aria-hidden="true">/</span>
              <span>{property.location.corridor}</span>
            </>
          )}
        </nav>

        <PropertyMediaGallery
          title={property.title}
          location={locationLabel}
          images={gallery}
          videos={property.videos}
        />

        <div className="grid gap-7 border-b border-border/70 py-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              {property.featured && <span className="text-accent">Featured land</span>}
              <span>{property.extentAcres} acres</span>
              {property.distanceFromBangaloreKm > 0 && <span>{property.distanceFromBangaloreKm} km from Bengaluru</span>}
            </div>
            <h1 className="mt-4 max-w-4xl text-balance font-heading text-4xl font-semibold leading-[1.02] text-foreground sm:text-5xl lg:text-6xl">
              {property.title}
            </h1>
            <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
              {property.tags.map((tag) => <span key={tag}>{tag}</span>)}
            </div>
          </div>
          <div className="shrink-0 border-l-0 border-border/70 lg:border-l lg:pl-8 lg:text-right">
            <p className="font-heading text-4xl font-semibold tracking-tight text-primary tabular-nums">
              {formatINR(property.totalPrice)}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {formatINR(property.pricePerAcre)} per acre
            </p>
            <p className="mt-2 text-[10px] text-muted-foreground">Standard 2% platform fee applies</p>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_19rem] lg:px-8">
        <div className="min-w-0">
          {property.description.trim() && (
            <Section id="overview" eyebrow="Overview" title="What this land feels like">
              <p className="max-w-3xl text-pretty text-lg leading-8 text-muted-foreground sm:text-xl sm:leading-9">
                {property.description}
              </p>
            </Section>
          )}

          <Section id="facts" eyebrow="The essentials" title="At a glance">
            <dl className="grid border-t border-border/70 sm:grid-cols-2">
              <Fact
                icon={Ruler}
                label="Extent"
                value={`${property.extentAcres} acres`}
                detail={`${formatUnit(acresToGunta(property.extentAcres))} guntas · ${formatUnit(acresToSqft(property.extentAcres))} sq ft`}
              />
              {/* Only the fields that were actually filled in. A row reading
                  "Soil —" or "Water: None" is not a fact about the plot, it is
                  a gap in the record wearing the costume of one. */}
              {property.soilType && <Fact icon={ScrollText} label="Soil" value={property.soilType} />}
              {property.waterSources.filter((w) => w !== "none").length > 0 && (
                <Fact icon={Droplets} label="Water" value={property.waterSources.filter((w) => w !== "none").join(", ")} />
              )}
              {property.roadAccess && <Fact icon={Route} label="Road access" value={property.roadAccess} />}
              {property.landObservation && (
                <Fact icon={Mountain} label="Site observation" value={property.landObservation} wide />
              )}
            </dl>

            {/* Tags are what an admin actually records about a plot now, so
                they carry the description rather than a fixed field list. */}
            {property.tags.length > 0 && (
              <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {property.tags.map((tag) => {
                  const Icon = iconForTag(tag);
                  return (
                    <li
                      key={tag}
                      className="flex items-center gap-2.5 rounded-2xl border border-border/70 bg-white/60 px-3.5 py-3"
                    >
                      <Icon className="h-4 w-4 shrink-0 text-primary" />
                      <span className="min-w-0 text-sm leading-5 text-foreground/85">{tag}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </Section>


          
          <Section id="location" eyebrow="Location" title="See the land in context">
            <div className="grid gap-6 xl:grid-cols-2">
              <figure>
                <div className="h-[24rem] overflow-hidden bg-muted">
                  <PlotAreaView lat={property.location.lat} lng={property.location.lng} area={property.location.area} />
                </div>
                <figcaption className="mt-2 text-xs text-muted-foreground">Satellite area view</figcaption>
              </figure>
              <figure>
                <div className="h-[24rem] overflow-hidden bg-muted">
                  <PlotTerrainView lat={property.location.lat} lng={property.location.lng} area={property.location.area} />
                </div>
                <figcaption className="mt-2 text-xs text-muted-foreground">Terrain and elevation view</figcaption>
              </figure>
            </div>
            {property.nearbyLandmarks.length > 0 && (
              <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                {property.nearbyLandmarks.map((landmark) => (
                  <span key={landmark} className="inline-flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-primary" /> {landmark}
                  </span>
                ))}
              </div>
            )}
          </Section>
        </div>

        <aside className="border-t border-border/70 pt-10 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-12">
          <div className="space-y-10 lg:sticky lg:top-24">
            <section>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">Arrange a visit</p>
              <h2 className="mt-2 font-heading text-2xl font-semibold leading-tight text-foreground">Interested in this land?</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Leave your number. We&apos;ll call with availability, paperwork status and the next site-visit slot.
              </p>
              <div className="mt-5">
                <EnquiryForm context="property" propertySlug={property.slug} ctaLabel="Request a call back" />
              </div>
            </section>

            <GrowthAnchors lat={property.location.lat} lng={property.location.lng} />

            <section className="border-t border-border/70 pt-8">
              <div className="flex items-center gap-2 text-primary">
                <BadgeCheck className="h-4 w-4" />
                <h3 className="text-sm font-semibold text-foreground">{verified.length} of {VERIFIED_FIELDS.length} checks complete</h3>
              </div>
              <p className="mt-3 text-xs leading-6 text-muted-foreground">
                Ownership, survey, GPS, road access, documents and physical inspection are checked before a property receives its Farm ID.
              </p>
              <Link href="/explore" className="mt-5 inline-block text-xs font-semibold text-accent hover:underline">
                Browse more land →
              </Link>
            </section>
          </div>
        </aside>
      </div>
    </main>
  );
}

function Section({
  id,
  eyebrow,
  title,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="border-b border-border/70 py-12 sm:py-14">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">{eyebrow}</p>
      <h2 className="mt-2 mb-7 font-heading text-3xl font-semibold leading-tight text-foreground sm:text-4xl">{title}</h2>
      {children}
    </section>
  );
}

function Fact({
  icon: Icon,
  label,
  value,
  detail,
  wide,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  detail?: string;
  wide?: boolean;
}) {
  return (
    <div className={`flex gap-3 border-b border-border/70 py-5 sm:pr-6 sm:odd:border-r sm:even:pl-6 ${wide ? "sm:col-span-2 sm:border-r-0 sm:pl-0" : ""}`}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
      <div>
        <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{label}</dt>
        <dd className="mt-1 text-sm font-medium capitalize text-foreground">{value}</dd>
        {detail && <dd className="mt-1 text-xs leading-5 text-muted-foreground">{detail}</dd>}
      </div>
    </div>
  );
}


function formatUnit(value: number): string {
  return Number(value.toFixed(2)).toLocaleString("en-IN");
}
