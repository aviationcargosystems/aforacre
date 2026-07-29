"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, CheckCircle2, ExternalLink, Loader2, MapPin, RefreshCw } from "lucide-react";
import { submitCaptureAction, type CaptureActionState } from "@/app/capture/actions";
import { Button } from "@/components/ui/button";
import { PinLocationPicker } from "@/components/map/pin-location-picker";
import { MapLinkInput } from "@/components/map-link-input";
import { AreaInput } from "@/components/admin/area-input";
import { PriceInput } from "@/components/admin/price-input";
import { TagPicker } from "@/components/admin/tag-picker";
import { AiAssist } from "@/components/admin/ai-assist";
import { KHATA_OPTIONS } from "@/components/admin/property-form-shared";
import { buildSiteLabel } from "@/lib/site-label";
import { useDraft } from "@/lib/use-draft";
import { compressImage } from "@/lib/images/compress";
import { uploadDirect } from "@/lib/direct-upload";

/**
 * Capture, in two passes: the site, then its documents.
 *
 * Photos, a pin and save is still the whole requirement, and the save button
 * sits outside the stepper so nobody standing in a field has to reach the
 * second step to finish. Everything on Site is what somebody physically there
 * can answer; Documents is the paperwork, which usually arrives separately.
 *
 * Steps are hidden rather than unmounted — unmounting takes the inputs out of
 * the form, so anything typed on Documents would be dropped by stepping back to
 * check a photo.
 */

const inputClass =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring";
const labelClass = "text-sm font-medium text-foreground";

const initialState: CaptureActionState = { ok: false };

type GeoStatus = "idle" | "locating" | "success" | "error" | "unsupported";

const STEPS = ["Site", "Documents"] as const;

export function CaptureForm({
  existingTags = [],
  variant = "public",
}: {
  existingTags?: string[];
  /** "admin" is for staff already signed in — unlocks RTC reading and link resolution. */
  variant?: "public" | "admin";
}) {
  const isAdmin = variant === "admin";

  const [state, formAction, isPending] = useActionState(submitCaptureAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [geoStatus, setGeoStatus] = useState<GeoStatus>("idle");
  const [geoError, setGeoError] = useState<string | null>(null);
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [previews, setPreviews] = useState<string[]>([]);
  const [videoFiles, setVideoFiles] = useState<File[]>([]);
  const [uploaded, setUploaded] = useState<{ images: string[]; videos: string[] }>({ images: [], videos: [] });
  const [uploading, setUploading] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [videoPreviews, setVideoPreviews] = useState<string[]>([]);
  const [rtcPreview, setRtcPreview] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [area, setArea] = useState("");
  const [acres, setAcres] = useState(0);
  const [labelTouched, setLabelTouched] = useState(false);
  const [label, setLabel] = useState("");
  const [capturedBy, setCapturedBy] = useState("");
  const [submitCount, setSubmitCount] = useState(0);

  const draftKey = `aa_capture_draft_${variant}`;
  const { draft, restored, save: saveDraft, discard: discardDraft } = useDraft<Record<string, unknown>>(
    draftKey,
    (v) => !v.lat && !v.area && !v.label && !(v.tags as string[])?.length
  );

  useEffect(() => {
    // One-shot restore. Files are not in the draft, so photos and clips still
    // have to be re-picked — the notice below says so.
    if (!draft) return;
    /* eslint-disable react-hooks/set-state-in-effect */
    if (typeof draft.lat === "string") setLat(draft.lat);
    if (typeof draft.lng === "string") setLng(draft.lng);
    if (typeof draft.area === "string") setArea(draft.area);
    if (typeof draft.acres === "number") setAcres(draft.acres);
    if (Array.isArray(draft.tags)) setSelectedTags(draft.tags as string[]);
    if (typeof draft.label === "string" && draft.label) {
      setLabel(draft.label);
      setLabelTouched(true);
    }
    if (typeof draft.lat === "string" && draft.lat) setGeoStatus("success");
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [draft]);

  useEffect(() => {
    saveDraft({ lat, lng, area, acres, tags: selectedTags, label: labelTouched ? label : "" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lat, lng, area, acres, selectedTags, label, labelTouched]);

  function locate() {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setGeoStatus("unsupported");
      return;
    }
    setGeoStatus("locating");
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude.toFixed(6));
        setLng(pos.coords.longitude.toFixed(6));
        setAccuracy(pos.coords.accuracy);
        setGeoStatus("success");
      },
      (err) => {
        // "Couldn't get your location" gives somebody in a field nothing to act
        // on. Denied, unavailable and timed out have different remedies.
        setGeoError(
          err.code === err.PERMISSION_DENIED
            ? "Location is blocked for this site. Allow it in your browser settings, or paste a map link below."
            : err.code === err.POSITION_UNAVAILABLE
              ? "No fix available. Move into the open and hit Refresh, or paste a map link below."
              : "Locating timed out. Hit Refresh, or paste a map link below."
        );
        setGeoStatus("error");
      },
      { enableHighAccuracy: true, timeout: 12000 }
    );
  }

  useEffect(() => {
    // Mount-time sync with the geolocation prompt and localStorage, not a
    // reaction to React state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    locate();
    const saved = window.localStorage.getItem("pa_captured_by");
    if (saved) setCapturedBy(saved);
  }, []);

  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
      previews.forEach((url) => URL.revokeObjectURL(url));
      videoPreviews.forEach((url) => URL.revokeObjectURL(url));
      if (rtcPreview) URL.revokeObjectURL(rtcPreview);
      /* eslint-disable react-hooks/set-state-in-effect */
      setPreviews([]);
      setVideoPreviews([]);
      setVideoFiles([]);
      setUploaded({ images: [], videos: [] });
      setRtcPreview(null);
      setSelectedTags([]);
      setArea("");
      setAcres(0);
      setLabel("");
      setLabelTouched(false);
      setStep(0);
      /* eslint-enable react-hooks/set-state-in-effect */
      discardDraft();
      setSubmitCount((n) => n + 1);
      locate();
      // Staff go to the queue they just added to. The public form has nowhere
      // to send someone, so it stays put with its confirmation.
      if (isAdmin) router.push("/admin/captures");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  // Suggested, not imposed: the moment somebody edits the label it stops being
  // regenerated, because their wording is better than the template's.
  const suggestedLabel = useMemo(
    () => buildSiteLabel({ extentAcres: acres, area, tags: selectedTags }),
    [acres, area, selectedTags]
  );
  const effectiveLabel = labelTouched ? label : suggestedLabel;

  function onCapturedByChange(value: string) {
    setCapturedBy(value);
    window.localStorage.setItem("pa_captured_by", value);
  }

  async function onFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
    previews.forEach((url) => URL.revokeObjectURL(url));
    const picked = Array.from(e.target.files ?? []);
    setPreviews(picked.map((f) => URL.createObjectURL(f)));
    if (picked.length === 0) return;

    setUploadError(null);
    const urls: string[] = [];
    try {
      for (const [i, file] of picked.entries()) {
        setUploading(`Photo ${i + 1} of ${picked.length}`);
        // Compressed first: a phone photo is 4-8MB and nothing on the site ever
        // displays it at that size.
        const { blob } = await compressImage(file).catch(() => ({ blob: file as Blob }));
        const asFile = new File([blob], file.name.replace(/\.[^.]+$/, "") + ".jpg", {
          type: blob.type || "image/jpeg",
        });
        const { publicUrl } = await uploadDirect(asFile, "captures", (f) =>
          setUploading(`Photo ${i + 1} of ${picked.length} — ${Math.round(f * 100)}%`)
        );
        urls.push(publicUrl);
      }
      setUploaded((prev) => ({ ...prev, images: [...prev.images, ...urls] }));
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Could not upload those photos.");
    } finally {
      setUploading(null);
    }
  }

  async function onVideosChange(e: React.ChangeEvent<HTMLInputElement>) {
    videoPreviews.forEach((url) => URL.revokeObjectURL(url));
    const picked = Array.from(e.target.files ?? []);
    setVideoFiles(picked);
    setVideoPreviews(picked.map((f) => URL.createObjectURL(f)));
    if (picked.length === 0) return;

    setUploadError(null);
    const urls: string[] = [];
    try {
      for (const [i, file] of picked.entries()) {
        const { publicUrl } = await uploadDirect(file, "captures", (f) =>
          setUploading(`Video ${i + 1} of ${picked.length} — ${Math.round(f * 100)}%`)
        );
        urls.push(publicUrl);
      }
      setUploaded((prev) => ({ ...prev, videos: [...prev.videos, ...urls] }));
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Could not upload that video.");
    } finally {
      setUploading(null);
    }
  }

  const hasPin = Boolean(lat && lng);
  const videoMb = videoFiles.reduce((n, f) => n + f.size, 0) / (1024 * 1024);

  return (
    <form id="capture-form" ref={formRef} action={formAction} className="space-y-6" key={submitCount}>
      {state.error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {state.error}
        </div>
      )}

      {state.ok && (
        <div className="flex items-center gap-2 rounded-md border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {state.message}
        </div>
      )}

      {restored && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-md border border-accent/30 bg-accent/[0.07] px-4 py-3 text-sm">
          <span className="text-foreground">Picked up where you left off.</span>
          <span className="text-xs text-muted-foreground">Photos and clips need choosing again.</span>
          <button
            type="button"
            onClick={discardDraft}
            className="ml-auto text-xs font-medium text-accent hover:underline"
          >
            Start fresh
          </button>
        </div>
      )}

      {/* Media is already in Storage by the time this submits; only its URLs
          travel with the form, which keeps the request far under Vercel's
          4.5MB function body cap. */}
      {uploaded.images.map((url) => (
        <input key={url} type="hidden" name="imageUrls" value={url} />
      ))}
      {uploaded.videos.map((url) => (
        <input key={url} type="hidden" name="videoUrls" value={url} />
      ))}

      {uploading && (
        <p className="flex items-center gap-2 rounded-md border border-border bg-background px-4 py-2.5 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Uploading {uploading}
        </p>
      )}
      {uploadError && (
        <p className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
          {uploadError}
        </p>
      )}

      <nav className="flex flex-wrap gap-1.5">
        {STEPS.map((name, i) => (
          <button
            key={name}
            type="button"
            onClick={() => setStep(i)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              step === i
                ? "bg-primary text-primary-foreground"
                : "border border-border bg-background text-muted-foreground hover:text-foreground"
            }`}
          >
            {i + 1}. {name}
          </button>
        ))}
      </nav>

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
          <label htmlFor="videos" className={labelClass}>
            Video <span className="font-normal text-muted-foreground">(optional)</span>
          </label>
          <input
            id="videos"
            type="file"
            accept="video/*"
            capture="environment"
            multiple
            onChange={onVideosChange}
            className={inputClass}
          />
          {videoFiles.length > 0 && (
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              {isPending && <Loader2 className="h-3 w-3 animate-spin" />}
              {isPending ? "Uploading" : "Ready"} · {videoFiles.length} clip
              {videoFiles.length === 1 ? "" : "s"} · {videoMb.toFixed(1)} MB
            </p>
          )}
          {videoPreviews.length > 0 && (
            <div className="grid grid-cols-2 gap-2 pt-1">
              {videoPreviews.map((src) => (
                <video key={src} src={src} controls preload="metadata" className="w-full rounded-md bg-black" />
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
            <MapPin className="h-3 w-3 shrink-0" />
            {geoStatus === "locating" && "Getting your location…"}
            {geoStatus === "success" && `Captured${accuracy ? ` (±${Math.round(accuracy)}m)` : ""}`}
            {geoStatus === "error" && (geoError ?? "Couldn't get your location.")}
            {geoStatus === "unsupported" && "This device has no location — drop a pin or paste a link."}
            {geoStatus === "idle" && "Waiting for permission…"}
          </p>

          <div className="h-44 overflow-hidden rounded-md border border-border sm:h-56">
            <PinLocationPicker
              lat={lat ? Number(lat) : null}
              lng={lng ? Number(lng) : null}
              onPick={(newLat, newLng) => {
                setLat(newLat.toFixed(6));
                setLng(newLng.toFixed(6));
                setAccuracy(null);
                setGeoStatus("success");
              }}
            />
          </div>

          <MapLinkInput
            canResolveShortLinks={isAdmin}
            onResolve={(newLat, newLng) => {
              setLat(newLat.toFixed(6));
              setLng(newLng.toFixed(6));
              setAccuracy(null);
              setGeoStatus("success");
            }}
          />

          {hasPin && (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-accent hover:underline"
            >
              <ExternalLink className="h-3 w-3" />
              Open in Google Maps
            </a>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="area" className={labelClass}>
            Area / village
          </label>
          <input
            id="area"
            name="area"
            value={area}
            onChange={(e) => setArea(e.target.value)}
            className={inputClass}
          />
        </div>

        <div className="space-y-1.5">
          <span className={labelClass}>Extent</span>
          <AreaInput onAcresChange={setAcres} />
        </div>

        <PriceInput />

        <div className="space-y-1.5">
          <label htmlFor="label" className={labelClass}>
            Site label
          </label>
          <input
            id="label"
            name="label"
            value={effectiveLabel}
            onChange={(e) => {
              setLabelTouched(true);
              setLabel(e.target.value);
            }}
            placeholder="Fills in from the extent, area and tags"
            className={inputClass}
          />
        </div>

        <div className="space-y-1.5">
          <p className={labelClass}>Tags</p>
          <TagPicker available={existingTags} selected={selectedTags} onChange={setSelectedTags} />
        </div>

        {!isAdmin && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
            <div className="space-y-1.5">
              <label htmlFor="phone" className={labelClass}>
                Phone
              </label>
              <input id="phone" name="phone" type="tel" inputMode="tel" className={inputClass} />
            </div>
          </div>
        )}
      </div>

      <div className={step === 1 ? "space-y-4" : "hidden"}>
        <div className="space-y-1.5">
          <label htmlFor="rtcImage" className={labelClass}>
            Upload RTC
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
          {rtcPreview && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={rtcPreview} alt="" className="mt-2 max-h-56 rounded-md border border-border object-contain" />
          )}
        </div>

        {/* Populated by the reader below, so the full extraction travels with
            the capture rather than only the fields somebody applied. */}
        <input type="hidden" name="rtcExtraction" defaultValue="" />

        {isAdmin && (
          <AiAssist
            formId="capture-form"
            showMap={false}
            showPinResearch={false}
            availableTags={existingTags}
            onApplyTags={(tags) => setSelectedTags((prev) => Array.from(new Set([...prev, ...tags])))}
          />
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="surveyNumber" className={labelClass}>
              Survey number
            </label>
            <input id="surveyNumber" name="surveyNumber" className={inputClass} />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="khata" className={labelClass}>
              Khata
            </label>
            <select id="khata" name="khata" defaultValue="" className={inputClass}>
              <option value="">Not known</option>
              {KHATA_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-border pt-4">
        {step > 0 && (
          <Button type="button" variant="outline" size="sm" onClick={() => setStep((n) => n - 1)}>
            Back
          </Button>
        )}
        {step < STEPS.length - 1 && (
          <Button type="button" variant="outline" size="sm" onClick={() => setStep((n) => n + 1)}>
            Add documents
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
