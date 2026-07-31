"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, Phone, X } from "lucide-react";

/**
 * The prototype's own header.
 *
 * /v1 is on the bare-chrome list because the reference puts a wide nav and a
 * phone number above a full-bleed hero, which the marketing header does not do.
 * It starts transparent over the hero video and turns solid once the page has
 * scrolled past it, so the logo does not sit on moving footage.
 */

const NAV = [
  { href: "/explore", label: "Discover land" },
  { href: "#corridor", label: "Why south Bengaluru" },
  { href: "#experience", label: "By experience" },
  { href: "#featured", label: "Featured" },
  { href: "#journey", label: "How it works" },
];

/** Placeholder until a real advisor line is provisioned. */
const ADVISOR_PHONE = "+91 88888 44101";

export function V1Header() {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);

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
      <div className="mx-auto flex max-w-[1400px] items-center gap-6 px-4 py-3 sm:px-6 lg:px-10">
        <Link href="/v1" className="flex shrink-0 items-center gap-2.5">
          <Image
            src="/brand/icon.png"
            alt=""
            width={40}
            height={40}
            className={`h-9 w-9 rounded-lg transition-colors ${solid ? "" : "bg-white/85 p-0.5"}`}
          />
          <span className="min-w-0">
            <span
              className={`block font-heading text-xl font-semibold leading-none transition-colors ${
                solid ? "text-foreground" : "text-white"
              }`}
            >
              A for Acre
            </span>
            <span
              className={`mt-1 hidden text-[9px] uppercase tracking-[0.16em] transition-colors sm:block ${
                solid ? "text-muted-foreground" : "text-white/70"
              }`}
            >
              Curated farmland around south Bengaluru
            </span>
          </span>
        </Link>

        <nav className="ml-auto hidden items-center gap-6 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm font-medium transition-colors ${
                solid ? "text-foreground/75 hover:text-foreground" : "text-white/85 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-4 lg:ml-0">
          <a
            href={`tel:${ADVISOR_PHONE.replace(/\s/g, "")}`}
            className={`hidden items-center gap-2 transition-colors sm:flex ${
              solid ? "text-foreground" : "text-white"
            }`}
          >
            <Phone className="h-4 w-4 opacity-70" />
            <span className="leading-tight">
              <span className={`block text-[10px] ${solid ? "text-muted-foreground" : "text-white/65"}`}>
                Talk to a land advisor
              </span>
              <span className="block text-sm font-semibold">{ADVISOR_PHONE}</span>
            </span>
          </a>
          <Link
            href="/match"
            className="hidden rounded-full bg-[#0e241b] px-5 py-2.5 text-sm font-semibold text-[#ede6d5] transition-colors hover:bg-[#0e241b]/90 sm:inline-flex"
          >
            Schedule a visit
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            className={`lg:hidden ${solid ? "text-foreground" : "text-white"}`}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border/60 bg-background px-4 pb-5 pt-3 sm:px-6 lg:hidden">
          <nav className="flex flex-col">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="border-b border-border/50 py-3 text-sm font-medium text-foreground/80"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <Link
            href="/match"
            onClick={() => setOpen(false)}
            className="mt-4 flex justify-center rounded-full bg-[#0e241b] px-5 py-3 text-sm font-semibold text-[#ede6d5]"
          >
            Schedule a visit
          </Link>
        </div>
      )}
    </header>
  );
}
