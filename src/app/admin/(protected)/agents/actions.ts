"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin/require-admin";
import { StaffError, createStaff, setStaffDisabled, setStaffPassword, setStaffRole } from "@/lib/store/staff";
import type { UserRole } from "@/lib/auth/roles";

const MIN_PASSWORD_LENGTH = 8;

/** Surfaces the real reason rather than an opaque code the admin cannot act on. */
function fail(message: string): never {
  redirect(`/admin/agents?error=${encodeURIComponent(message)}`);
}

export async function createAgentAction(formData: FormData) {
  await requireAdmin();

  const fullName = String(formData.get("fullName") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const mobile = String(formData.get("mobile") || "").trim();
  const password = String(formData.get("password") || "");
  const role = String(formData.get("role") || "agent") as "agent" | "super_admin" | "partner";

  if (!fullName) fail("Add a name.");
  if (!email.includes("@")) fail("A work email is required. It is the recovery path if a phone is lost.");
  if (password.length < MIN_PASSWORD_LENGTH) fail(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);

  try {
    await createStaff({ fullName, email, mobile, password, role });
  } catch (error) {
    fail(error instanceof StaffError ? error.message : "Could not create that account.");
  }

  revalidatePath("/admin/agents");
  redirect("/admin/agents?created=1");
}

export async function setAgentActiveAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const disabled = String(formData.get("disabled") || "") === "true";

  try {
    await setStaffDisabled(id, disabled);
  } catch (error) {
    fail(error instanceof StaffError ? error.message : "Could not update that account.");
  }

  revalidatePath("/admin/agents");
  redirect("/admin/agents");
}

export async function setAgentRoleAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const role = String(formData.get("role") || "agent") as UserRole;

  try {
    await setStaffRole(id, role);
  } catch (error) {
    fail(error instanceof StaffError ? error.message : "Could not change that role.");
  }

  revalidatePath("/admin/agents");
  redirect("/admin/agents");
}

export async function resetAgentPasswordAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const password = String(formData.get("password") || "");

  if (password.length < MIN_PASSWORD_LENGTH) fail(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);

  try {
    await setStaffPassword(id, password);
  } catch (error) {
    fail(error instanceof StaffError ? error.message : "Could not reset that password.");
  }

  revalidatePath("/admin/agents");
  redirect("/admin/agents?reset=1");
}
