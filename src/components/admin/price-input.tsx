"use client";

import { useState } from "react";
import { GUNTA_PER_ACRE } from "@/lib/land-units";

/**
 * Price, in whichever unit it was quoted.
 *
 * Sellers in this belt quote per gunta as often as per acre, and making whoever
 * is at the keyboard multiply by forty first is how a zero goes missing. One
 * field with a unit toggle rather than two fields: only one of them is ever the
 * number someone was actually told, and showing both invites entering both.
 *
 * Per-acre is what gets submitted, because pricing, tax and every existing
 * listing already use it.
 */

const inputClass =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring";

type Unit = "acre" | "gunta";

export function PriceInput({ defaultPricePerAcre, label = "Price" }: { defaultPricePerAcre?: number; label?: string }) {
  const initial = defaultPricePerAcre ?? 0;
  const [unit, setUnit] = useState<Unit>("acre");
  const [value, setValue] = useState(initial > 0 ? String(Math.round(initial)) : "");

  const entered = Number.parseFloat(value);
  const perAcre = Number.isFinite(entered) && entered > 0 ? (unit === "acre" ? entered : entered * GUNTA_PER_ACRE) : 0;

  function switchUnit(next: Unit) {
    if (next === unit) return;
    // Carry the amount across so toggling shows the same price in the new unit
    // rather than silently reinterpreting the number already typed.
    if (perAcre > 0) {
      setValue(String(Math.round(next === "acre" ? perAcre : perAcre / GUNTA_PER_ACRE)));
    }
    setUnit(next);
  }

  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-medium text-foreground">{label} (₹)</span>
        <div className="inline-flex overflow-hidden rounded-full border border-border">
          {(["acre", "gunta"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => switchUnit(option)}
              className={`px-3 py-1 text-xs font-medium transition-colors ${
                unit === option ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground"
              }`}
            >
              per {option}
            </button>
          ))}
        </div>
      </div>

      <input
        type="number"
        min="0"
        step="any"
        inputMode="decimal"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={unit === "acre" ? "Price per acre" : "Price per gunta"}
        className={inputClass}
      />

      {/* Always per-acre on the wire, whichever unit was typed in. */}
      <input type="hidden" name="pricePerAcre" value={perAcre || ""} />

      {perAcre > 0 && (
        <p className="text-xs text-muted-foreground">
          {unit === "acre"
            ? `₹${Math.round(perAcre / GUNTA_PER_ACRE).toLocaleString("en-IN")} per gunta`
            : `₹${Math.round(perAcre).toLocaleString("en-IN")} per acre`}
        </p>
      )}
    </div>
  );
}
