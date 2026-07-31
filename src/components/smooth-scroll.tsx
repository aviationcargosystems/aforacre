"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/**
 * Smooth scrolling, everywhere except where it would fight something else.
 *
 * Lenis takes over the window scroll and animates it. Two things must be kept
 * out of its way: any element that scrolls on its own (the carousels, the
 * explore listing column) and Leaflet, which reads wheel events directly. Both
 * are handled by `prevent`, which tells Lenis to leave a subtree alone rather
 * than hijacking its wheel events.
 */
export function SmoothScroll() {
  useEffect(() => {
    // Honour the OS setting. Smooth scrolling is exactly the kind of motion
    // people turn this on to avoid.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      // Linear follow rather than a timed ease.
      //
      // `duration` + `easing` animates each wheel event over a fixed span, which
      // is what gave the page its slightly rubbery arrival — the tail of the
      // cubic ease-out is slow, so the last few pixels drift in after the wheel
      // has stopped. `lerp` instead moves a constant fraction of the remaining
      // distance every frame: the rate is even, it tracks the wheel one-to-one,
      // and it settles without the glide. 0.12 is smooth without feeling heavy.
      lerp: 0.12,
      prevent: (node) =>
        node.classList?.contains("leaflet-container") ||
        Boolean(node.closest?.(".leaflet-container, [data-lenis-prevent], [data-featured-card]")),
    });

    let frame = 0;
    function raf(time: number) {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    }
    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, []);

  return null;
}
