"use server";

import { revalidatePath } from "next/cache";
import { requireAgent } from "@/lib/agent/require-agent";
import { submitRecceForAgent } from "@/lib/store/recces";
import { saveUploadedFiles } from "@/lib/store/uploads";
import { isMissingSchemaError } from "@/lib/supabase/server";

export interface RecceSubmitState {
  ok: boolean;
  message?: string;
}

function parseNumberOrNull(raw: FormDataEntryValue | null): number | null {
  if (raw === null) return null;
  const value = String(raw).trim();
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function submitRecceAction(
  _prevState: RecceSubmitState,
  formData: FormData
): Promise<RecceSubmitState> {
  const agent = await requireAgent();
  const recceId = String(formData.get("recceId") || "");
  if (!recceId) return { ok: false, message: "Missing recce reference." };

  const files = formData.getAll("images").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length === 0) {
    return { ok: false, message: "Add at least one photo before submitting." };
  }

  try {
    const images = await saveUploadedFiles(files, "recces");

    // Scoped to this agent inside the query — a tampered recceId belonging to
    // someone else updates nothing and returns false rather than succeeding.
    const updated = await submitRecceForAgent(recceId, agent.id, {
      images,
      notes: String(formData.get("notes") || "").trim(),
      lat: parseNumberOrNull(formData.get("lat")),
      lng: parseNumberOrNull(formData.get("lng")),
    });

    if (!updated) {
      return { ok: false, message: "This recce isn't assigned to you." };
    }
  } catch (error) {
    if (isMissingSchemaError(error as { code?: string })) {
      return { ok: false, message: "Recces aren't set up on the server yet — tell the office." };
    }
    throw error;
  }

  revalidatePath("/agent");
  revalidatePath(`/agent/recce/${recceId}`);
  revalidatePath("/admin/recces");

  return { ok: true, message: "Submitted — thanks. The office will review it." };
}
