"use server";

import { revalidatePath } from "next/cache";
import type { EnquiryStatus } from "@/lib/types";
import { setEnquiryStatus } from "@/lib/store/enquiries";
import { requireAdmin } from "@/lib/admin/require-admin";

export async function setEnquiryStatusAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "") as EnquiryStatus;
  if (id && status) await setEnquiryStatus(id, status);
  revalidatePath("/admin/enquiries");
  revalidatePath("/admin");
}
