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
      duration: 0.9,
      // Gentle exponential ease-out: quick to respond, no long glide at the end.
      easing: (t: number) => 1 - Math.pow(1 - t, 3),
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
