"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Camera, CheckCircle2, ExternalLink, Loader2, MapPin, RefreshCw } from "lucide-react";
import { submitCaptureAction, type CaptureActionState } from "@/app/capture/actions";
import { Button } from "@/components/ui/button";
import { PinLocationPicker } from "@/components/map/pin-location-picker";
import { AreaInput } from "@/components/admin/area-input";
import { AiAssist } from "@/components/admin/ai-assist";
import { KHATA_OPTIONS, LAND_OBSERVATIONS } from "@/components/admin/property-form-shared";

/**
 * Capture, with as much or as little detail as the person on site has.
 *
 * The original twenty-second path is the one that must not regress: photos, a
 * pin, save. Everything past step one is optional and the save button sits
 * outside the stepper, so a broker standing in a field on 4G never has to walk
 * through screens they have nothing to put in.
 *
 * Steps are hidden rather than unmounted. An unmounted step's inputs leave the
 * form, so anything typed on step three would vanish the moment someone stepped
 * back to check a photo.
 */

const inputClass =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring";
const labelClass = "text-sm font-medium text-foreground";

const initialState: CaptureActionState = { ok: false };

type GeoStatus = "idle" | "locating" | "success" | "error" | "unsupported";

const STEPS = ["Site", "Details", "Documents"] as const;

export function CaptureForm({
  properties,
  existingTags = [],
  variant = "public",
}: {
  properties: { slug: string; title: string }[];
  existingTags?: string[];
  /** "admin" is for staff already logged into /admin — adds a map pin, skips the "who are you" field. */
  variant?: "public" | "admin";
}) {
  // The map is for everyone. Two decimal boxes are a fine way to *store* a
  // location and a poor way to check one: somebody in a field has no way to
  // tell 12.6801 from 12.6810 without seeing it on a map, and that is roughly a
  // kilometre of difference.
  const showCapturedBy = variant === "public";
  // RTC reading and pin research go through admin-only API routes, so the
  // panel is only useful to someone already signed in.
  const showAssist = variant === "admin";

  const [state, formAction, isPending] = useActionState(submitCaptureAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  const [step, setStep] = useState(0);
  const [geoStatus, setGeoStatus] = useState<GeoStatus>("idle");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [previews, setPreviews] = useState<string[]>([]);
  const [videoPreviews, setVideoPreviews] = useState<string[]>([]);
  const [rtcPreview, setRtcPreview] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [capturedBy, setCapturedBy] = useState("");
  const [submitCount, setSubmitCount] = useState(0);

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
        setAccuracy(pos.coords.accuracy);
        setGeoStatus("success");
      },
      () => setGeoStatus("error"),
      { enableHighAccuracy: true, timeout: 12000 }
    );
  }

  useEffect(() => {
    // Mount-time sync with two external systems (geolocation permission prompt,
    // localStorage) — not reacting to React state, so the direct setState calls
    // inside locate() / below are intentional here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    locate();
    const saved = window.localStorage.getItem("pa_captured_by");
    if (saved) setCapturedBy(saved);
  }, []);

  useEffect(() => {
    // Resets the form once the server action reports success — reacting to
    // useActionState's result is the documented pattern for this.
    if (state.ok) {
      formRef.current?.reset();
      previews.forEach((url) => URL.revokeObjectURL(url));
      videoPreviews.forEach((url) => URL.revokeObjectURL(url));
      if (rtcPreview) URL.revokeObjectURL(rtcPreview);
      /* eslint-disable react-hooks/set-state-in-effect */
      setPreviews([]);
      setVideoPreviews([]);
      setRtcPreview(null);
      setSelectedTags([]);
      setStep(0);
      /* eslint-enable react-hooks/set-state-in-effect */
      setSubmitCount((n) => n + 1);
      locate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  function onCapturedByChange(value: string) {
    setCapturedBy(value);
    window.localStorage.setItem("pa_captured_by", value);
  }

  function onFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
    previews.forEach((url) => URL.revokeObjectURL(url));
    const files = Array.from(e.target.files ?? []);
    setPreviews(files.map((f) => URL.createObjectURL(f)));
  }

  const hasPin = Boolean(lat && lng);

  function onVideosChange(e: React.ChangeEvent<HTMLInputElement>) {
    videoPreviews.forEach((url) => URL.revokeObjectURL(url));
    setVideoPreviews(Array.from(e.target.files ?? []).map((f) => URL.createObjectURL(f)));
  }

  function toggleTag(tag: string) {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  }

  return (
    <form id="capture-form" ref={formRef} action={formAction} className="space-y-6" key={submitCount}>
      {state.ok && (
        <div className="flex items-center gap-2 rounded-md border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {state.message}
        </div>
      )}

      <nav className="flex flex-wrap gap-1.5">
        {STEPS.map((label, i) => (
          <button
            key={label}
            type="button"
            onClick={() => setStep(i)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              step === i
                ? "bg-primary text-primary-foreground"
                : "border border-border bg-background text-muted-foreground hover:text-foreground"
            }`}
          >
            {i + 1}. {label}
          </button>
        ))}
      </nav>

      {step > 0 && (
        <p className="text-xs text-muted-foreground">Everything from here on is optional. Save whenever you are done.</p>
      )}

      {/* Step 1 — the only part that matters when you are standing in a field. */}
      <div className={step === 0 ? "space-y-6" : "hidden"}>
        <div className="space-y-1.5">
          <label className={labelClass}>Photos</label>
          <label
            htmlFor="images"
            className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-input bg-background py-8 text-center text-sm text-muted-foreground"
          >
            <Camera className="h-6 w-6" />
            Tap to take or choose photos
            <input
              id="images"
              name="images"
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              onChange={onFilesChange}
              className="sr-only"
            />
          </label>
          {previews.length > 0 && (
            <div className="grid grid-cols-3 gap-2 pt-2">
              {previews.map((src, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i} src={src} alt="" className="aspect-square rounded-md object-cover" />
              ))}
            </div>
          )}
        </div>

        {/* Optional, and deliberately below the photos. A slope or an approach
            road reads on video and does not read in a still, but nobody should
            be waiting on a clip to upload before they can save a capture. */}
        <div className="space-y-1.5">
          <label htmlFor="videos" className={labelClass}>
            Video <span className="font-normal text-muted-foreground">(optional)</span>
          </label>
          <input
            id="videos"
            name="videos"
            type="file"
            accept="video/*"
            capture="environment"
            multiple
            onChange={onVideosChange}
            className={inputClass}
          />
          {videoPreviews.length > 0 && (
            <div className="grid grid-cols-2 gap-2 pt-1">
              {videoPreviews.map((src) => (
                <video key={src} src={src} controls preload="metadata" className="w-full rounded-md bg-black" />
              ))}
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            Keep clips short — they upload as-is, so a long one is slow on mobile data.
          </p>
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
              {geoStatus === "locating" ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <RefreshCw className="h-3 w-3" />
              )}
              Refresh
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input
              aria-label="Latitude"
              name="lat"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              placeholder="Latitude"
              inputMode="decimal"
              className={inputClass}
            />
            <input
              aria-label="Longitude"
              name="lng"
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              placeholder="Longitude"
              inputMode="decimal"
              className={inputClass}
            />
          </div>
          <input type="hidden" name="locationAccuracyM" value={accuracy ?? ""} />
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            {geoStatus === "locating" && "Getting your location…"}
            {geoStatus === "success" && `Captured${accuracy ? ` (±${Math.round(accuracy)}m)` : ""} — or edit manually.`}
            {geoStatus === "error" && "Couldn't get your location — enter it manually, or continue without it."}
            {geoStatus === "unsupported" && "Location isn't available on this device — enter it manually if you have it."}
            {geoStatus === "idle" && "Waiting for permission…"}
          </p>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">
              Drop a pin — tap the map, or drag the marker to fine-tune.
            </p>
            <div className="h-64 overflow-hidden rounded-md border border-border">
              <PinLocationPicker
                lat={lat ? Number(lat) : null}
                lng={lng ? Number(lng) : null}
                onPick={(newLat, newLng) => {
                  setLat(newLat.toFixed(6));
                  setLng(newLng.toFixed(6));
                  setAccuracy(null);
                }}
              />
            </div>
          </div>

          {hasPin && (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-accent hover:underline"
            >
              <ExternalLink className="h-3 w-3" />
              Open this pin in Google Maps
            </a>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="label" className={labelClass}>
            Site label
          </label>
          <input id="label" name="label" placeholder="e.g. Plot behind Uyyamballi lake" className={inputClass} />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="propertySlug" className={labelClass}>
            Link to an existing listing (optional)
          </label>
          <select id="propertySlug" name="propertySlug" defaultValue="" className={inputClass}>
            <option value="">Not linked</option>
            {properties.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.title}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="notes" className={labelClass}>
            Notes
          </label>
          <textarea id="notes" name="notes" rows={3} placeholder="Anything worth flagging" className={inputClass} />
        </div>

        {showCapturedBy && (
          <div className="space-y-1.5">
            <label htmlFor="capturedBy" className={labelClass}>
              Your name
            </label>
            <input
              id="capturedBy"
              name="capturedBy"
              value={capturedBy}
              onChange={(e) => onCapturedByChange(e.target.value)}
              placeholder="So we know who to follow up with"
              className={inputClass}
            />
          </div>
        )}

        <div className="space-y-1.5">
          <span className={labelClass}>Extent</span>
          <AreaInput />
        </div>

        <p className={labelClass}>Tags</p>
        {existingTags.length === 0 ? (
          <p className="text-sm text-muted-foreground">No tags set up yet.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {existingTags.map((tag) => (
              <label
                key={tag}
                className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  selectedTags.includes(tag)
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-input bg-background text-foreground"
                }`}
              >
                <input
                  type="checkbox"
                  name="tags"
                  value={tag}
                  checked={selectedTags.includes(tag)}
                  onChange={() => toggleTag(tag)}
                  className="sr-only"
                />
                {tag}
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Step 2 — anything already known about the plot itself */}
      <div className={step === 1 ? "space-y-4" : "hidden"}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Labelled label="Area / village" htmlFor="area">
            <input id="area" name="area" className={inputClass} />
          </Labelled>
          <Labelled label="Corridor" htmlFor="corridor">
            <input id="corridor" name="corridor" placeholder="e.g. Kanakapura Road" className={inputClass} />
          </Labelled>
        </div>



        <Labelled label="Price per acre (₹)" htmlFor="pricePerAcre">
          <input id="pricePerAcre" name="pricePerAcre" type="number" step="1000" className={inputClass} />
        </Labelled>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Labelled label="Soil type" htmlFor="soilType">
            <input id="soilType" name="soilType" className={inputClass} />
          </Labelled>
          <Labelled label="Road access" htmlFor="roadAccess">
            <input id="roadAccess" name="roadAccess" className={inputClass} />
          </Labelled>
        </div>

        <Labelled label="Land observation" htmlFor="landObservation">
          <input
            id="landObservation"
            name="landObservation"
            list="captureLandObservations"
            placeholder="Flat land, gentle fall to the south-east"
            className={inputClass}
          />
          <datalist id="captureLandObservations">
            {LAND_OBSERVATIONS.map((option) => (
              <option key={option} value={option} />
            ))}
          </datalist>
        </Labelled>


      </div>

      {/* Step 3 — documents */}
      <div className={step === 2 ? "space-y-4" : "hidden"}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Labelled label="Survey number" htmlFor="surveyNumber">
            <input id="surveyNumber" name="surveyNumber" className={inputClass} />
          </Labelled>
          <Labelled label="Khata" htmlFor="khata">
            <select id="khata" name="khata" defaultValue="" className={inputClass}>
              <option value="">Not known</option>
              {KHATA_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Labelled>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="rtcImage" className={labelClass}>
            RTC scan
          </label>
          <input
            id="rtcImage"
            name="rtcImage"
            type="file"
            accept="image/*"
            capture="environment"
            className={inputClass}
            onChange={(e) => {
              if (rtcPreview) URL.revokeObjectURL(rtcPreview);
              const file = e.target.files?.[0];
              setRtcPreview(file ? URL.createObjectURL(file) : null);
            }}
          />
          <p className="text-xs text-muted-foreground">
            Photograph the RTC and it is stored with the capture. {showAssist ? "Use " : "An admin can then use "}
            &ldquo;Read an RTC&rdquo; to pull the survey number, village and extent out of the Kannada.
          </p>
          {rtcPreview && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={rtcPreview} alt="" className="mt-2 max-h-56 rounded-md border border-border object-contain" />
          )}
        </div>

        {/* Populated by the assist panel; carries the full reading through to review. */}
        <input type="hidden" name="rtcExtraction" defaultValue="" />

        {showAssist && <AiAssist formId="capture-form" showMap={false} />}
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-border pt-4">
        {step > 0 && (
          <Button type="button" variant="outline" size="sm" onClick={() => setStep((s) => s - 1)}>
            Back
          </Button>
        )}
        {step < STEPS.length - 1 && (
          <Button type="button" variant="outline" size="sm" onClick={() => setStep((s) => s + 1)}>
            Add {STEPS[step + 1].toLowerCase()}
          </Button>
        )}
        <Button type="submit" disabled={isPending} className="ml-auto bg-accent text-accent-foreground hover:bg-accent/90">
          {isPending ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : null}
          {isPending ? "Saving…" : "Save capture"}
        </Button>
      </div>
    </form>
  );
}

function Labelled({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className={labelClass}>
        {label}
      </label>
      {children}
    </div>
  );
}
