"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Camera, CheckCircle2, Loader2, MapPin, RefreshCw } from "lucide-react";
import { submitCaptureAction, type CaptureActionState } from "@/app/capture/actions";
import { Button } from "@/components/ui/button";
import { PinLocationPicker } from "@/components/map/pin-location-picker";

const inputClass =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring";
const labelClass = "text-sm font-medium text-foreground";

const initialState: CaptureActionState = { ok: false };

type GeoStatus = "idle" | "locating" | "success" | "error" | "unsupported";

export function CaptureForm({
  properties,
  variant = "public",
}: {
  properties: { slug: string; title: string }[];
  /** "admin" is for staff already logged into /admin — adds a map pin, skips the "who are you" field. */
  variant?: "public" | "admin";
}) {
  const showMap = variant === "admin";
  const showCapturedBy = variant === "public";
  const [state, formAction, isPending] = useActionState(submitCaptureAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [geoStatus, setGeoStatus] = useState<GeoStatus>("idle");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [previews, setPreviews] = useState<string[]>([]);
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
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPreviews([]);
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

  return (
    <form ref={formRef} action={formAction} className="space-y-6" key={submitCount}>
      {state.ok && (
        <div className="flex items-center gap-2 rounded-md border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
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
          Tap to take or choose photos
          <input
            ref={fileInputRef}
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
          <input
            name="lat"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            placeholder="Latitude"
            inputMode="decimal"
            className={inputClass}
          />
          <input
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
        {showMap && (
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Or drop a pin — click the map, or drag the marker to fine-tune.</p>
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

      <Button type="submit" disabled={isPending} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
        {isPending ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : null}
        {isPending ? "Saving…" : "Submit capture"}
      </Button>
    </form>
  );
}
