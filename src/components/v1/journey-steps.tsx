"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { CalendarCheck, FileCheck2, MapPinned, ScanSearch, Sprout } from "lucide-react";
import { EXPERIENCES } from "@/components/v1/experiences";

/**
 * The path from first visit to owning something.
 *
 * Two shapes, one list. Below lg it is a timeline: ordinals in their own rail
 * outside the cards, joined by a line, with a compact card beside each — five
 * tall photo cards stacked vertically made the section endless and buried the
 * step titles. From lg up it is the row of cards the reference shows.
 *
 * The ordinal for whichever step is currently in view lights up, so scrolling
 * the section reads as moving along the path rather than past five tiles. That
 * is the only reason this is a client component; the data below lives here
 * rather than on the page because lucide icons cannot be passed across the
 * server-to-client boundary as props.
 */

const STEPS = [
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
    // The paperwork step needed its own photograph: nothing in a farmland set
    // says "title verification".
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

export function JourneySteps() {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    const nodes = refs.current.filter(Boolean) as HTMLLIElement[];
    if (nodes.length === 0) return;

    // Whichever step is nearest the middle of the viewport wins. A plain
    // "isIntersecting" test lights up two or three at once on a tall screen,
    // which defeats the point of showing where you are.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const index = nodes.indexOf(entry.target as HTMLLIElement);
          if (index >= 0) setActive(index);
        }
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  return (
    <ol className="relative grid grid-cols-1 gap-0 lg:grid-cols-5 lg:gap-4">
      {STEPS.map((step, i) => {
        const lit = i <= active;
        return (
          <li
            key={step.title}
            ref={(node) => {
              refs.current[i] = node;
            }}
            className={`aa-flow-step aa-flow-step-${i} flex gap-4 lg:block`}
          >
            {/* The rail. Hidden from lg up, where the dashed curve above the
                row does this job instead. */}
            <div className="flex flex-col items-center lg:hidden">
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-display-alt text-[11px] font-bold transition-colors duration-300 ${
                  i === active
                    ? "bg-[#e0bd7c] text-[#0e241b] shadow-[0_0_0_5px_rgba(224,189,124,0.18)]"
                    : lit
                      ? "bg-[#e0bd7c]/45 text-[#0e241b]"
                      : "bg-white/10 text-[#ede6d5]/55 ring-1 ring-inset ring-white/15"
                }`}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              {i < STEPS.length - 1 && (
                <span
                  aria-hidden
                  className={`w-px flex-1 transition-colors duration-300 ${
                    i < active ? "bg-[#e0bd7c]/60" : "bg-white/12"
                  }`}
                />
              )}
            </div>

            <div className="mb-7 min-w-0 flex-1 overflow-hidden rounded-2xl bg-white/[0.05] ring-1 ring-inset ring-white/12 lg:mb-0 lg:flex lg:h-full lg:flex-col">
              <div className="relative h-24 w-full lg:aspect-[4/3] lg:h-auto">
                <Image
                  src={step.image}
                  alt=""
                  fill
                  sizes="(max-width: 1024px) 70vw, 240px"
                  className="object-cover"
                />
                <span
                  aria-hidden
                  className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,18,14,0.3)_0%,rgba(8,18,14,0.1)_45%,rgba(14,36,27,0.9)_100%)]"
                />
                {/* The ordinal repeats on the card only from lg up, where the
                    rail is gone. */}
                <span className="absolute left-3 top-3 hidden h-7 w-7 items-center justify-center rounded-full bg-[#0e241b]/80 font-display-alt text-[11px] font-bold text-[#e0bd7c] ring-1 ring-inset ring-[#e0bd7c]/40 backdrop-blur lg:flex">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="absolute -bottom-5 left-4 hidden h-10 w-10 items-center justify-center rounded-full bg-[#143226] ring-1 ring-inset ring-[#e0bd7c]/30 lg:flex">
                  <step.icon className="h-4 w-4 text-[#e0bd7c]" />
                </span>
              </div>

              <div className="flex flex-1 flex-col px-4 py-4 lg:pb-5 lg:pt-8">
                <h3 className="font-heading text-base font-semibold leading-snug text-[#ede6d5]">
                  {step.title}
                </h3>
                <span aria-hidden className="mt-2 block h-px w-8 bg-[#e0bd7c]/70" />
                <p className="mt-2.5 text-xs leading-relaxed text-[#ede6d5]/62">{step.body}</p>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
