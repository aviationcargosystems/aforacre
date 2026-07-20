"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import type { Capture } from "@/lib/types";
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

export async function submitCaptureAction(
  _prevState: CaptureActionState,
  formData: FormData
): Promise<CaptureActionState> {
  const imageFiles = formData.getAll("images").filter((f): f is File => f instanceof File && f.size > 0);
  const images = await saveUploadedFiles(imageFiles, "captures");

  const propertySlug = String(formData.get("propertySlug") || "").trim();

  const capture: Capture = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    images,
    lat: parseNumberOrNull(formData.get("lat")),
    lng: parseNumberOrNull(formData.get("lng")),
    locationAccuracyM: parseNumberOrNull(formData.get("locationAccuracyM")),
    label: String(formData.get("label") || "").trim(),
    notes: String(formData.get("notes") || "").trim(),
    capturedBy: String(formData.get("capturedBy") || "").trim(),
    propertySlug: propertySlug || null,
    status: "new",
  };

  await createCapture(capture);
  revalidatePath("/admin/captures");
  revalidatePath("/admin");

  return { ok: true, message: "Saved — thanks! You can capture another." };
}
