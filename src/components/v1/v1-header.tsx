"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";

/**
 * The prototype's header: the brand lockup, and one thing to do.
 *
 * Everything else — the nav, the advisor number, the second CTA — has been
 * taken out. The hero below already carries the finder and the match CTA, so a
 * row of links above it was a second, competing set of choices over the top of
 * the one that matters.
 *
 * It starts transparent over the video and turns solid once the page scrolls
 * past it, so the logo never sits on moving footage.
 */
export function V1Header() {
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    function onScroll() {
      setSolid(window.scrollY > 24);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        solid ? "bg-background/92 shadow-[0_1px_0_rgba(15,23,42,0.06)] backdrop-blur" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-10">
        {/* The designed lockup, the same asset the public header uses — not the
            mark with the words set beside it, which was a second, slightly
            different wordmark. Over the video it is inverted to white: the
            artwork is dark ink meant for the cream background, and unmodified
            it disappears into the footage. */}
        <Link href="/" className="relative block h-11 w-[132px] shrink-0 sm:h-12 sm:w-[150px]">
          <Image
            src="/brand/logo.png"
            alt="A for Acre"
            fill
            priority
            sizes="150px"
            className={`object-contain object-left transition-[filter] duration-300 ${
              solid ? "" : "brightness-0 invert"
            }`}
          />
        </Link>

        <Link
          href="/explore"
          className={`inline-flex shrink-0 items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-colors ${
            solid
              ? "bg-[#0e241b] text-[#ede6d5] hover:bg-[#0e241b]/90"
              : "bg-white/92 text-[#0e241b] backdrop-blur hover:bg-white"
          }`}
        >
          Explore lands <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </header>
  );
}
