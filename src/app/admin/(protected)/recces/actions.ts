"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { RecceStatus, RecceType } from "@/lib/types";
import { requireAdmin } from "@/lib/admin/require-admin";
import { createRecce, reviewRecce } from "@/lib/store/recces";

function parseNumberOrNull(raw: FormDataEntryValue | null): number | null {
  if (raw === null) return null;
  const value = String(raw).trim();
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function assignRecceAction(formData: FormData) {
  await requireAdmin();

  const agentId = String(formData.get("agentId") || "");
  if (!agentId) redirect("/admin/recces?error=agent");

  const scheduledForRaw = String(formData.get("scheduledFor") || "").trim();

  await createRecce({
    type: String(formData.get("type") || "scout") as RecceType,
    agentId,
    propertySlug: String(formData.get("propertySlug") || "") || null,
    area: String(formData.get("area") || "").trim(),
    lat: parseNumberOrNull(formData.get("lat")),
    lng: parseNumberOrNull(formData.get("lng")),
    // datetime-local gives a local wall-clock string; Date normalises it to UTC for timestamptz.
    scheduledFor: scheduledForRaw ? new Date(scheduledForRaw).toISOString() : null,
    instructions: String(formData.get("instructions") || "").trim(),
  });

  revalidatePath("/admin/recces");
  revalidatePath("/agent");
  redirect("/admin/recces?assigned=1");
}

export async function reviewRecceAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "") as RecceStatus;
  const reviewNote = String(formData.get("reviewNote") || "").trim();
  if (id && status) await reviewRecce(id, status, reviewNote);
  revalidatePath("/admin/recces");
  revalidatePath("/agent");
}
