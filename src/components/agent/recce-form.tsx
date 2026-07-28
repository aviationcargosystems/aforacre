"use client";

import { useActionState, useEffect, useState } from "react";
import { Camera, CheckCircle2, Loader2, MapPin, RefreshCw } from "lucide-react";
import { submitRecceAction, type RecceSubmitState } from "@/app/agent/(portal)/recce/[id]/actions";
import { Button } from "@/components/ui/button";

const inputClass =
  "w-full rounded-xl border border-input bg-background px-3 py-2.5 text-base outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring";

const initialState: RecceSubmitState = { ok: false };

type GeoStatus = "idle" | "locating" | "success" | "error" | "unsupported";

export function RecceForm({ recceId }: { recceId: string }) {
  const [state, formAction, isPending] = useActionState(submitRecceAction, initialState);
  const [geoStatus, setGeoStatus] = useState<GeoStatus>("idle");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [previews, setPreviews] = useState<string[]>([]);

  function locate() {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setGeoStatus("unsupported");
      return;
    }
    setGeoStatus("locating");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLat(position.coords.latitude.toFixed(6));
        setLng(position.coords.longitude.toFixed(6));
        setGeoStatus("success");
      },
      () => setGeoStatus("error"),
      { enableHighAccuracy: true, timeout: 12000 }
    );
  }

  useEffect(() => {
    // Mount-time sync with the geolocation permission prompt — an external
    // system, not React state, so the direct setState inside locate() is fine.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    locate();
  }, []);

  function onFilesChange(event: React.ChangeEvent<HTMLInputElement>) {
    previews.forEach((url) => URL.revokeObjectURL(url));
    const files = Array.from(event.target.files ?? []);
    setPreviews(files.map((file) => URL.createObjectURL(file)));
  }

  if (state.ok) {
    return (
      <div className="flex items-center gap-2 rounded-2xl border border-primary/30 bg-primary/10 px-4 py-4 text-sm text-primary">
        <CheckCircle2 className="h-5 w-5 shrink-0" /> {state.message}
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="recceId" value={recceId} />

      {state.message && !state.ok && (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {state.message}
        </div>
      )}

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">Photos</label>
        <label
          htmlFor="images"
          className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-input bg-background py-10 text-center text-sm text-muted-foreground"
        >
          <Camera className="h-7 w-7" />
          Tap to take photos
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
            {previews.map((src, index) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={index} src={src} alt="" className="aspect-square rounded-xl object-cover" />
            ))}
          </div>
        )}
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">Your location</label>
          <button
            type="button"
            onClick={locate}
            disabled={geoStatus === "locating"}
            className="flex items-center gap-1 text-xs font-medium text-accent"
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
            name="lat"
            value={lat}
            onChange={(event) => setLat(event.target.value)}
            placeholder="Latitude"
            inputMode="decimal"
            className={inputClass}
          />
          <input
            name="lng"
            value={lng}
            onChange={(event) => setLng(event.target.value)}
            placeholder="Longitude"
            inputMode="decimal"
            className={inputClass}
          />
        </div>
        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" />
          {geoStatus === "locating" && "Getting your location…"}
          {geoStatus === "success" && "Captured from your phone."}
          {geoStatus === "error" && "Couldn't get location — type it in if you have it."}
          {geoStatus === "unsupported" && "Location isn't available on this device."}
          {geoStatus === "idle" && "Waiting for permission…"}
        </p>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="notes" className="text-sm font-medium text-foreground">
          What did you find?
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={5}
          placeholder="Road access, water, fencing, soil, neighbours, anything the office should know"
          className={inputClass}
        />
      </div>

      <Button type="submit" disabled={isPending} variant="pill" size="pill" className="w-full">
        {isPending ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : null}
        {isPending ? "Submitting…" : "Submit recce"}
      </Button>
    </form>
  );
}
