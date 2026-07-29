"use client";

import { useActionState, useEffect, useState } from "react";
import { Camera, CheckCircle2, Loader2, MapPin, RefreshCw, Video } from "lucide-react";
import { submitLandAction, type LandSubmissionActionState } from "@/app/actions/land-submission";
import { Button } from "@/components/ui/button";
import { PinLocationPicker } from "@/components/map/pin-location-picker";
import { CANONICAL_PROPERTY_TAGS } from "@/lib/quiz";
import { guntaToAcres } from "@/lib/land-units";

const inputClass =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring";
const labelClass = "text-sm font-medium text-foreground";

const initialState: LandSubmissionActionState = { ok: false };

type GeoStatus = "idle" | "locating" | "success" | "error" | "unsupported";

const OWNER_TYPES: { value: string; label: string }[] = [
  { value: "owner", label: "Owner" },
  { value: "broker", label: "Broker" },
  { value: "reseller", label: "Reseller" },
];

export function LandSubmissionForm() {
  const [state, formAction, isPending] = useActionState(submitLandAction, initialState);
  const [geoStatus, setGeoStatus] = useState<GeoStatus>("idle");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [extentGunta, setExtentGunta] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const acresPreview = extentGunta && Number.isFinite(Number(extentGunta)) ? guntaToAcres(Number(extentGunta)) : null;

  function locate() {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setGeoStatus("unsupported");
      return;
    }
    setGeoStatus("locating");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude.toFixed(6));
        setLng(pos.coords.longitude.toFixed(6));
        setGeoStatus("success");
      },
      () => setGeoStatus("error"),
      { enableHighAccuracy: true, timeout: 12000 }
    );
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    locate();
  }, []);

  function toggleTag(tag: string) {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  }

  if (state.ok) {
    return (
      <div className="flex items-center gap-2 rounded-md border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary">
        <CheckCircle2 className="h-4 w-4 shrink-0" /> {state.message}
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-6">
      {state.message && !state.ok && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {state.message}
        </div>
      )}

      <div className="space-y-1.5">
        <label className={labelClass}>Photos</label>
        <label
          htmlFor="images"
          className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-input bg-background py-8 text-center text-sm text-muted-foreground"
        >
          <Camera className="h-6 w-6" />
          Tap to add photos
          <input id="images" name="images" type="file" accept="image/*" multiple className="sr-only" />
        </label>
      </div>

      <div className="space-y-1.5">
        <label className={labelClass}>Videos (optional)</label>
        <label
          htmlFor="videos"
          className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-input bg-background py-6 text-center text-sm text-muted-foreground"
        >
          <Video className="h-5 w-5" />
          Tap to add videos
          <input id="videos" name="videos" type="file" accept="video/*" multiple className="sr-only" />
        </label>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="area" className={labelClass}>
          Area / village
        </label>
        <input id="area" name="area" required placeholder="e.g. Harohalli" className={inputClass} />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className={labelClass}>Location</label>
          <button
            type="button"
            onClick={locate}
            className="flex items-center gap-1 text-xs font-medium text-accent"
            disabled={geoStatus === "locating"}
          >
            {geoStatus === "locating" ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
            Refresh
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <input name="lat" value={lat} onChange={(e) => setLat(e.target.value)} placeholder="Latitude" inputMode="decimal" className={inputClass} />
          <input name="lng" value={lng} onChange={(e) => setLng(e.target.value)} placeholder="Longitude" inputMode="decimal" className={inputClass} />
        </div>
        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" />
          {geoStatus === "locating" && "Getting your location…"}
          {geoStatus === "success" && "Captured — or drop a pin below to fine-tune."}
          {geoStatus === "error" && "Couldn't get your location — drop a pin below or enter it manually."}
          {geoStatus === "unsupported" && "Location isn't available on this device — drop a pin below."}
          {geoStatus === "idle" && "Waiting for permission…"}
        </p>
        <div className="h-56 overflow-hidden rounded-md border border-border">
          <PinLocationPicker
            lat={lat ? Number(lat) : null}
            lng={lng ? Number(lng) : null}
            onPick={(newLat, newLng) => {
              setLat(newLat.toFixed(6));
              setLng(newLng.toFixed(6));
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="extentGunta" className={labelClass}>
            Size (gunta)
          </label>
          <input
            id="extentGunta"
            name="extentGunta"
            type="number"
            step="0.1"
            value={extentGunta}
            onChange={(e) => setExtentGunta(e.target.value)}
            placeholder="e.g. 80"
            className={inputClass}
          />
          <p className="text-xs text-muted-foreground">
            40 gunta = 1 acre, 1 gunta = 1,089 sq ft.{" "}
            {acresPreview !== null && <span className="font-medium text-foreground">≈ {acresPreview.toFixed(2)} acres</span>}
          </p>
          <input type="hidden" name="extentAcres" value={acresPreview !== null ? acresPreview.toFixed(2) : ""} />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="expectedPricePerGunta" className={labelClass}>
            Expected price per gunta (₹)
          </label>
          <input
            id="expectedPricePerGunta"
            name="expectedPricePerGunta"
            type="number"
            step="1000"
            placeholder="e.g. 500000"
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <p className={labelClass}>Property type</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {CANONICAL_PROPERTY_TAGS.map((tag) => (
            <button key={tag} type="button" onClick={() => toggleTag(tag)}>
              <span
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  selectedTags.includes(tag) ? "border-primary bg-primary text-primary-foreground" : "border-input bg-background text-foreground"
                }`}
              >
                {tag}
              </span>
              {selectedTags.includes(tag) && <input type="hidden" name="tags" value={tag} />}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="ownerName" className={labelClass}>
            Your name
          </label>
          <input id="ownerName" name="ownerName" required className={inputClass} />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="phone" className={labelClass}>
            Phone number
          </label>
          <input id="phone" name="phone" required type="tel" className={inputClass} />
        </div>
      </div>

      <div>
        <p className={labelClass}>You are the</p>
        <div className="mt-2 flex flex-wrap gap-4">
          {OWNER_TYPES.map((t) => (
            <label key={t.value} className="flex items-center gap-1.5 text-sm text-foreground">
              <input type="radio" name="ownerType" value={t.value} defaultChecked={t.value === "owner"} className="h-4 w-4" />
              {t.label}
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="notes" className={labelClass}>
          Notes
        </label>
        <textarea id="notes" name="notes" rows={3} placeholder="Fencing, water source, road access, anything worth mentioning" className={inputClass} />
      </div>

      <Button type="submit" disabled={isPending} variant="pill" size="pill" className="w-full">
        {isPending ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : null}
        {isPending ? "Submitting…" : "Submit land"}
      </Button>
    </form>
  );
}
