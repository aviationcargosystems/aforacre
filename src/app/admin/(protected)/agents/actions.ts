"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin/require-admin";
import { LegacyTableMissingError, createAgent, resetAgentPassword, setAgentActive } from "@/lib/store/agents";

const MIN_PASSWORD_LENGTH = 8;

export async function createAgentAction(formData: FormData) {
  await requireAdmin();

  const username = String(formData.get("username") || "").trim();
  const password = String(formData.get("password") || "");

  if (!username) redirect("/admin/agents?error=username");
  if (password.length < MIN_PASSWORD_LENGTH) redirect("/admin/agents?error=password");

  try {
    await createAgent({
      name: String(formData.get("name") || "").trim(),
      phone: String(formData.get("phone") || "").trim(),
      username,
      password,
    });
  } catch (error) {
    // 23505 = unique_violation on agents.username
    if ((error as { code?: string })?.code === "23505") {
      redirect("/admin/agents?error=duplicate");
    }
    if (error instanceof LegacyTableMissingError) {
      redirect("/admin/agents?error=legacy");
    }
    throw error;
  }

  revalidatePath("/admin/agents");
  redirect("/admin/agents?created=1");
}

export async function setAgentActiveAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const active = String(formData.get("active") || "") === "true";
  if (id) await setAgentActive(id, active);
  revalidatePath("/admin/agents");
}

export async function resetAgentPasswordAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const password = String(formData.get("password") || "");

  if (!id) return;
  if (password.length < MIN_PASSWORD_LENGTH) redirect("/admin/agents?error=password");

  await resetAgentPassword(id, password);
  revalidatePath("/admin/agents");
  redirect("/admin/agents?reset=1");
}
