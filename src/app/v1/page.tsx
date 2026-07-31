import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck,
  Clock,
  Droplets,
  FileCheck2,
  GraduationCap,
  Leaf,
  MapPinned,
  PlaneTakeoff,
  Route,
  ScanSearch,
  ShieldCheck,
  Sprout,
  TrainFront,
  TrendingUp,
  Trophy,
  Waypoints,
} from "lucide-react";
import { HeroVideo } from "@/components/hero-video";
import { DragRail } from "@/components/drag-rail";
import { PropertyCard } from "@/components/property-card";
import { V1Header } from "@/components/v1/v1-header";
import { GrowthMapDialog } from "@/components/v1/growth-map-dialog";
import { HeroShowcase } from "@/components/v1/hero-showcase";
import { EXPERIENCES } from "@/components/v1/experiences";
import { GROWTH_ANCHORS } from "@/lib/anchors";
import { CORE_REGIONS } from "@/lib/regions";
import { getAllProperties } from "@/lib/store/properties";
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
 * Confined to this row.
 */
const ANCHOR_STYLE = {
  iimb: {
    icon: GraduationCap,
    tint: "bg-[#7a5cb8]",
    wash: "from-[#7a5cb8]/10",
    ring: "ring-[#7a5cb8]/20",
    glow: "shadow-[0_10px_24px_rgba(122,92,184,0.35)]",
    short: "New IIMB Campus",
    line: "110 acres at Jigani. Already building.",
  },
  stadium: {
    icon: Trophy,
    tint: "bg-[#3f9e5a]",
    wash: "from-[#3f9e5a]/10",
    ring: "ring-[#3f9e5a]/20",
    glow: "shadow-[0_10px_24px_rgba(63,158,90,0.35)]",
    short: "Upcoming Cricket Stadium",
    line: "80,000 seats at Anekal. Cabinet approved.",
  },
  airport: {
    icon: PlaneTakeoff,
    tint: "bg-[#df5a4c]",
    wash: "from-[#df5a4c]/10",
    ring: "ring-[#df5a4c]/20",
    glow: "shadow-[0_10px_24px_rgba(223,90,76,0.35)]",
    short: "Proposed Intl. Airport",
    line: "Two of three sites are on Kanakapura Road.",
  },
} as const;

/** The four things every listing is checked for before it goes up. */
const HERO_ASSURANCES = [
  { icon: ShieldCheck, label: "Verified lands" },
  { icon: Route, label: "Road access" },
  { icon: Droplets, label: "Water source" },
  { icon: TrendingUp, label: "Future growth" },
];

/** Two more than the three mapped anchors, matching the corridor copy on /. */
const CORRIDOR_EXTRAS = [
  {
    icon: Waypoints,
    title: "STRR 300ft Road",
    line: "Ring road tying the satellite towns together.",
    tint: "bg-[#2d6b9e]",
    wash: "from-[#2d6b9e]/10",
    ring: "ring-[#2d6b9e]/20",
    glow: "shadow-[0_10px_24px_rgba(45,107,158,0.35)]",
  },
  {
    icon: TrainFront,
    title: "Improved Connectivity",
    line: "Metro and highway upgrades heading south.",
    tint: "bg-[#e0a03c]",
    wash: "from-[#e0a03c]/10",
    ring: "ring-[#e0a03c]/20",
    glow: "shadow-[0_10px_24px_rgba(224,160,60,0.35)]",
  },
];

/**
 * The path from first visit to owning something.
 *
 * Each step carries a photograph, because the five stages are the argument of
 * this section and five icons on a flat field made them read as a legend rather
 * than as a journey. Four of the images are the category photography already on
 * the page; the paperwork step needed its own, since nothing in a farmland set
 * says "title verification".
 */
const JOURNEY_STEPS = [
  {
    icon: ScanSearch,
    title: "Discover yourself",
    body: "Tell us your vision, needs and goals. Four questions is usually enough.",
    image: EXPERIENCES[1].image,
  },
  {
    icon: MapPinned,
    title: "Personalised matches",
    body: "We shortlist farmland that actually fits how you want to live.",
    image: EXPERIENCES[5].image,
  },
  {
    icon: CalendarCheck,
    title: "Visit and shortlist",
    body: "We plan the route and come with you, so you stand on the land.",
    image: EXPERIENCES[0].image,
  },
  {
    icon: FileCheck2,
    title: "Buy with confidence",
    body: "RTC, khata and survey numbers verified before you commit to anything.",
    image:
      "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=900&q=80",
  },
  {
    icon: Sprout,
    title: "Build and grow",
    body: "Fencing, borewell, power — and the people who do each of them.",
    image: EXPERIENCES[6].image,
  },
];

function verifiedFully(property: Property): boolean {
  return Object.values(property.verified).every(Boolean);
}

export default async function V1Page() {
  const properties = await getAllProperties();

  const featured = properties.filter((p) => p.featured);
  const showcase = (featured.length > 0 ? featured : properties).slice(0, 8);

  // One marker per area for the map dialog, not one per plot. Several listings
  // in the same village should read as depth there rather than as clutter.
  const coverage = Array.from(
    properties
      .reduce((byArea, property) => {
        const key = property.location.area;
        const existing = byArea.get(key);
        if (existing) {
          existing.count += 1;
        } else {
          byArea.set(key, {
            area: key,
            corridor: property.location.corridor,
            lat: property.location.lat,
            lng: property.location.lng,
            count: 1,
          });
        }
        return byArea;
      }, new Map<string, { area: string; corridor: string; lat: number; lng: number; count: number }>())
      .values()
  );

  const totalAcres = properties.reduce((sum, p) => sum + p.extentAcres, 0);
  const verifiedCount = properties.filter(verifiedFully).length;
  const verifiedPct = properties.length > 0 ? Math.round((verifiedCount / properties.length) * 100) : 0;

  /**
   * Computed, never claimed. The reference band shows "50+ / 12+ / 100% / 0%";
   * three of those four here come straight off the catalogue and will read zero
   * until it has something in it, which is the honest state of a new site. Only
   * the last is a policy rather than a measurement, and it is one we control.
   */
  const STATS = [
    {
      icon: ShieldCheck,
      value: `${properties.length}`,
      label: "Curated properties",
      note: "Handpicked farmland with clear titles.",
    },
    {
      icon: MapPinned,
      value: `${CORE_REGIONS.length}`,
      label: "Villages",
      note: "Across south Bengaluru and its growth corridors.",
    },
    {
      icon: FileCheck2,
      value: `${verifiedPct}%`,
      label: "Document verified",
      note: "RTC, khata and survey checked before listing.",
    },
    {
      icon: Sprout,
      value: totalAcres > 0 ? `${totalAcres.toFixed(1)}` : "0",
      label: "Acres listed",
      note: "Everything we currently have on the ground.",
    },
  ];

  return (
    <div className="relative">
      {/* The same ambient wash the homepage carries, so the sections below the
          hero have some depth instead of reading as flat paper. One fixed,
          full-viewport layer beneath everything — which only works because no
          section below paints an opaque background of its own, so there is no
          seam for the gradient to stop at. The banded sections are tinted at low
          alpha for exactly that reason. Sized in viewport widths on a phone,
          where 600px blobs overlap into a single flat tint. */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="animate-drift-slow absolute left-[-25%] top-[8%] h-[85vw] w-[85vw] rounded-full bg-accent/20 blur-3xl sm:h-[620px] sm:w-[620px] sm:bg-accent/12" />
        <div className="animate-drift-slower absolute right-[-25%] top-[38%] h-[80vw] w-[80vw] rounded-full bg-primary/16 blur-3xl sm:h-[560px] sm:w-[560px] sm:bg-primary/10" />
        <div className="animate-drift-slow absolute left-[10%] top-[68%] h-[75vw] w-[75vw] rounded-full bg-[#e0bd7c]/16 blur-3xl [animation-delay:-9s] sm:left-[30%] sm:h-[460px] sm:w-[460px] sm:bg-[#e0bd7c]/10" />
      </div>

      <V1Header />

      {/* ---------------------------------------------------------------- Hero */}
      <section className="relative">
        <div className="relative min-h-[92dvh] w-full overflow-hidden">
          <div className="absolute inset-0">
            <HeroVideo poster="/videos/hero-poster.jpg" />
          </div>
          {/* Two scrims. The vertical one darkens the top so the header's white
              text has something to sit on; the horizontal one weights the left,
              where the headline lives, and lets the footage stay bright on the
              right behind the shelf. */}
          <div
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,18,14,0.6)_0%,rgba(8,18,14,0.2)_30%,rgba(8,18,14,0.35)_70%,rgba(8,18,14,0.75)_100%)]"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,18,14,0.88)_0%,rgba(8,18,14,0.55)_42%,rgba(8,18,14,0.05)_78%)]"
          />

          <div className="relative flex min-h-[86dvh] flex-col justify-end pb-10 pt-28 lg:pb-14">
            <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-10">
              <div className="max-w-2xl">
                <h1 className="font-heading text-4xl font-semibold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">
                  Curated farmland around South Bengaluru
                </h1>
                <p className="mt-6 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">
                  Own your acre of nature within 1–1.5 hrs from home.
                  <br className="hidden sm:block" /> Live it. Grow it. Build it. Retire in it.
                </p>

                {/* The one action in the hero. Everything else on this page is
                    something to read; this is the thing to do. */}
                <div className="mt-8">
                  <Link
                    href="/match"
                    className="inline-flex items-center gap-2.5 rounded-full bg-accent px-8 py-4 text-base font-semibold text-accent-foreground shadow-[0_14px_35px_rgba(197,106,74,0.32)] transition-transform hover:-translate-y-0.5"
                  >
                    Find My Land <ArrowRight className="h-5 w-5" />
                  </Link>
                  {/* The cost of pressing it, stated up front. */}
                  <p className="mt-3 flex items-center gap-1.5 text-sm text-white/65">
                    <Clock className="h-3.5 w-3.5" />
                    Takes 2 minutes
                  </p>
                </div>
              </div>
            </div>

            {/* The bottom line of the hero: assurances on the left, the shelf
                docked beside them on the same baseline and running off the right
                edge of the screen.

                This row deliberately sits outside the centred container. The
                left cell re-creates the container's gutter itself, while the
                right cell starts at exactly half the viewport and bleeds to the
                edge — which a max-width container cannot do.

                Stacked on a phone the assurances come first and the shelf
                second: the claim belongs with the copy above it, and the shelf
                is the thing you scroll. */}
            <div className="mt-12 grid grid-cols-1 items-end gap-8 lg:mt-14 lg:grid-cols-2">
              <div className="min-w-0 px-4 sm:px-6 lg:pl-[max(2.5rem,calc((100vw-1400px)/2+2.5rem))] lg:pr-0">
                <ul className="flex w-fit flex-wrap items-center gap-y-3 rounded-2xl px-1 ring-1 ring-inset ring-white/20 backdrop-blur-sm">
                  {HERO_ASSURANCES.map((item) => (
                    <li
                      key={item.label}
                      className="flex items-center gap-2 border-white/15 px-4 py-3 text-sm font-medium text-white/90 [&:not(:first-child)]:sm:border-l"
                    >
                      <item.icon className="h-4 w-4 text-white/70" />
                      {item.label}
                    </li>
                  ))}
                </ul>
              </div>

              {/* min-w-0: a grid item defaults to min-width:auto, so without it
                  the column grows to the rail's intrinsic width — fourteen
                  posters — and drags the whole layout sideways. */}
              <div className="min-w-0">
                <HeroShowcase />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------ Growth corridor */}
      <section id="corridor" className="scroll-mt-24 bg-[#f1ebdd]/45 py-16 lg:py-20">
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
            <GrowthMapDialog areas={coverage} />
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {GROWTH_ANCHORS.map((anchor) => {
              const { icon: Icon, tint, wash, ring, glow, short, line } = ANCHOR_STYLE[anchor.id];
              return (
                <article
                  key={anchor.id}
                  className={`flex flex-col items-center rounded-2xl bg-gradient-to-b ${wash} to-background px-4 py-7 text-center ring-1 ${ring} shadow-[0_10px_30px_rgba(15,23,42,0.06)]`}
                >
                  <span
                    className={`flex h-14 w-14 items-center justify-center rounded-2xl ${tint} ${glow}`}
                  >
                    <Icon className="h-6 w-6 text-white" />
                  </span>
                  <h3 className="mt-4 font-display-alt text-[13px] font-bold uppercase leading-snug tracking-[0.06em] text-foreground">
                    {short}
                  </h3>
                  <p className="mt-1.5 text-[11px] leading-snug text-muted-foreground">{line}</p>
                  {/* Never dropped for layout. The airport site is not settled,
                      and every surface that names it has to say so. */}
                  {anchor.disclaimer && (
                    <p className="mt-1.5 text-[11px] font-medium leading-snug text-accent">
                      {anchor.disclaimer}
                    </p>
                  )}
                </article>
              );
            })}
            {CORRIDOR_EXTRAS.map((item) => (
              <article
                key={item.title}
                className={`flex flex-col items-center rounded-2xl bg-gradient-to-b ${item.wash} to-background px-4 py-7 text-center ring-1 ${item.ring} shadow-[0_10px_30px_rgba(15,23,42,0.06)]`}
              >
                <span
                  className={`flex h-14 w-14 items-center justify-center rounded-2xl ${item.tint} ${item.glow}`}
                >
                  <item.icon className="h-6 w-6 text-white" />
                </span>
                <h3 className="mt-4 font-display-alt text-[13px] font-bold uppercase leading-snug tracking-[0.06em] text-foreground">
                  {item.title}
                </h3>
                <p className="mt-1.5 text-[11px] leading-snug text-muted-foreground">{item.line}</p>
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
      <section id="featured" className="scroll-mt-24 bg-[#f1ebdd]/45 py-16 lg:py-20">
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
            /* The same card the homepage uses, not a second one that drifts
               from it: it already carries the price treatment, the video and
               featured badges, and now the full tag row. */
            <DragRail className="mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {showcase.map((property) => (
                <div
                  key={property.slug}
                  className="min-w-[min(88vw,390px)] max-w-[390px] shrink-0 snap-start md:min-w-[360px]"
                >
                  <PropertyCard property={property} />
                </div>
              ))}
            </DragRail>
          )}
        </div>
      </section>

      {/* --------------------------------------------------------- Your journey */}
      <section id="journey" className="relative isolate scroll-mt-24 overflow-hidden bg-[#0e241b] py-16 lg:py-20">
        {/* A photograph under the green rather than flat colour. The band was
            five outline circles on a solid field — accurate, and completely
            inert. The image sits at low opacity behind a heavy scrim so the
            type keeps its contrast; it reads as depth, not as a picture. */}
        <Image
          src={EXPERIENCES[5].image}
          alt=""
          fill
          sizes="100vw"
          className="-z-10 object-cover opacity-[0.14]"
        />
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,#0e241b_0%,rgba(14,36,27,0.86)_45%,#0e241b_100%)]"
        />
        <div className="mx-auto grid max-w-[1400px] gap-10 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:gap-14 lg:px-10">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#ede6d5]/50">
              Your journey with A for Acre
            </p>
            <h2 className="mt-3 font-heading text-3xl font-semibold leading-tight text-[#ede6d5] sm:text-5xl">
              From discovery
              <br className="hidden sm:block" /> to your dream farm
            </h2>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-[#ede6d5]/65">
              A simple, transparent process for owning curated farmland around south Bengaluru.
            </p>

            <div className="relative mt-10">
              {/* The path itself. A curve that rises and falls across the row
                  reads as travel in a way a straight rule does not, and the two
                  dots sit on it as waypoints. Drawn only from lg up, where the
                  five cards actually sit side by side; stacked, there is no
                  line to draw. */}
              <svg
                aria-hidden
                viewBox="0 0 1000 60"
                preserveAspectRatio="none"
                className="aa-flow-path absolute -top-8 left-[6%] right-[6%] hidden h-10 w-[88%] lg:block"
              >
                <path
                  d="M0 52 C 120 6, 260 6, 380 34 S 620 62, 760 22 S 940 4, 1000 30"
                  fill="none"
                  stroke="rgba(224,189,124,0.45)"
                  strokeWidth="2"
                  strokeDasharray="7 9"
                  strokeLinecap="round"
                />
                <circle cx="380" cy="34" r="7" fill="#e0bd7c" />
                <circle cx="760" cy="22" r="7" fill="#e0bd7c" />
              </svg>

              <ol className="relative grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5 lg:gap-4">
                {JOURNEY_STEPS.map((step, i) => (
                  <li
                    key={step.title}
                    className={`aa-flow-step aa-flow-step-${i} flex flex-col overflow-hidden rounded-2xl bg-white/[0.05] ring-1 ring-inset ring-white/12`}
                  >
                    <div className="relative aspect-[4/3] w-full">
                      <Image
                        src={step.image}
                        alt=""
                        fill
                        sizes="(max-width: 1024px) 45vw, 240px"
                        className="object-cover"
                      />
                      <span
                        aria-hidden
                        className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,18,14,0.35)_0%,rgba(8,18,14,0.1)_45%,rgba(14,36,27,0.9)_100%)]"
                      />
                      {/* The ordinal, so the row reads in sequence rather than
                          as five parallel options. */}
                      <span className="absolute left-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-[#0e241b]/80 font-display-alt text-[11px] font-bold text-[#e0bd7c] ring-1 ring-inset ring-[#e0bd7c]/40 backdrop-blur">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {/* Straddling the image edge, which is what ties the
                          picture to the words underneath it. */}
                      <span className="absolute -bottom-5 left-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#143226] ring-1 ring-inset ring-[#e0bd7c]/30">
                        <step.icon className="h-4 w-4 text-[#e0bd7c]" />
                      </span>
                    </div>

                    <div className="flex flex-1 flex-col px-4 pb-5 pt-8">
                      <h3 className="font-heading text-base font-semibold leading-snug text-[#ede6d5]">
                        {step.title}
                      </h3>
                      <span aria-hidden className="mt-2.5 block h-px w-8 bg-[#e0bd7c]/70" />
                      <p className="mt-3 text-xs leading-relaxed text-[#ede6d5]/62">{step.body}</p>
                    </div>
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
      <footer className="border-t border-white/10 bg-[#0b1c15] py-12">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
          <dl className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {STATS.map((stat) => (
              <div key={stat.label} className="flex items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/[0.06] ring-1 ring-inset ring-[#e0bd7c]/25">
                  <stat.icon className="h-5 w-5 text-[#e0bd7c]" />
                </span>
                <div className="min-w-0">
                  <dd className="font-heading text-3xl font-semibold leading-none text-[#ede6d5]">
                    {stat.value}
                  </dd>
                  <dt className="mt-1.5 text-sm font-semibold text-[#ede6d5]">{stat.label}</dt>
                  <p className="mt-1 text-[11px] leading-relaxed text-[#ede6d5]/50">{stat.note}</p>
                </div>
              </div>
            ))}
          </dl>

          <div className="mt-10 flex flex-wrap items-end justify-between gap-4 border-t border-white/10 pt-6">
            <p className="text-[11px] text-[#ede6d5]/45">
              Curated farmland around south Bengaluru · design prototype
            </p>
            <p className="font-heading text-xl font-semibold text-[#ede6d5]">A for Acre</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
