"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import type { Capture, CaptureDetails, KhataType, WaterSource } from "@/lib/types";
import { createCapture } from "@/lib/store/captures";
import { saveUploadedFiles } from "@/lib/store/uploads";

export interface CaptureActionState {
  ok: boolean;
  message?: string;
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

  const strings = ["area", "corridor", "soilType", "landObservation", "roadAccess", "surveyNumber"] as const;
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

  const waterSources = formData.getAll("waterSources").map(String) as WaterSource[];
  if (waterSources.length) details.waterSources = waterSources;

  // Unchecked boxes are absent from FormData, so only record a true.
  if (formData.get("fencing") === "on") details.fencing = true;
  if (formData.get("electricity") === "on") details.electricity = true;

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
  const imageFiles = formData.getAll("images").filter((f): f is File => f instanceof File && f.size > 0);
  const images = await saveUploadedFiles(imageFiles, "captures");

  const videoFiles = formData.getAll("videos").filter((f): f is File => f instanceof File && f.size > 0);
  const videos = await saveUploadedFiles(videoFiles, "captures");

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
    capturedBy: String(formData.get("capturedBy") || "").trim(),
    propertySlug: propertySlug || null,
    status: "new",
    tags: formData.getAll("tags").map(String).filter(Boolean),
    details,
  };

  await createCapture(capture);
  revalidatePath("/admin/captures");
  revalidatePath("/admin");

  return { ok: true, message: "Saved — thanks! You can capture another." };
}
