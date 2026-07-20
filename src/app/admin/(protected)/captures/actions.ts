"use server";

import { revalidatePath } from "next/cache";
import type { CaptureStatus } from "@/lib/types";
import { setCaptureStatus, deleteCapture } from "@/lib/store/captures";
import { requireAdmin } from "@/lib/admin/require-admin";

export async function setCaptureStatusAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "") as CaptureStatus;
  if (id && status) await setCaptureStatus(id, status);
  revalidatePath("/admin/captures");
}

export async function deleteCaptureAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  if (id) await deleteCapture(id);
  revalidatePath("/admin/captures");
}
