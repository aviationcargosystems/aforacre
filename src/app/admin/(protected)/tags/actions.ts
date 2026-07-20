"use server";

import { revalidatePath } from "next/cache";
import { addTag, removeTag } from "@/lib/store/tags";
import { requireAdmin } from "@/lib/admin/require-admin";

export async function addTagAction(formData: FormData) {
  await requireAdmin();
  const tag = String(formData.get("tag") || "").trim();
  if (tag) await addTag(tag);
  revalidatePath("/admin/tags");
  revalidatePath("/admin/properties/new");
}

export async function removeTagAction(formData: FormData) {
  await requireAdmin();
  const tag = String(formData.get("tag") || "");
  if (tag) await removeTag(tag);
  revalidatePath("/admin/tags");
  revalidatePath("/admin/properties/new");
}
