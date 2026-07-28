"use server";

import { createLandSubmission } from "@/lib/store/land-submissions";
import { saveUploadedFiles } from "@/lib/store/uploads";
import { isMissingSchemaError } from "@/lib/supabase/server";
import type { LandSubmissionOwnerType } from "@/lib/types";

export interface LandSubmissionActionState {
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

export async function submitLandAction(
  _prevState: LandSubmissionActionState,
  formData: FormData
): Promise<LandSubmissionActionState> {
  const phone = String(formData.get("phone") || "").trim();
  const area = String(formData.get("area") || "").trim();
  if (!phone || !area) {
    return { ok: false, message: "Area and phone number are required." };
  }

  const imageFiles = formData.getAll("images").filter((f): f is File => f instanceof File && f.size > 0);
  const videoFiles = formData.getAll("videos").filter((f): f is File => f instanceof File && f.size > 0);
  const [images, videos] = await Promise.all([
    saveUploadedFiles(imageFiles, "land-submissions"),
    saveUploadedFiles(videoFiles, "land-submissions"),
  ]);

  try {
    await createLandSubmission({
      images,
      videos,
      area,
      lat: parseNumberOrNull(formData.get("lat")),
      lng: parseNumberOrNull(formData.get("lng")),
      extentGunta: parseNumberOrNull(formData.get("extentGunta")),
      extentAcres: parseNumberOrNull(formData.get("extentAcres")),
      expectedPricePerGunta: parseNumberOrNull(formData.get("expectedPricePerGunta")),
      ownerName: String(formData.get("ownerName") || "").trim(),
      ownerType: String(formData.get("ownerType") || "owner") as LandSubmissionOwnerType,
      phone,
      tags: formData.getAll("tags").map((t) => String(t)),
      notes: String(formData.get("notes") || "").trim(),
    });
  } catch (error) {
    if (isMissingSchemaError(error as { code?: string })) {
      return { ok: false, message: "This feature isn't fully set up yet — please call us directly instead." };
    }
    throw error;
  }

  return { ok: true, message: "Thanks — our team will review this and get back to you." };
}
