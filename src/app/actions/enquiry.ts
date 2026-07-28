"use server";

import { createEnquiry } from "@/lib/store/enquiries";
import { isMissingSchemaError } from "@/lib/supabase/server";

export interface EnquiryActionState {
  ok: boolean;
  message?: string;
}

export async function submitEnquiryAction(
  _prevState: EnquiryActionState,
  formData: FormData
): Promise<EnquiryActionState> {
  const phone = String(formData.get("phone") || "").trim();
  if (!phone) {
    return { ok: false, message: "A phone number is required." };
  }

  try {
    await createEnquiry({
      name: String(formData.get("name") || "").trim(),
      phone,
      context: String(formData.get("context") || "").trim(),
      propertySlug: String(formData.get("propertySlug") || "").trim() || null,
      message: String(formData.get("message") || "").trim(),
    });
  } catch (error) {
    if (isMissingSchemaError(error as { code?: string })) {
      return { ok: false, message: "This feature isn't fully set up yet — please call us directly instead." };
    }
    throw error;
  }

  return { ok: true, message: "Thanks — our team will reach out shortly." };
}
