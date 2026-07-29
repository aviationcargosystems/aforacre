"use client";

import { useState } from "react";
import { GUNTA_PER_ACRE } from "@/lib/land-units";

/**
 * Price, in whichever unit it was quoted.
 *
 * Sellers in this belt quote per gunta as often as per acre, and asking whoever
 * is at the keyboard to multiply by forty first is how a zero goes missing.
 * Per-acre stays the stored value because that is what pricing, tax and every
 * existing listing already use.
 *
 * The field being typed into is left alone while typing — rewriting it would
 * fight the cursor and round digits away mid-keystroke.
 */

const inputClass =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring";

function tidy(value: number): string {
  if (!Number.isFinite(value) || value === 0) return "";
  return String(Math.round(value));
}

export function PriceInput({ defaultPricePerAcre }: { defaultPricePerAcre?: number }) {
  const initial = defaultPricePerAcre ?? 0;
  const [perAcre, setPerAcre] = useState(tidy(initial));
  const [perGunta, setPerGunta] = useState(tidy(initial / GUNTA_PER_ACRE));
  const [edited, setEdited] = useState<"acre" | "gunta" | null>(null);

  function update(unit: "acre" | "gunta", raw: string) {
    setEdited(unit);
    const n = Number.parseFloat(raw);
    const valid = Number.isFinite(n) && n >= 0;

    if (unit === "acre") {
      setPerAcre(raw);
      setPerGunta(valid ? tidy(n / GUNTA_PER_ACRE) : "");
    } else {
      setPerGunta(raw);
      setPerAcre(valid ? tidy(n * GUNTA_PER_ACRE) : "");
    }
  }

  return (
    <div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="pricePerGunta" className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Price per gunta (₹)
          </label>
          <input
            id="pricePerGunta"
            type="number"
            min="0"
            step="any"
            inputMode="decimal"
            value={perGunta}
            onChange={(e) => update("gunta", e.target.value)}
            className={`${inputClass} ${edited === "gunta" ? "" : "text-muted-foreground"}`}
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="pricePerAcre" className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Price per acre (₹)
          </label>
          <input
            id="pricePerAcre"
            name="pricePerAcre"
            type="number"
            min="0"
            step="any"
            inputMode="decimal"
            value={perAcre}
            onChange={(e) => update("acre", e.target.value)}
            className={`${inputClass} ${edited === "acre" ? "" : "text-muted-foreground"}`}
          />
        </div>
      </div>
    </div>
  );
}
