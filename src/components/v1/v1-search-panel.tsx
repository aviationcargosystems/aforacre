"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LayoutGrid, Search } from "lucide-react";
import { EXPERIENCES } from "@/components/v1/experiences";

/**
 * The hero's land finder.
 *
 * Four filters and a chip row, matching the reference. Only one of them
 * actually reaches the catalogue: /explore takes a single free-text `q`, so
 * that is what this composes and hands over. Land size, budget and purpose are
 * folded into the same string rather than pretending to be structured filters
 * the explore route does not have — if this panel graduates out of the
 * prototype, /explore needs real query params first.
 */

const SIZE_OPTIONS = ["Under 1 acre", "1 – 2 acres", "2 – 5 acres", "5 acres and above"];
const BUDGET_OPTIONS = ["Under ₹75L", "₹75L – ₹1Cr", "₹1Cr – ₹2Cr", "₹2Cr – ₹5Cr", "₹5Cr and above"];
const PURPOSE_OPTIONS = [
  "Weekend farmhouse",
  "Retirement home",
  "Commercial farming",
  "Organic farming",
  "Long-term investment",
];

const selectClass =
  "w-full appearance-none bg-transparent pr-6 text-sm font-medium text-[#ede6d5] outline-none [&>option]:bg-[#0e241b] [&>option]:text-[#ede6d5]";

function Field({
  label,
  placeholder,
  options,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  options: string[];
  value: string;
  onChange: (next: string) => void;
}) {
  return (
    <label className="block min-w-0 rounded-xl bg-white/[0.06] px-4 py-3 ring-1 ring-inset ring-white/12 transition-colors focus-within:ring-white/35">
      <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-[#ede6d5]/50">
        {label}
      </span>
      <span className="relative mt-1 block">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${selectClass} ${value ? "" : "text-[#ede6d5]/45"}`}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        {/* The native arrow is drawn by the OS and ignores the palette, so it is
            suppressed above and redrawn here in the panel's own cream. */}
        <span
          aria-hidden
          className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-[#ede6d5]/45"
        >
          ▾
        </span>
      </span>
    </label>
  );
}

export function V1SearchPanel({ areas }: { areas: string[] }) {
  const router = useRouter();
  const [area, setArea] = useState("");
  const [size, setSize] = useState("");
  const [budget, setBudget] = useState("");
  const [purpose, setPurpose] = useState("");
  const [activeTag, setActiveTag] = useState("All");

  function explore() {
    const q = [area, purpose, activeTag === "All" ? "" : activeTag].filter(Boolean).join(" ").trim();
    router.push(q ? `/explore?q=${encodeURIComponent(q)}` : "/explore");
  }

  return (
    <div className="rounded-[1.75rem] bg-[#0e241b]/92 p-4 shadow-[0_30px_80px_rgba(8,18,14,0.45)] backdrop-blur-md sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-heading text-lg font-semibold text-[#ede6d5]">
            Let&apos;s find the right land for you
          </p>
          <p className="mt-1 text-sm text-[#ede6d5]/60">
            Answer four questions and we will shortlist what fits.
          </p>
        </div>
        <a
          href="/match"
          className="inline-flex items-center gap-3 rounded-xl bg-white/[0.06] px-4 py-2.5 ring-1 ring-inset ring-white/12 transition-colors hover:bg-white/12"
        >
          <span>
            <span className="block text-sm font-medium text-[#ede6d5]">Start with AFORACRE</span>
            <span className="block text-[11px] text-[#ede6d5]/55">AI land persona</span>
          </span>
          <span aria-hidden className="text-[#ede6d5]/70">
            →
          </span>
        </a>
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-[repeat(4,minmax(0,1fr))_auto]">
        <Field
          label="Location / Area"
          placeholder="Where do you want land?"
          options={areas}
          value={area}
          onChange={setArea}
        />
        <Field
          label="Land size"
          placeholder="Min – max (acres)"
          options={SIZE_OPTIONS}
          value={size}
          onChange={setSize}
        />
        <Field
          label="Budget"
          placeholder="Select budget"
          options={BUDGET_OPTIONS}
          value={budget}
          onChange={setBudget}
        />
        <Field
          label="Purpose"
          placeholder="What is your intent?"
          options={PURPOSE_OPTIONS}
          value={purpose}
          onChange={setPurpose}
        />
        <button
          type="button"
          onClick={explore}
          className="inline-flex h-full min-h-[3.5rem] items-center justify-center gap-2 rounded-xl bg-accent px-6 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/90"
        >
          <Search className="h-4 w-4" />
          Explore lands
        </button>
      </div>

      {/* The same seven categories the tile rail shows, from one shared list so
          the two cannot drift apart. Fixed rather than driven by the tag
          vocabulary: these are how someone describes what they want before they
          know our tags, and the row should not change shape as tags are added. */}
      <div className="mt-5 flex flex-wrap gap-2">
        {[{ tag: "All", icon: LayoutGrid }, ...EXPERIENCES].map((item) => {
          const Icon = item.icon;
          const active = activeTag === item.tag;
          return (
            <button
              key={item.tag}
              type="button"
              onClick={() => setActiveTag(item.tag)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                active
                  ? "bg-[#ede6d5] text-[#0e241b]"
                  : "bg-white/[0.06] text-[#ede6d5]/70 ring-1 ring-inset ring-white/10 hover:bg-white/12 hover:text-[#ede6d5]"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {item.tag}
            </button>
          );
        })}
      </div>
    </div>
  );
}
