"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { AlertCircle, Camera, Check, Cloud, Crosshair, Loader2, RefreshCw, X } from "lucide-react";
import {
  MAX_IMAGES,
  MIN_IMAGES,
  PARTNER_TYPES,
  ROAD_ACCESS_OPTIONS,
  WATER_OPTIONS,
  isSubmittable,
  missingRequiredFields,
  parseCapturePayload,
  type CapturePayload,
} from "@/lib/schema/capture";
import { compressImage } from "@/lib/images/compress";
import { currentAccessToken, uploadWithProgress } from "@/lib/partner/upload";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

const PinLocationMap = dynamic(() => import("@/components/map/pin-location-map"), { ssr: false });

const AUTOSAVE_MS = 10_000;

const inputClass =
  "w-full rounded-2xl border border-border/70 bg-white/80 px-4 py-3 text-base outline-none focus-visible:ring-3 focus-visible:ring-ring/50";
const labelClass = "block text-sm font-medium text-foreground";

type UploadState = "compressing" | "uploading" | "done" | "failed";

interface Upload {
  id: string;
  file: File;
  previewUrl: string;
  state: UploadState;
  progress: number;
  path?: string;
  error?: string;
}

type SaveState = "idle" | "saving" | "saved" | "error";

function Field({ label, htmlFor, children }: { label: string; htmlFor?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className={labelClass} htmlFor={htmlFor}>
        {label}
      </label>
      {children}
    </div>
  );
}

export function PartnerCaptureForm({
  submissionId,
  initialPayload,
  defaultMobile,
}: {
  submissionId: string;
  initialPayload: unknown;
  defaultMobile: string;
}) {
  const [payload, setPayload] = useState<CapturePayload>(() => {
    const parsed = parseCapturePayload(initialPayload);
    return { ...parsed, mobile: parsed.mobile || defaultMobile };
  });
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const [showOptional, setShowOptional] = useState(false);

  // Autosave compares against what was last written rather than firing on every
  // keystroke, so a partner sitting still does not burn their data allowance.
  const lastSaved = useRef<string>("");
  const payloadRef = useRef(payload);
  // Synced in an effect rather than assigned during render: the autosave timer
  // and the upload callbacks need the latest payload without being torn down
  // and recreated on every keystroke.
  useEffect(() => {
    payloadRef.current = payload;
  }, [payload]);

  const save = useCallback(async () => {
    const current = payloadRef.current;
    const serialised = JSON.stringify(current);
    if (serialised === lastSaved.current) return;

    setSaveState("saving");
    const supabase = createSupabaseBrowserClient();
    const { error: saveError } = await supabase
      .from("submissions")
      .update({ payload: current })
      .eq("id", submissionId);

    if (saveError) {
      setSaveState("error");
      return;
    }
    lastSaved.current = serialised;
    setSaveState("saved");
  }, [submissionId]);

  useEffect(() => {
    const timer = setInterval(save, AUTOSAVE_MS);
    return () => clearInterval(timer);
  }, [save]);

  // Losing signal mid-form must never lose work, so also flush when the page is
  // being hidden or closed, not only on the interval.
  useEffect(() => {
    function flush() {
      if (document.visibilityState === "hidden") void save();
    }
    document.addEventListener("visibilitychange", flush);
    return () => document.removeEventListener("visibilitychange", flush);
  }, [save]);

  function update<K extends keyof CapturePayload>(key: K, value: CapturePayload[K]) {
    setPayload((previous) => ({ ...previous, [key]: value }));
  }

  function useMyLocation() {
    if (!navigator.geolocation) {
      setError("This browser cannot share your location. Drop a pin instead.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocating(false);
        setPayload((previous) => ({
          ...previous,
          lat: Number(position.coords.latitude.toFixed(6)),
          lng: Number(position.coords.longitude.toFixed(6)),
        }));
      },
      () => {
        setLocating(false);
        setError("Could not get your location. Drop a pin on the map instead.");
      },
      { enableHighAccuracy: true, timeout: 15_000 }
    );
  }

  const runUpload = useCallback(
    async (upload: Upload) => {
      function patch(changes: Partial<Upload>) {
        setUploads((previous) => previous.map((u) => (u.id === upload.id ? { ...u, ...changes } : u)));
      }

      try {
        patch({ state: "compressing", progress: 0, error: undefined });
        const compressed = await compressImage(upload.file);

        const path = `${submissionId}/${upload.id}.jpg`;
        const token = await currentAccessToken();
        patch({ state: "uploading" });
        await uploadWithProgress("submissions", path, compressed.blob, token, (fraction) =>
          patch({ progress: fraction })
        );

        patch({ state: "done", progress: 1, path });
        setPayload((previous) =>
          previous.images.includes(path) ? previous : { ...previous, images: [...previous.images, path] }
        );
      } catch (uploadError) {
        patch({
          state: "failed",
          error: uploadError instanceof Error ? uploadError.message : "Upload failed",
        });
      }
    },
    [submissionId]
  );

  function addFiles(files: FileList | null) {
    if (!files?.length) return;
    setError(null);

    const room = MAX_IMAGES - uploads.filter((u) => u.state !== "failed").length;
    if (room <= 0) {
      setError(`That is the maximum of ${MAX_IMAGES} photos.`);
      return;
    }

    const accepted = Array.from(files).slice(0, room);
    const next: Upload[] = accepted.map((file) => ({
      id: crypto.randomUUID(),
      file,
      previewUrl: URL.createObjectURL(file),
      state: "compressing",
      progress: 0,
    }));

    setUploads((previous) => [...previous, ...next]);
    next.forEach((upload) => void runUpload(upload));
  }

  function removeUpload(upload: Upload) {
    URL.revokeObjectURL(upload.previewUrl);
    setUploads((previous) => previous.filter((u) => u.id !== upload.id));
    if (upload.path) {
      setPayload((previous) => ({ ...previous, images: previous.images.filter((p) => p !== upload.path) }));
    }
  }

  async function submit() {
    setSubmitting(true);
    setError(null);
    await save();

    const supabase = createSupabaseBrowserClient();
    const { error: submitError } = await supabase
      .from("submissions")
      .update({ payload: payloadRef.current, status: "pending" })
      .eq("id", submissionId);

    setSubmitting(false);
    if (submitError) {
      setError(submitError.message);
      return;
    }
    setSubmitted(true);
  }

  const gaps = missingRequiredFields(payload);
  const ready = isSubmittable(payload) && uploads.every((u) => u.state !== "uploading" && u.state !== "compressing");

  if (submitted) {
    return (
      <div className="rounded-[1.5rem] border border-primary/25 bg-primary/[0.06] p-6 text-center">
        <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Check className="h-5 w-5" />
        </span>
        <h2 className="mt-4 font-heading text-xl font-semibold text-foreground">Sent for review</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Our team checks every plot before it goes live. You will see the status on your dashboard, along with
          anything we need you to fix.
        </p>
        <Button asChild variant="pill" size="pill" className="mt-5">
          <a href="/partner">Go to my submissions</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-7">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-semibold text-foreground">Add land</h1>
        <SavedIndicator state={saveState} />
      </div>

      <section className="space-y-5">
        <Field label="Your mobile number" htmlFor="mobile">
          <input
            id="mobile"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            value={payload.mobile}
            onChange={(event) => update("mobile", event.target.value)}
            onBlur={save}
            className={inputClass}
          />
        </Field>

        <Field label="Your relationship to this land">
          <div className="grid grid-cols-1 gap-2">
            {PARTNER_TYPES.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  update("partnerType", option.value);
                  void save();
                }}
                className={`rounded-2xl border px-4 py-3 text-left text-base transition-colors ${
                  payload.partnerType === option.value
                    ? "border-primary bg-primary/10 font-medium text-foreground"
                    : "border-border/70 bg-white/80 text-muted-foreground"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Where is it?">
          <Button type="button" variant="pill-outline" size="pill" className="w-full" onClick={useMyLocation}>
            {locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Crosshair className="h-4 w-4" />}
            Use my current location
          </Button>
          <div className="mt-3 h-64 overflow-hidden rounded-2xl border border-border/70">
            <PinLocationMap
              lat={payload.lat}
              lng={payload.lng}
              onPick={(lat: number, lng: number) => {
                setPayload((previous) => ({ ...previous, lat, lng }));
                void save();
              }}
            />
          </div>
          {payload.lat !== null && payload.lng !== null && (
            <p className="mt-2 text-xs text-muted-foreground">
              Pinned at {payload.lat.toFixed(5)}, {payload.lng.toFixed(5)}
            </p>
          )}
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Area in acres" htmlFor="area">
            <input
              id="area"
              type="number"
              inputMode="decimal"
              min={1}
              step={0.25}
              value={payload.areaAcres ?? ""}
              onChange={(event) => update("areaAcres", event.target.value === "" ? null : Number(event.target.value))}
              onBlur={save}
              className={inputClass}
            />
          </Field>
          <Field label="Asking price in rupees" htmlFor="price">
            <input
              id="price"
              type="number"
              inputMode="numeric"
              min={0}
              step={100000}
              value={payload.askingPrice ?? ""}
              onChange={(event) => update("askingPrice", event.target.value === "" ? null : Number(event.target.value))}
              onBlur={save}
              className={inputClass}
            />
          </Field>
        </div>

        <Field label={`Photos (${MIN_IMAGES} to ${MAX_IMAGES})`}>
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-white/60 px-4 py-6 text-sm font-medium text-muted-foreground">
            <Camera className="h-5 w-5" />
            Take or choose photos
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(event) => {
                addFiles(event.target.files);
                event.target.value = "";
              }}
            />
          </label>

          {uploads.length > 0 && (
            <ul className="mt-3 space-y-2">
              {uploads.map((upload) => (
                <li
                  key={upload.id}
                  className="flex items-center gap-3 rounded-2xl border border-border/70 bg-white/80 p-2"
                >
                  <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-muted">
                    <Image src={upload.previewUrl} alt="" fill sizes="56px" className="object-cover" unoptimized />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs text-muted-foreground">{upload.file.name}</span>
                    {upload.state === "failed" ? (
                      <span className="mt-1 flex items-center gap-1 text-xs text-destructive">
                        <AlertCircle className="h-3.5 w-3.5" />
                        {upload.error}
                      </span>
                    ) : (
                      <span className="mt-1.5 block h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <span
                          className="block h-full rounded-full bg-primary transition-[width] duration-200"
                          style={{ width: `${Math.round(upload.progress * 100)}%` }}
                        />
                      </span>
                    )}
                    <span className="mt-1 block text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                      {upload.state === "compressing"
                        ? "Shrinking"
                        : upload.state === "uploading"
                          ? `${Math.round(upload.progress * 100)}%`
                          : upload.state === "done"
                            ? "Uploaded"
                            : "Failed"}
                    </span>
                  </span>
                  {upload.state === "failed" && (
                    <button
                      type="button"
                      onClick={() => void runUpload(upload)}
                      className="rounded-full p-2 text-accent"
                      aria-label="Retry upload"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => removeUpload(upload)}
                    className="rounded-full p-2 text-muted-foreground"
                    aria-label="Remove photo"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Field>
      </section>

      <section className="rounded-[1.5rem] border border-border/70 bg-white/60">
        <button
          type="button"
          onClick={() => setShowOptional((open) => !open)}
          className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
        >
          <span>
            <span className="block text-sm font-semibold text-foreground">Add more detail</span>
            <span className="block text-xs text-muted-foreground">
              Optional. You or our team can fill this in later.
            </span>
          </span>
          <span className="text-sm text-accent">{showOptional ? "Hide" : "Open"}</span>
        </button>

        {showOptional && (
          <div className="space-y-5 border-t border-border/70 px-5 py-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Corridor" htmlFor="corridor">
                <input
                  id="corridor"
                  value={payload.corridor}
                  onChange={(event) => update("corridor", event.target.value)}
                  onBlur={save}
                  placeholder="Kanakapura Road"
                  className={inputClass}
                />
              </Field>
              <Field label="Village" htmlFor="village">
                <input
                  id="village"
                  value={payload.village}
                  onChange={(event) => update("village", event.target.value)}
                  onBlur={save}
                  className={inputClass}
                />
              </Field>
            </div>

            <Field label="Road access">
              <div className="flex flex-wrap gap-2">
                {ROAD_ACCESS_OPTIONS.map((option) => (
                  <Chip
                    key={option.value}
                    active={payload.roadAccess === option.value}
                    onClick={() => {
                      update("roadAccess", option.value);
                      void save();
                    }}
                  >
                    {option.label}
                  </Chip>
                ))}
              </div>
            </Field>

            <Field label="Road width in feet" htmlFor="roadWidth">
              <input
                id="roadWidth"
                type="number"
                inputMode="numeric"
                min={0}
                value={payload.roadWidthFt ?? ""}
                onChange={(event) => update("roadWidthFt", event.target.value === "" ? null : Number(event.target.value))}
                onBlur={save}
                className={inputClass}
              />
            </Field>

            <Field label="Water">
              <div className="flex flex-wrap gap-2">
                {WATER_OPTIONS.map((option) => (
                  <Chip
                    key={option.value}
                    active={payload.water === option.value}
                    onClick={() => {
                      update("water", option.value);
                      void save();
                    }}
                  >
                    {option.label}
                  </Chip>
                ))}
              </div>
            </Field>

            <div className="flex flex-wrap gap-2">
              <Chip
                active={payload.fencing}
                onClick={() => {
                  update("fencing", !payload.fencing);
                  void save();
                }}
              >
                Fenced
              </Chip>
              <Chip
                active={payload.electricity}
                onClick={() => {
                  update("electricity", !payload.electricity);
                  void save();
                }}
              >
                Electricity
              </Chip>
            </div>

            <Field label="Existing structure" htmlFor="structure">
              <input
                id="structure"
                value={payload.existingStructure}
                onChange={(event) => update("existingStructure", event.target.value)}
                onBlur={save}
                placeholder="Shed, borewell room, nothing"
                className={inputClass}
              />
            </Field>

            <Field label="Soil notes" htmlFor="soil">
              <input
                id="soil"
                value={payload.soilNotes}
                onChange={(event) => update("soilNotes", event.target.value)}
                onBlur={save}
                placeholder="Red loamy, previously cultivated"
                className={inputClass}
              />
            </Field>

            <Field label="Anything else" htmlFor="notes">
              <textarea
                id="notes"
                rows={3}
                value={payload.notes}
                onChange={(event) => update("notes", event.target.value)}
                onBlur={save}
                className={inputClass}
              />
            </Field>
          </div>
        )}
      </section>

      {gaps.length > 0 && (
        <ul className="space-y-1.5 rounded-2xl border border-border/70 bg-white/60 p-4">
          {gaps.map((gap) => (
            <li key={`${gap.field}-${gap.message}`} className="flex items-start gap-2 text-sm text-muted-foreground">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
              {gap.message}
            </li>
          ))}
        </ul>
      )}

      {error && (
        <p className="rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="sticky bottom-0 -mx-4 border-t border-border/70 bg-background/95 px-4 py-4 backdrop-blur">
        <Button
          type="button"
          variant="pill"
          size="pill"
          className="w-full"
          disabled={!ready || submitting}
          onClick={submit}
        >
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Send for review
        </Button>
      </div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-sm transition-colors ${
        active
          ? "border-primary bg-primary/10 font-medium text-foreground"
          : "border-border/70 bg-white/80 text-muted-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function SavedIndicator({ state }: { state: SaveState }) {
  if (state === "idle") return null;
  const content =
    state === "saving"
      ? { icon: <Loader2 className="h-3.5 w-3.5 animate-spin" />, text: "Saving", tone: "text-muted-foreground" }
      : state === "saved"
        ? { icon: <Cloud className="h-3.5 w-3.5" />, text: "Saved", tone: "text-primary" }
        : { icon: <AlertCircle className="h-3.5 w-3.5" />, text: "Not saved", tone: "text-destructive" };

  return (
    <span className={`flex shrink-0 items-center gap-1.5 text-xs font-medium ${content.tone}`}>
      {content.icon}
      {content.text}
    </span>
  );
}
