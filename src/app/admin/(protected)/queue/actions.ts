"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/require-admin";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { USE_CASE_KEYS } from "@/lib/plots/use-cases";

function text(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function optionalNumber(formData: FormData, key: string): number | null {
  const raw = text(formData, key);
  if (raw === "") return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

/**
 * Reject sends the submission back with a reason.
 *
 * The reason is not optional: a partner staring at "rejected" with no
 * explanation cannot fix anything, and the database rejects a reasonless
 * rejection anyway.
 */
export async function rejectSubmissionAction(formData: FormData) {
  await requireAdmin();

  const id = text(formData, "id");
  const reason = text(formData, "reason");
  if (!reason) redirect(`/admin/queue/${id}?error=reason`);

  const { error } = await getSupabaseAdmin()
    .from("submissions")
    .update({ status: "rejected", reject_reason: reason, reviewed_at: new Date().toISOString() })
    .eq("id", id)
    .eq("status", "pending");

  if (error) redirect(`/admin/queue/${id}?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/admin/queue");
  redirect("/admin/queue?rejected=1");
}

/**
 * Approve mints the FID and publishes the plot.
 *
 * Everything here is validated before the call rather than trusting the form,
 * because approve_submission is one transaction: a half-filled enrichment would
 * put a live plot in front of buyers with nothing for the match engine to score
 * on. The FID itself is generated inside that transaction, never on submission.
 */
export async function approveSubmissionAction(formData: FormData) {
  await requireAdmin();

  const id = text(formData, "id");

  const required = {
    corridor: text(formData, "corridor"),
    roadAccess: text(formData, "roadAccess"),
    water: text(formData, "water"),
    soilQuality: text(formData, "soilQuality"),
    pocId: text(formData, "pocId"),
  };
  const missing = Object.entries(required)
    .filter(([, value]) => !value)
    .map(([key]) => key);
  if (missing.length > 0) {
    redirect(`/admin/queue/${id}?missing=${encodeURIComponent(missing.join(","))}`);
  }

  const areaAcres = optionalNumber(formData, "areaAcres");
  const priceTotal = optionalNumber(formData, "priceTotal");
  if (areaAcres === null || areaAcres < 1) redirect(`/admin/queue/${id}?missing=areaAcres`);
  if (priceTotal === null || priceTotal <= 0) redirect(`/admin/queue/${id}?missing=priceTotal`);

  const suitability = USE_CASE_KEYS.map((useCase) => ({
    use_case: useCase,
    score: optionalNumber(formData, `score_${useCase}`) ?? 0,
    rationale: text(formData, `rationale_${useCase}`),
  }));
  if (suitability.some((entry) => entry.score < 0 || entry.score > 100)) {
    redirect(`/admin/queue/${id}?missing=suitability`);
  }

  const { error } = await getSupabaseAdmin().rpc("approve_submission", {
    p_submission_id: id,
    p_title: text(formData, "title"),
    p_area_acres: areaAcres,
    p_price_total: priceTotal,
    p_corridor: required.corridor,
    p_village: text(formData, "village"),
    p_lat: optionalNumber(formData, "lat"),
    p_lng: optionalNumber(formData, "lng"),
    p_road_access: required.roadAccess,
    p_road_width_ft: optionalNumber(formData, "roadWidthFt"),
    p_water: required.water,
    p_fencing: formData.get("fencing") === "on",
    p_electricity: formData.get("electricity") === "on",
    p_existing_structure: text(formData, "existingStructure"),
    p_soil_quality: required.soilQuality,
    p_poc_id: required.pocId,
    p_suitability: suitability,
  });

  if (error) redirect(`/admin/queue/${id}?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/admin/queue");
  redirect("/admin/queue?approved=1");
}

/** Marks a partner's documents as checked, which unblocks their first approval. */
export async function setKycStatusAction(formData: FormData) {
  await requireAdmin();

  const profileId = text(formData, "profileId");
  const status = text(formData, "status");
  const submissionId = text(formData, "submissionId");

  const { error } = await getSupabaseAdmin()
    .from("profiles")
    .update({ kyc_status: status })
    .eq("id", profileId);

  if (error) redirect(`/admin/queue/${submissionId}?error=${encodeURIComponent(error.message)}`);

  revalidatePath(`/admin/queue/${submissionId}`);
  redirect(`/admin/queue/${submissionId}?kyc=1`);
}
