"use client";

import { useState } from "react";
import {
  acresToGunta,
  acresToSqft,
  guntaToAcres,
  sqftToAcres,
} from "@/lib/land-units";

/**
 * Extent, entered in whichever unit the paperwork happens to use.
 *
 * An RTC states acre-gunta, a broker quotes guntas, and a buyer thinks in sq
 * ft. Forcing whoever is at the keyboard to do the conversion is how a decimal
 * point ends up in the wrong place, so all three are editable and the other two
 * follow. Acres stays the canonical value on the wire, because that is what the
 * property builder, pricing and every existing listing already use.
 *
 * Only the field being typed in is left alone while typing: rewriting the input
 * the user is currently editing would fight their cursor and round away digits
 * mid-keystroke.
 */

type Unit = "acre" | "gunta" | "sqft";

const inputClass =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring";

/** Trims float noise (0.30000000000000004) without forcing a fixed precision on round numbers. */
function tidy(value: number, places: number): string {
  if (!Number.isFinite(value) || value === 0) return "";
  return String(Number(value.toFixed(places)));
}

export function AreaInput({ defaultAcres }: { defaultAcres?: number }) {
  const initial = defaultAcres ?? 0;
  const [acres, setAcres] = useState(tidy(initial, 4));
  const [gunta, setGunta] = useState(tidy(acresToGunta(initial), 2));
  const [sqft, setSqft] = useState(tidy(acresToSqft(initial), 0));
  const [edited, setEdited] = useState<Unit | null>(null);

  function update(unit: Unit, raw: string) {
    setEdited(unit);
    const n = Number.parseFloat(raw);
    const valid = Number.isFinite(n) && n >= 0;

    if (unit === "acre") setAcres(raw);
    if (unit === "gunta") setGunta(raw);
    if (unit === "sqft") setSqft(raw);

    if (!valid) {
      // Blank or half-typed ("1.") — clear the derived fields rather than
      // showing a stale conversion of a number that is no longer there.
      if (unit !== "acre") setAcres("");
      if (unit !== "gunta") setGunta("");
      if (unit !== "sqft") setSqft("");
      return;
    }

    const inAcres = unit === "acre" ? n : unit === "gunta" ? guntaToAcres(n) : sqftToAcres(n);
    if (unit !== "acre") setAcres(tidy(inAcres, 4));
    if (unit !== "gunta") setGunta(tidy(acresToGunta(inAcres), 2));
    if (unit !== "sqft") setSqft(tidy(acresToSqft(inAcres), 0));
  }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <UnitField
          id="extentGunta"
          label="Guntas"
          value={gunta}
          step="0.01"
          onChange={(v) => update("gunta", v)}
          active={edited === "gunta"}
        />
        <UnitField
          id="extentAcresInput"
          label="Acres"
          value={acres}
          step="0.0001"
          onChange={(v) => update("acre", v)}
          active={edited === "acre"}
        />
        <UnitField
          id="extentSqft"
          label="Sq ft"
          value={sqft}
          step="1"
          onChange={(v) => update("sqft", v)}
          active={edited === "sqft"}
        />
      </div>

      {/* Acres is what the rest of the system stores. The three visible inputs
          are an entry convenience, not three separate pieces of data. */}
      <input type="hidden" name="extentAcres" value={acres} />
    </div>
  );
}

function UnitField({
  id,
  label,
  value,
  step,
  onChange,
  active,
}: {
  id: string;
  label: string;
  value: string;
  step: string;
  onChange: (value: string) => void;
  active: boolean;
}) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </label>
      <input
        id={id}
        type="number"
        min="0"
        step={step}
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputClass} ${active ? "" : "text-muted-foreground"}`}
      />
    </div>
  );
}
