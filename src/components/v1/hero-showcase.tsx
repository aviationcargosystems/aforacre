"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { EXPERIENCES } from "@/components/v1/experiences";
import { DragRail } from "@/components/drag-rail";

/**
 * The hero's shelf of category posters — docked bottom-right, running off the
 * edge of the screen, looping forever.
 *
 * The track holds the seven cards three times over and the scroll position is
 * kept inside the middle copy: cross either boundary and it is shifted back by
 * exactly one copy — instantly, no animation, at a moment when the copies are
 * pixel-identical, so the jump cannot be seen. The result is a rail you can
 * drag, wheel, arrow or leave alone in either direction without ever reaching
 * an end.
 *
 * It bleeds off the right edge on purpose: a card cut by the viewport says
 * "there is more" far better than a tidy boundary does. That is also why there
 * is no snapping — a resting position mid-card is correct here.
 */

const ADVANCE_MS = 3200;

/**
 * Three, not two. See the wrap below — with two copies the browser's scroll
 * clamp sits below the forward wrap threshold, so the rail dead-ends.
 */
const COPIES = 3;

export function HeroShowcase() {
  const railRef = useRef<HTMLDivElement>(null);
  const [taken, setTaken] = useState(false);
  /** Guards the wrap against re-entering from the scroll it causes itself. */
  const wrapping = useRef(false);

  const wrap = useCallback(() => {
    const rail = railRef.current;
    if (!rail || wrapping.current) return;
    const copy = rail.scrollWidth / COPIES;
    if (copy <= 0) return;
    // The position is kept inside the middle copy, so there is always a full
    // copy of track on both sides and neither direction can run out.
    //
    // Two copies cannot do this. A browser clamps scrollLeft to
    // scrollWidth - clientWidth, which with two copies sits *below* the point
    // where a forward wrap would need to fire — so the rail silently
    // dead-ended at the last card instead of looping. Three copies put both
    // thresholds comfortably inside the reachable range.
    if (rail.scrollLeft >= copy * 2) {
      wrapping.current = true;
      rail.scrollLeft -= copy;
      wrapping.current = false;
    } else if (rail.scrollLeft < copy) {
      wrapping.current = true;
      rail.scrollLeft += copy;
      wrapping.current = false;
    }
  }, []);

  const step = useCallback((direction: 1 | -1) => {
    const rail = railRef.current;
    if (!rail) return;
    const card = rail.querySelector<HTMLElement>("[data-poster]");
    const by = (card?.offsetWidth ?? 168) + 12;
    rail.scrollBy({ left: direction * by, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    // Start in the middle copy, so there is a full copy of track behind as well
    // as ahead and the very first backwards drag has somewhere to go.
    rail.scrollLeft = rail.scrollWidth / COPIES;

    rail.addEventListener("scroll", wrap, { passive: true });
    return () => rail.removeEventListener("scroll", wrap);
  }, [wrap]);

  useEffect(() => {
    if (taken) return;
    const id = window.setInterval(() => step(1), ADVANCE_MS);
    return () => window.clearInterval(id);
  }, [taken, step]);

  return (
    <div className="relative min-w-0">
      <div className="mb-2.5 flex items-center gap-3 pl-4 sm:pl-6 lg:pl-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/65">
          Browse by experience
        </p>
        {/* Both controls sit at the leading edge. The rail runs off the right of
            the screen, so an arrow parked out there would be half off-screen. */}
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => {
              setTaken(true);
              step(-1);
            }}
            aria-label="Previous"
            className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-inset ring-white/25 backdrop-blur transition-colors hover:bg-white/30"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => {
              setTaken(true);
              step(1);
            }}
            aria-label="Next"
            className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-inset ring-white/25 backdrop-blur transition-colors hover:bg-white/30"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <DragRail
        innerRef={railRef}
        className="flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {/* Rendered three times — the extra copies are what the wrap lands on.
            They are hidden from assistive tech and untabbable, so the shelf
            reads as seven cards rather than twenty-one. */}
        {Array.from({ length: COPIES }, (_, copy) =>
          EXPERIENCES.map((item) => (
            <Link
              key={`${copy}-${item.label}`}
              data-poster
              href={`/explore?q=${encodeURIComponent(item.tag)}`}
              aria-hidden={copy !== 0}
              tabIndex={copy === 0 ? undefined : -1}
              onPointerDown={() => setTaken(true)}
              className="group relative block h-[230px] w-[150px] shrink-0 overflow-hidden rounded-xl ring-1 ring-inset ring-white/15 sm:h-[250px] sm:w-[168px]"
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
          ))
        )}
      </DragRail>
    </div>
  );
}
