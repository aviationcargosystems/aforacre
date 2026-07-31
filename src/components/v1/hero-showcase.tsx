"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { EXPERIENCES } from "@/components/v1/experiences";
import { DragRail } from "@/components/drag-rail";

/**
 * The hero's shelf of category posters.
 *
 * Tall, image-led cards inside a bounded glass panel, with the arrows straddling
 * its left and right edges. The panel matters: without it the cards floated on
 * the footage and the one at the edge always looked cut off rather than
 * scrollable.
 *
 * It is a real scroller — native touch and wheel, pointer drag via DragRail,
 * plus the arrows — that also advances itself every few seconds until somebody
 * takes hold of it. Scroll snapping means every resting position lands on a
 * card boundary rather than mid-poster.
 */

const ADVANCE_MS = 3600;

export function HeroShowcase() {
  const railRef = useRef<HTMLDivElement>(null);
  const [taken, setTaken] = useState(false);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const readEdges = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;
    setAtStart(rail.scrollLeft <= 2);
    // 2px of slack: fractional layout widths mean scrollLeft rarely reaches the
    // maximum exactly, which would leave the forward arrow permanently enabled.
    setAtEnd(rail.scrollLeft >= rail.scrollWidth - rail.clientWidth - 2);
  }, []);

  const step = useCallback(
    (direction: 1 | -1) => {
      const rail = railRef.current;
      if (!rail) return;
      const card = rail.querySelector<HTMLElement>("[data-poster]");
      const by = (card?.offsetWidth ?? 150) + 12;
      rail.scrollBy({ left: direction * by, behavior: "smooth" });
      // Re-read the edges once the smooth scroll has landed. The scroll event
      // alone is not enough: at the last card scrollBy has nowhere to go, fires
      // no scroll event, and the forward arrow would sit there enabled and
      // doing nothing.
      window.setTimeout(readEdges, 450);
    },
    [readEdges]
  );

  useEffect(() => {
    if (taken) return;
    const id = window.setInterval(() => {
      const rail = railRef.current;
      if (!rail) return;
      const end = rail.scrollLeft >= rail.scrollWidth - rail.clientWidth - 2;
      if (end) {
        rail.scrollTo({ left: 0, behavior: "smooth" });
        window.setTimeout(readEdges, 450);
      } else {
        step(1);
      }
    }, ADVANCE_MS);
    return () => window.clearInterval(id);
  }, [taken, step, readEdges]);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    readEdges();
    rail.addEventListener("scroll", readEdges, { passive: true });
    return () => rail.removeEventListener("scroll", readEdges);
  }, [readEdges]);

  return (
    <div className="relative min-w-0">
      <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/65">
        Browse by experience
      </p>

      <div className="relative rounded-[1.5rem] bg-white/[0.07] p-3 ring-1 ring-inset ring-white/15 backdrop-blur-md">
        <DragRail
          innerRef={railRef}
          className="flex snap-x snap-mandatory gap-3 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {EXPERIENCES.map((item) => (
            <Link
              key={item.label}
              data-poster
              href={`/explore?q=${encodeURIComponent(item.tag)}`}
              onPointerDown={() => setTaken(true)}
              className="group relative block h-[230px] w-[150px] shrink-0 snap-start overflow-hidden rounded-xl ring-1 ring-inset ring-white/15 sm:h-[260px] sm:w-[168px]"
            >
              <Image
                src={item.image}
                alt=""
                fill
                sizes="168px"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <span
                aria-hidden
                className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,18,14,0)_38%,rgba(8,18,14,0.88)_100%)]"
              />
              <span className="absolute inset-x-0 bottom-0 p-3">
                <span className="block text-sm font-semibold leading-tight text-white">{item.label}</span>
                <span className="mt-0.5 block truncate text-[11px] text-white/70">{item.body}</span>
              </span>
            </Link>
          ))}
        </DragRail>

        {/* Straddling the panel edge, so they read as controls for the shelf
            rather than as two more things inside it. */}
        <button
          type="button"
          onClick={() => {
            setTaken(true);
            step(-1);
          }}
          disabled={atStart}
          aria-label="Previous"
          className="absolute -left-4 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-[#0e241b]/85 text-white ring-1 ring-inset ring-white/25 backdrop-blur transition-opacity hover:bg-[#0e241b] disabled:opacity-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => {
            setTaken(true);
            step(1);
          }}
          disabled={atEnd}
          aria-label="Next"
          className="absolute -right-4 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-[#0e241b]/85 text-white ring-1 ring-inset ring-white/25 backdrop-blur transition-opacity hover:bg-[#0e241b] disabled:opacity-0"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
