"use client";

import { useRef, useState } from "react";
import { FileText, Loader2, MapPin, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { acresToGunta, acresToSqft } from "@/lib/land-units";

/**
 * Draft a listing from a pin or an RTC, without ever writing to it directly.
 *
 * Two sources feed this panel. A dropped pin goes out for research; an RTC scan
 * gets read. Both come back as a list of proposed values with an Apply button
 * on each, and nothing reaches the form until that button is pressed. The
 * difference matters: an RTC is a legal document, and an autofill that silently
 * populated a survey number would be a way to publish a misread one.
 *
 * Values are written by way of the native setter plus a dispatched input event,
 * so React-controlled fields in the surrounding form update their state rather
 * than silently reverting on the next render.
 */

interface Suggestion {
  label: string;
  /** Form field name to write into, or null for read-only context. */
  field: string | null;
  value: string;
}

interface LocationPayload {
  area: string;
  corridor: string;
  district: string;
  taluk: string;
  hobli: string;
  distanceFromBangaloreKm: number;
  nearbyLandmarks: string[];
  soilType: string;
  description: string;
  uncertain: string[];
  sources: string[];
}

interface RtcOwner {
  nameKannada: string;
  nameLatin: string;
  relation: string;
}

interface RtcPayload {
  surveyNumber: string;
  hissaNumber: string;
  villageKannada: string;
  villageLatin: string;
  hobliLatin: string;
  talukLatin: string;
  district: string;
  owners: RtcOwner[];
  extentAcre: string;
  extentGunta: string;
  landRevenueRupees: string;
  mutationReference: string;
  landClassification: string;
  validFrom: string;
  confidence: "high" | "medium" | "low";
  unreadableFields: string[];
  notes: string;
  extentAcresTotal: number | null;
}

/** Writes through React's own setter so controlled inputs pick the change up. */
function setFieldValue(form: HTMLFormElement, name: string, value: string): boolean {
  const field = form.elements.namedItem(name);
  if (!(field instanceof HTMLInputElement) && !(field instanceof HTMLTextAreaElement)) return false;

  const prototype = field instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(prototype, "value")?.set;
  setter?.call(field, value);
  field.dispatchEvent(new Event("input", { bubbles: true }));
  return true;
}

export function AiAssist({ formId }: { formId: string }) {
  const [busy, setBusy] = useState<"pin" | "rtc" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [caveats, setCaveats] = useState<string[]>([]);
  const [sources, setSources] = useState<string[]>([]);
  const [applied, setApplied] = useState<Set<string>>(new Set());
  const fileRef = useRef<HTMLInputElement>(null);

  function form(): HTMLFormElement | null {
    return document.getElementById(formId) as HTMLFormElement | null;
  }

  function reset() {
    setError(null);
    setSuggestions([]);
    setCaveats([]);
    setSources([]);
    setApplied(new Set());
  }

  async function researchPin() {
    const el = form();
    if (!el) return;
    const lat = (el.elements.namedItem("lat") as HTMLInputElement | null)?.value;
    const lng = (el.elements.namedItem("lng") as HTMLInputElement | null)?.value;

    if (!lat || !lng) {
      setError("Set the latitude and longitude first — that pin is what gets researched.");
      return;
    }

    reset();
    setBusy("pin");
    try {
      const response = await fetch("/api/admin/ai/location", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ lat: Number(lat), lng: Number(lng) }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Research failed.");

      const p = data as LocationPayload;
      setSuggestions(
        [
          { label: "Area", field: "area", value: p.area },
          { label: "Corridor", field: "corridor", value: p.corridor },
          { label: "Taluk", field: null, value: p.taluk },
          { label: "Hobli", field: null, value: p.hobli },
          { label: "District", field: null, value: p.district },
          {
            label: "Distance from Bengaluru (km)",
            field: "distanceFromBangaloreKm",
            value: p.distanceFromBangaloreKm ? String(p.distanceFromBangaloreKm) : "",
          },
          { label: "Soil type", field: "soilType", value: p.soilType },
          { label: "Nearby landmarks", field: "nearbyLandmarks", value: p.nearbyLandmarks.join("\n") },
          { label: "Description", field: "description", value: p.description },
        ].filter((s) => s.value)
      );
      setCaveats(p.uncertain);
      setSources(p.sources);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Research failed.");
    } finally {
      setBusy(null);
    }
  }

  async function readRtc(file: File) {
    reset();
    setBusy("rtc");
    try {
      const body = new FormData();
      body.append("rtc", file);
      const response = await fetch("/api/admin/ai/rtc", { method: "POST", body });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not read that RTC.");

      const r = data as RtcPayload;
      const owners = r.owners
        .map((o) => [o.nameLatin, o.relation].filter(Boolean).join(" "))
        .filter(Boolean)
        .join(", ");

      const next: Suggestion[] = [
        { label: "Survey number", field: "surveyNumber", value: r.surveyNumber },
        { label: "Hissa", field: null, value: r.hissaNumber },
        { label: "Village", field: "area", value: r.villageLatin },
        { label: "Hobli", field: null, value: r.hobliLatin },
        { label: "Taluk", field: null, value: r.talukLatin },
        { label: "District", field: null, value: r.district },
        // A listing does not carry the owner's name — we never expose vendor
        // identity to a buyer — so this is shown for the reviewer's eyes only.
        { label: "Owner on record", field: null, value: owners },
        { label: "Land classification", field: null, value: r.landClassification },
        { label: "Land revenue (₹)", field: null, value: r.landRevenueRupees },
        { label: "Mutation reference", field: null, value: r.mutationReference },
        { label: "Valid from", field: null, value: r.validFrom },
      ];

      if (r.extentAcresTotal !== null) {
        const acres = r.extentAcresTotal;
        next.splice(1, 0, {
          label: `Extent (${r.extentAcre || 0} acre ${r.extentGunta || 0} gunta)`,
          field: "extentAcres",
          value: String(Number(acres.toFixed(4))),
        });
        next.push({
          label: "Extent, converted",
          field: null,
          value: `${Number(acresToGunta(acres).toFixed(2))} guntas · ${Number(acres.toFixed(4))} acres · ${Math.round(
            acresToSqft(acres)
          ).toLocaleString("en-IN")} sq ft`,
        });
      }

      setSuggestions(next.filter((s) => s.value));
      setCaveats([
        ...(r.confidence !== "high"
          ? [`Model confidence on this scan is ${r.confidence}. Check every figure against the document.`]
          : []),
        ...r.unreadableFields.map((f) => `Could not read: ${f}`),
        ...(r.notes ? [r.notes] : []),
      ]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not read that RTC.");
    } finally {
      setBusy(null);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function apply(suggestion: Suggestion) {
    const el = form();
    if (!el || !suggestion.field) return;

    // The extent inputs are three linked units; writing acres alone would leave
    // the gunta and sq ft boxes showing the previous plot's numbers.
    if (suggestion.field === "extentAcres") {
      const acres = Number(suggestion.value);
      setFieldValue(el, "extentGunta", String(Number(acresToGunta(acres).toFixed(2))));
      setFieldValue(el, "extentAcresInput", suggestion.value);
      setFieldValue(el, "extentSqft", String(Math.round(acresToSqft(acres))));
    }

    const ok = setFieldValue(el, suggestion.field, suggestion.value);
    if (!ok && suggestion.field !== "extentAcres") {
      setError(`This form has no "${suggestion.label}" field — copy it across by hand.`);
      return;
    }
    setApplied((prev) => new Set(prev).add(suggestion.label));
  }

  function applyAll() {
    suggestions.filter((s) => s.field).forEach(apply);
  }

  const applicable = suggestions.filter((s) => s.field).length;

  return (
    <section className="rounded-[1.25rem] border border-accent/25 bg-accent/[0.05] p-4 sm:p-5">
      <div className="flex flex-wrap items-center gap-2">
        <Sparkles className="h-4 w-4 shrink-0 text-accent" />
        <h2 className="font-heading text-base font-semibold text-foreground">Fill this in from a pin or an RTC</h2>
      </div>
      <p className="mt-1.5 text-xs leading-6 text-muted-foreground">
        Everything below arrives as a proposal. Nothing is written into the form until you apply it, and nothing is
        published until you save.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="button" variant="pill-outline" size="sm" onClick={researchPin} disabled={busy !== null}>
          {busy === "pin" ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
          {busy === "pin" ? "Researching the pin…" : "Research this pin"}
        </Button>

        <Button
          type="button"
          variant="pill-outline"
          size="sm"
          onClick={() => fileRef.current?.click()}
          disabled={busy !== null}
        >
          {busy === "rtc" ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
          {busy === "rtc" ? "Reading the RTC…" : "Read an RTC"}
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void readRtc(file);
          }}
        />
      </div>

      {error && (
        <p className="mt-3 rounded-lg border border-destructive/35 bg-destructive/[0.07] px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      {suggestions.length > 0 && (
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Proposed values</p>
            {applicable > 0 && (
              <button type="button" onClick={applyAll} className="text-xs font-medium text-accent hover:underline">
                Apply all {applicable}
              </button>
            )}
          </div>

          <ul className="divide-y divide-border/60 overflow-hidden rounded-xl border border-border/60 bg-white/80">
            {suggestions.map((s) => (
              <li key={s.label} className="flex items-start justify-between gap-3 px-3 py-2.5">
                <div className="min-w-0">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{s.label}</p>
                  <p className="whitespace-pre-line break-words text-sm text-foreground">{s.value}</p>
                </div>
                {s.field ? (
                  <button
                    type="button"
                    onClick={() => apply(s)}
                    className="shrink-0 rounded-full border border-border px-3 py-1 text-xs font-medium text-foreground/80 transition-colors hover:border-accent/40 hover:text-accent"
                  >
                    {applied.has(s.label) ? "Applied" : "Apply"}
                  </button>
                ) : (
                  <span className="shrink-0 self-center text-[10px] uppercase tracking-wide text-muted-foreground/70">
                    Reference
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {caveats.length > 0 && (
        <ul className="mt-3 space-y-1">
          {caveats.map((c) => (
            <li key={c} className="text-xs leading-6 text-muted-foreground">
              · {c}
            </li>
          ))}
        </ul>
      )}

      {sources.length > 0 && (
        <p className="mt-3 text-[11px] leading-5 text-muted-foreground/80">
          Sources:{" "}
          {sources.map((url, i) => (
            <span key={url}>
              {i > 0 && ", "}
              <a href={url} target="_blank" rel="noreferrer noopener" className="underline hover:text-accent">
                {new URL(url).hostname.replace(/^www\./, "")}
              </a>
            </span>
          ))}
        </p>
      )}
    </section>
  );
}
