"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import type { Capture, CaptureDetails, KhataType } from "@/lib/types";
import { createCapture } from "@/lib/store/captures";
import { saveUploadedFiles } from "@/lib/store/uploads";
import { addTag } from "@/lib/store/tags";
import { getSessionProfile } from "@/lib/auth/roles";

export interface CaptureActionState {
  ok: boolean;
  message?: string;
  error?: string;
}

/**
 * PostgREST rejects a whole insert when it names a column the schema does not
 * have, which is what an unrun migration looks like from here. Left to throw it
 * takes the page down with it and the person capturing sees a blank error
 * screen with their photos gone.
 */
function describe(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  if (/column .* does not exist|Could not find the '.*' column|schema cache/i.test(message)) {
    return "The database is missing a column this form writes to. Run the pending migrations in Supabase, then try again.";
  }
  return message || "Could not save that capture.";
}

function parseNumberOrNull(raw: FormDataEntryValue | null): number | null {
  if (raw === null) return null;
  const s = String(raw).trim();
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function text(formData: FormData, key: string): string {
  return String(formData.get(key) || "").trim();
}

/**
 * Only keeps keys the person actually filled in.
 *
 * Storing `extentAcres: 0` for a field left blank would be indistinguishable
 * from someone recording a genuine zero, and an admin promoting the capture
 * later would have no way to tell "not known" from "measured".
 */
function buildDetails(formData: FormData): CaptureDetails {
  const details: CaptureDetails = {};

  const strings = ["area", "corridor", "soilType", "landObservation", "roadAccess", "surveyNumber", "phone", "ownerType"] as const;
  for (const key of strings) {
    const value = text(formData, key);
    if (value) details[key] = value;
  }

  for (const key of ["extentAcres", "pricePerAcre"] as const) {
    const raw = text(formData, key);
    if (!raw) continue;
    const n = Number(raw);
    if (Number.isFinite(n)) details[key] = n;
  }

  const khata = text(formData, "khata");
  if (khata) details.khata = khata as KhataType;

  const rtcJson = text(formData, "rtcExtraction");
  if (rtcJson) {
    try {
      details.rtc = JSON.parse(rtcJson) as Record<string, unknown>;
    } catch {
      // A malformed blob is not worth failing the whole capture over — the
      // photos and pin are the part that cannot be recreated later.
    }
  }

  return details;
}

export async function submitCaptureAction(
  _prevState: CaptureActionState,
  formData: FormData
): Promise<CaptureActionState> {
  // Media is uploaded straight to Storage from the browser and arrives here as
  // URLs. Sending the bytes through this action meant sending them through a
  // Vercel function, which rejects any body over 4.5MB before our code runs —
  // one phone video was enough to kill the request and take the page with it.
  const images = formData.getAll("imageUrls").map(String).filter(Boolean);
  const videos = formData.getAll("videoUrls").map(String).filter(Boolean);

  const rtcFiles = formData.getAll("rtcImage").filter((f): f is File => f instanceof File && f.size > 0);
  const [rtcImage] = await saveUploadedFiles(rtcFiles, "captures/rtc");


  const details = buildDetails(formData);
  if (rtcImage) details.rtcImage = rtcImage;

  const propertySlug = String(formData.get("propertySlug") || "").trim();

  const capture: Capture = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    images,
    videos,
    lat: parseNumberOrNull(formData.get("lat")),
    lng: parseNumberOrNull(formData.get("lng")),
    locationAccuracyM: parseNumberOrNull(formData.get("locationAccuracyM")),
    label: String(formData.get("label") || "").trim(),
    notes: String(formData.get("notes") || "").trim(),
    // A signed-in person is known; only fall back to the typed name for the
    // public form, where there is no session to read.
    capturedBy: (await getSessionProfile().catch(() => null))?.fullName
      || String(formData.get("capturedBy") || "").trim(),
    propertySlug: propertySlug || null,
    status: "new",
    tags: formData.getAll("tags").map(String).filter(Boolean),
    details,
  };

  try {
    await createCapture(capture);

    // Tags invented in the field join the vocabulary, so the next person sees
    // them in the picker instead of typing a near-duplicate.
    const newTags = String(formData.get("newTags") || "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    await Promise.all(newTags.map((t) => addTag(t)));
  } catch (error) {
    return { ok: false, error: describe(error) };
  }

  revalidatePath("/admin/captures");
  revalidatePath("/admin");

  return { ok: true, message: "Saved — thanks! You can capture another." };
}
