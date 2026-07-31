import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  CalendarCheck,
  Droplets,
  FileCheck2,
  Landmark,
  Leaf,
  MapPin,
  MapPinned,
  Plane,
  Route,
  ScanSearch,
  ShieldCheck,
  Sprout,
  TrendingUp,
  Trophy,
} from "lucide-react";
import { HeroVideo } from "@/components/hero-video";
import { DragRail } from "@/components/drag-rail";
import { V1Header } from "@/components/v1/v1-header";
import { V1SearchPanel } from "@/components/v1/v1-search-panel";
import { EXPERIENCES } from "@/components/v1/experiences";
import { GROWTH_ANCHORS } from "@/lib/anchors";
import { CORE_REGIONS } from "@/lib/regions";
import { getAllProperties } from "@/lib/store/properties";
import { formatINR } from "@/lib/tax";
import type { Property } from "@/lib/types";

export const dynamic = "force-dynamic";

/**
 * Design prototype — not the live homepage.
 *
 * A one-to-one build of the reference layout, parked at /v1 so it can be looked
 * at beside / without either disturbing the other. It reads the same live
 * catalogue the real site does; nothing is seeded to make it look fuller than
 * the data is. Where the reference shows a figure we cannot source (its "500+
 * acres", "25+ consultants"), the equivalent here is computed and will honestly
 * read zero until listings exist.
 *
 * The photography is stock, from the Unsplash set this project already used
 * before the catalogue was cleared, chosen per tile against what the image
 * actually shows rather than by filename.
 */

/**
 * The three mapped projects, with the icon and fill each gets.
 *
 * A solid colour per project is a deliberate departure from the forest and
 * terracotta used everywhere else: this row's job is to make five projects
 * distinguishable at a glance, and five shades of one accent does not do that.
 * Confined to this row and the hero pins that mirror it.
 */
const ANCHOR_STYLE = {
  iimb: { icon: Landmark, tint: "bg-[#7a5cb8]", short: "New IIMB campus" },
  stadium: { icon: Trophy, tint: "bg-[#3f9e5a]", short: "Upcoming cricket stadium" },
  airport: { icon: Plane, tint: "bg-[#df5a4c]", short: "Proposed intl. airport" },
} as const;

/**
 * Where each anchor's label sits over the hero footage. Composition, not
 * geography — the video is a drone shot of farmland, not a map, so a pin placed
 * by latitude would mean nothing.
 */
const ANCHOR_PIN_POSITIONS: Record<string, string> = {
  iimb: "left-[58%] top-[15%]",
  stadium: "left-[66%] top-[27%]",
  airport: "left-[73%] top-[39%]",
};

/** Shorter still than the card titles — a floating chip has less room. */
const ANCHOR_PIN_LABELS: Record<string, string> = {
  iimb: "New IIMB campus",
  stadium: "Cricket stadium",
  airport: "Second airport",
};

/** The four things every listing is checked for before it goes up. */
const HERO_ASSURANCES = [
  { icon: ShieldCheck, label: "Verified lands" },
  { icon: Route, label: "Road access" },
  { icon: Droplets, label: "Water source" },
  { icon: TrendingUp, label: "Future growth" },
];

/** Two more than the three mapped anchors, matching the corridor copy on /. */
const CORRIDOR_EXTRAS = [
  { icon: Route, title: "STRR 300ft road", tint: "bg-[#2d6b9e]" },
  { icon: Building2, title: "Improved connectivity", tint: "bg-[#e0a03c]" },
];

/** The path from first visit to owning something, as the reference frames it. */
const JOURNEY_STEPS = [
  { icon: ScanSearch, title: "Discover yourself", body: "Let AFORACRE understand your intent." },
  { icon: MapPinned, title: "Personalised matches", body: "Land that fits how you want to live." },
  { icon: CalendarCheck, title: "Visit and shortlist", body: "We plan the route and come with you." },
  { icon: FileCheck2, title: "Buy with confidence", body: "RTC, khata and survey verified first." },
  { icon: Sprout, title: "Build and grow", body: "Fencing, borewell, power — and who does it." },
];

/**
 * Shown on a listing with no photo of its own. Every other image on this page
 * illustrates a category; this one stands in for a specific plot, so it is
 * captioned as a placeholder rather than passed off as the land.
 */
const LISTING_PLACEHOLDER =
  "https://images.unsplash.com/photo-1693713354781-fc9921f17141?auto=format&fit=crop&w=800&q=70";

function verifiedFully(property: Property): boolean {
  return Object.values(property.verified).every(Boolean);
}

export default async function V1Page() {
  const properties = await getAllProperties();

  const featured = properties.filter((p) => p.featured);
  const showcase = (featured.length > 0 ? featured : properties).slice(0, 8);

  const areas = Array.from(new Set(properties.map((p) => p.location.area))).sort();
  // Fall back to the belt we work in when the catalogue is empty, so the
  // location filter still has something to say on a fresh database.
  const areaOptions = areas.length > 0 ? areas : CORE_REGIONS.map((r) => r.name);

  const totalAcres = properties.reduce((sum, p) => sum + p.extentAcres, 0);
  const verifiedCount = properties.filter(verifiedFully).length;
  const verifiedPct = properties.length > 0 ? Math.round((verifiedCount / properties.length) * 100) : 0;

  const STATS = [
    { icon: ShieldCheck, value: `${verifiedPct}%`, label: "Listings verified" },
    { icon: Sprout, value: totalAcres > 0 ? totalAcres.toFixed(1) : "0", label: "Acres listed" },
    { icon: MapPinned, value: `${CORE_REGIONS.length}`, label: "Villages we cover" },
    { icon: FileCheck2, value: "0%", label: "Hidden charges" },
  ];

  return (
    <div className="bg-background">
      <V1Header />

      {/* ---------------------------------------------------------------- Hero */}
      <section className="relative">
        <div className="relative min-h-[92dvh] w-full overflow-hidden">
          <div className="absolute inset-0">
            <HeroVideo poster="/videos/hero-poster.jpg" />
          </div>
          {/* Two gradients, not one: a top scrim so the transparent header's
              white text has something to sit on, and a heavier bottom one so
              the finder panel does not float on raw footage. */}
          <div
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,18,14,0.55)_0%,rgba(8,18,14,0.18)_28%,rgba(8,18,14,0.30)_62%,rgba(8,18,14,0.80)_100%)]"
          />

          {/* Anchor callouts. Hidden below lg — at phone width they land on top
              of the headline and each other. */}
          <div aria-hidden className="pointer-events-none absolute inset-0 hidden lg:block">
            {GROWTH_ANCHORS.map((anchor) => {
              const { icon: Icon, tint } = ANCHOR_STYLE[anchor.id];
              return (
                <div key={anchor.id} className={`absolute ${ANCHOR_PIN_POSITIONS[anchor.id]}`}>
                  <div className="flex items-center gap-2 rounded-full bg-white/92 py-1.5 pl-1.5 pr-4 shadow-[0_10px_30px_rgba(8,18,14,0.25)] backdrop-blur">
                    <span className={`flex h-7 w-7 items-center justify-center rounded-full ${tint}`}>
                      <Icon className="h-3.5 w-3.5 text-white" />
                    </span>
                    <span className="whitespace-nowrap text-xs font-semibold text-[#0e241b]">
                      {ANCHOR_PIN_LABELS[anchor.id]}
                    </span>
                  </div>
                  {/* Dotted drop line, purely to tie the label to the ground. */}
                  <span className="mx-auto block h-16 w-px border-l border-dashed border-white/55" />
                  <span className="mx-auto block h-2 w-2 -translate-y-1 rounded-full bg-white shadow-[0_0_0_4px_rgba(255,255,255,0.28)]" />
                </div>
              );
            })}
          </div>

          <div className="relative mx-auto flex min-h-[92dvh] max-w-[1400px] flex-col justify-end px-4 pb-8 pt-28 sm:px-6 lg:px-10 lg:pb-12">
            <div className="max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-[#0e241b] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#ede6d5]">
                  Project A
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/75">
                  A for Acre
                </span>
              </div>
              <h1 className="mt-5 font-heading text-4xl font-semibold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">
                Curated farmland
                <br className="hidden sm:block" /> around south Bengaluru
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">
                Own your acre of nature within 1–1.5 hrs from home.
                <br className="hidden sm:block" /> Live it. Grow it. Build it. Retire in it.
              </p>

              <ul className="mt-7 flex flex-wrap gap-x-6 gap-y-3">
                {HERO_ASSURANCES.map((item) => (
                  <li key={item.label} className="flex items-center gap-2 text-sm font-medium text-white/90">
                    <item.icon className="h-4 w-4 text-white/70" />
                    {item.label}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-10">
              <V1SearchPanel areas={areaOptions} />
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------ Growth corridor */}
      <section id="corridor" className="scroll-mt-24 bg-[#faf7f1] py-16 lg:py-20">
        <div className="mx-auto grid max-w-[1400px] gap-10 px-4 sm:px-6 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:items-center lg:gap-14 lg:px-10">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">
              Why south Bengaluru?
            </p>
            <h2 className="mt-3 font-heading text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
              The next growth corridor
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Major infrastructure and institutions are transforming south Bengaluru into one of the
              country&apos;s most promising regions. We list inside those rings and nowhere else.
            </p>
            <Link
              href="/#corridor"
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-border bg-background px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary"
            >
              Explore growth map <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {GROWTH_ANCHORS.map((anchor) => {
              const { icon: Icon, tint, short } = ANCHOR_STYLE[anchor.id];
              return (
                <article
                  key={anchor.id}
                  className="flex flex-col items-center rounded-2xl bg-background px-4 py-7 text-center shadow-[0_10px_30px_rgba(15,23,42,0.06)]"
                >
                  <span className={`flex h-12 w-12 items-center justify-center rounded-full ${tint}`}>
                    <Icon className="h-5 w-5 text-white" />
                  </span>
                  <h3 className="mt-4 text-sm font-semibold leading-snug text-foreground">{short}</h3>
                  {/* Never dropped for layout. The airport site is not settled,
                      and every surface that names it has to say so. */}
                  {anchor.disclaimer && (
                    <p className="mt-1.5 text-[11px] leading-snug text-muted-foreground">
                      {anchor.disclaimer}
                    </p>
                  )}
                </article>
              );
            })}
            {CORRIDOR_EXTRAS.map((item) => (
              <article
                key={item.title}
                className="flex flex-col items-center rounded-2xl bg-background px-4 py-7 text-center shadow-[0_10px_30px_rgba(15,23,42,0.06)]"
              >
                <span className={`flex h-12 w-12 items-center justify-center rounded-full ${item.tint}`}>
                  <item.icon className="h-5 w-5 text-white" />
                </span>
                <h3 className="mt-4 text-sm font-semibold leading-snug text-foreground">{item.title}</h3>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------- By experience */}
      <section id="experience" className="scroll-mt-24 py-16 lg:py-20">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
          <div className="text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">
              Discover by experience
            </p>
            <h2 className="mt-3 font-heading text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
              Find the kind of land that matches your dream
            </h2>
          </div>

          <DragRail className="mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {EXPERIENCES.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  href={`/explore?q=${encodeURIComponent(item.tag)}`}
                  className="group relative aspect-[3/4] w-[min(58vw,190px)] shrink-0 snap-start overflow-hidden rounded-2xl"
                >
                  <Image
                    src={item.image}
                    alt=""
                    fill
                    sizes="190px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span
                    aria-hidden
                    className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,18,14,0)_35%,rgba(8,18,14,0.80)_100%)]"
                  />
                  <span className="absolute inset-x-0 bottom-0 p-3.5">
                    <Icon className="h-4 w-4 text-white/80" />
                    <span className="mt-2 block text-sm font-semibold text-white">{item.label}</span>
                    <span className="mt-0.5 block text-[11px] leading-snug text-white/70">
                      {item.body}
                    </span>
                  </span>
                </Link>
              );
            })}
          </DragRail>
        </div>
      </section>

      {/* -------------------------------------------------------------- Featured */}
      <section id="featured" className="scroll-mt-24 bg-[#faf7f1] py-16 lg:py-20">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">
                Featured farmland
              </p>
              <h2 className="mt-3 font-heading text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
                Handpicked. Verified. Beautiful.
              </h2>
            </div>
            <Link
              href="/explore"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary"
            >
              View all lands <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {showcase.length === 0 ? (
            <p className="mt-10 rounded-2xl border border-dashed border-border bg-background px-6 py-12 text-center text-sm text-muted-foreground">
              No listings yet. Publish one from the admin console and it will appear here.
            </p>
          ) : (
            <DragRail className="mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {showcase.map((property) => (
                <Link
                  key={property.slug}
                  href={`/property/${property.slug}`}
                  className="group w-[min(82vw,300px)] shrink-0 snap-start overflow-hidden rounded-2xl bg-background shadow-[0_10px_30px_rgba(15,23,42,0.06)]"
                >
                  <span className="relative block aspect-[4/3] overflow-hidden">
                    <Image
                      src={property.images[0] ?? LISTING_PLACEHOLDER}
                      alt=""
                      fill
                      sizes="300px"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {!property.images[0] && (
                      <span className="absolute right-2.5 top-2.5 rounded-md bg-black/45 px-2 py-1 text-[9px] uppercase tracking-[0.12em] text-white/80 backdrop-blur">
                        Stock photo
                      </span>
                    )}
                    {property.fid && (
                      <span className="absolute bottom-2.5 left-2.5 rounded-md bg-[#0e241b]/85 px-2 py-1 text-[10px] font-semibold tracking-[0.08em] text-[#ede6d5] backdrop-blur">
                        FID {property.fid}
                      </span>
                    )}
                  </span>
                  <span className="block p-4">
                    <span className="block truncate font-heading text-base font-semibold text-foreground">
                      {property.title}
                    </span>
                    <span className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {property.location.area}
                    </span>
                    <span className="mt-2.5 block truncate text-[11px] text-muted-foreground">
                      {[`${property.extentAcres} acres`, ...property.tags.slice(0, 2)].join(" · ")}
                    </span>
                    <span className="mt-3 flex items-center justify-between">
                      <span className="font-heading text-base font-semibold text-foreground">
                        {formatINR(property.totalPrice)}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-accent">
                        View details <ArrowUpRight className="h-3.5 w-3.5" />
                      </span>
                    </span>
                  </span>
                </Link>
              ))}
            </DragRail>
          )}
        </div>
      </section>

      {/* --------------------------------------------------------- Your journey */}
      <section id="journey" className="scroll-mt-24 bg-[#0e241b] py-16 lg:py-20">
        <div className="mx-auto grid max-w-[1400px] gap-10 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:gap-14 lg:px-10">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#ede6d5]/50">
              Your journey with A for Acre
            </p>
            <h2 className="mt-3 font-heading text-3xl font-semibold leading-tight text-[#ede6d5] sm:text-4xl">
              From discovery to your dream farm
            </h2>

            {/* The dashed rule runs behind the row at the icons' centre line, so
                the five steps read as one path rather than five tiles. It is
                drawn only from sm up, where the steps actually sit in a row. */}
            <div className="relative mt-10">
              <span
                aria-hidden
                className="absolute left-[10%] right-[10%] top-[22px] hidden border-t border-dashed border-[#ede6d5]/18 sm:block"
              />
              <ol className="relative grid gap-8 sm:grid-cols-3 lg:grid-cols-5">
                {JOURNEY_STEPS.map((step) => (
                  <li key={step.title} className="sm:text-center">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#153026] ring-1 ring-inset ring-white/12 sm:mx-auto">
                      <step.icon className="h-4 w-4 text-[#ede6d5]" />
                    </span>
                    <h3 className="mt-4 text-sm font-semibold text-[#ede6d5]">{step.title}</h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-[#ede6d5]/60">{step.body}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <aside className="relative flex flex-col justify-between overflow-hidden rounded-[1.75rem] bg-white/[0.05] p-7 ring-1 ring-inset ring-white/10">
            <Leaf
              aria-hidden
              className="pointer-events-none absolute -right-4 top-6 h-28 w-28 text-[#ede6d5]/[0.07]"
            />
            <div className="relative">
              <h3 className="font-heading text-2xl font-semibold leading-tight text-[#ede6d5]">
                Go the extra mile.
                <br /> It&apos;s worth it.
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-[#ede6d5]/65">
                Let nature take its course. Four questions is usually enough for us to tell a weekend
                plot from something you would farm.
              </p>
            </div>
            <Link
              href="/match"
              className="relative mt-8 inline-flex items-center justify-between gap-3 rounded-full bg-[#ede6d5] px-6 py-3.5 text-sm font-semibold text-[#0e241b] transition-transform hover:-translate-y-0.5"
            >
              Begin your journey <ArrowRight className="h-4 w-4" />
            </Link>
          </aside>
        </div>
      </section>

      {/* --------------------------------------------------------------- Numbers */}
      <footer className="bg-[#0b1c15] py-10">
        <div className="mx-auto grid max-w-[1400px] gap-8 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:px-10">
          <dl className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {STATS.map((stat) => (
              <div key={stat.label} className="flex items-center gap-3">
                <stat.icon className="h-6 w-6 shrink-0 text-[#ede6d5]/45" />
                <div className="min-w-0">
                  <dd className="font-heading text-lg font-semibold text-[#ede6d5]">{stat.value}</dd>
                  <dt className="truncate text-[11px] text-[#ede6d5]/55">{stat.label}</dt>
                </div>
              </div>
            ))}
          </dl>

          <div className="lg:text-right">
            <p className="font-heading text-xl font-semibold text-[#ede6d5]">A for Acre</p>
            <p className="mt-1 text-[11px] text-[#ede6d5]/45">
              Curated farmland around south Bengaluru · design prototype
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
