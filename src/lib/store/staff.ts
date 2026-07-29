import { getSupabaseAdmin } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/auth/roles";

/**
 * Staff accounts, on the new model.
 *
 * There is no separate agents table any more. An agent is a Supabase auth user
 * whose profile carries role='agent', which means one identity system instead
 * of two and one place where "is this person still allowed in" is answered.
 *
 * Partners are issued the same way. They used to promote themselves by
 * confirming a phone over OTP; with OTP gone there is no self-serve path, so a
 * broker gets an account the same way an agent does.
 */

export interface StaffMember {
  id: string;
  fullName: string;
  mobile: string;
  email: string | null;
  role: UserRole;
  createdAt: string;
  lastActiveAt: string;
  /** Supabase bans a user by setting a future banned_until. */
  disabled: boolean;
}

interface ProfileRow {
  id: string;
  full_name: string;
  mobile: string;
  role: UserRole;
  created_at: string;
  last_active_at: string;
}

/** Everyone with an account we issued. Buyers, who self-register, are not. */
export async function getStaff(): Promise<StaffMember[]> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, mobile, role, created_at, last_active_at")
    .in("role", ["agent", "super_admin", "partner"])
    .order("created_at", { ascending: false });
  if (error) return [];

  const rows = data as ProfileRow[];
  if (rows.length === 0) return [];

  // Email and ban state live on auth.users, which is not reachable through
  // PostgREST, so they come from the admin API and get merged in.
  const { data: authData } = await supabase.auth.admin.listUsers({ page: 1, perPage: 200 });
  const authById = new Map((authData?.users ?? []).map((u) => [u.id, u]));

  return rows.map((row) => {
    const authUser = authById.get(row.id);
    const bannedUntil = (authUser as { banned_until?: string } | undefined)?.banned_until;
    return {
      id: row.id,
      fullName: row.full_name,
      mobile: row.mobile,
      email: authUser?.email ?? null,
      role: row.role,
      createdAt: row.created_at,
      lastActiveAt: row.last_active_at,
      disabled: Boolean(bannedUntil && new Date(bannedUntil) > new Date()),
    };
  });
}

export class StaffError extends Error {}

/**
 * Creates a staff login.
 *
 * Email is required even for field agents: it is the recovery path, and a
 * phone-only account cannot be reset if the handset is lost. The signup trigger
 * creates the profile, so this only has to set the role afterwards.
 */
export async function createStaff(input: {
  fullName: string;
  email: string;
  mobile: string;
  password: string;
  role: Extract<UserRole, "agent" | "super_admin" | "partner">;
  /** Required when role is partner: the profiles check constraint enforces it. */
  partnerType?: "broker" | "reseller" | "owner";
}): Promise<void> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase.auth.admin.createUser({
    email: input.email.trim().toLowerCase(),
    password: input.password,
    phone: input.mobile.trim() || undefined,
    // Staff are created by an admin who already knows who they are, so there is
    // nothing to confirm by email.
    email_confirm: true,
    user_metadata: { full_name: input.fullName.trim() },
  });

  if (error) throw new StaffError(error.message);
  if (!data.user) throw new StaffError("Supabase did not return the new user.");

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      role: input.role,
      full_name: input.fullName.trim(),
      mobile: input.mobile.trim(),
      partner_type: input.role === "partner" ? (input.partnerType ?? "broker") : null,
      // An admin created this account deliberately, so the contact is already
      // confirmed as far as the submission gate is concerned. Document checks
      // are still a separate step before anything of theirs goes live.
      kyc_status: input.role === "partner" ? "otp_verified" : "none",
    })
    .eq("id", data.user.id);

  if (profileError) {
    // Do not leave an auth user stranded with no usable profile.
    await supabase.auth.admin.deleteUser(data.user.id);
    throw new StaffError(profileError.message);
  }
}

export async function setStaffRole(id: string, role: UserRole): Promise<void> {
  const { error } = await getSupabaseAdmin().from("profiles").update({ role }).eq("id", id);
  if (error) throw new StaffError(error.message);
}

/** Bans or unbans the login. The profile row is kept so history stays attributable. */
export async function setStaffDisabled(id: string, disabled: boolean): Promise<void> {
  const { error } = await getSupabaseAdmin().auth.admin.updateUserById(id, {
    ban_duration: disabled ? "876000h" : "none",
  });
  if (error) throw new StaffError(error.message);
}

export async function setStaffPassword(id: string, password: string): Promise<void> {
  const { error } = await getSupabaseAdmin().auth.admin.updateUserById(id, { password });
  if (error) throw new StaffError(error.message);
}
