"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { approveLandSubmission, rejectLandSubmission } from "@/lib/store/land-submissions";
import { requireAdmin } from "@/lib/admin/require-admin";

export async function approveLandSubmissionAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  if (!id) return;
  const slug = await approveLandSubmission(id);
  revalidatePath("/admin/land-submissions");
  revalidatePath("/admin");
  revalidatePath("/explore");
  redirect(`/admin/properties/${slug}/edit`);
}

export async function rejectLandSubmissionAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  if (id) await rejectLandSubmission(id);
  revalidatePath("/admin/land-submissions");
  revalidatePath("/admin");
}
