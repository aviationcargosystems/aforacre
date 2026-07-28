import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export type UserRole = "super_admin" | "agent" | "partner" | "buyer";
export type PartnerType = "broker" | "reseller" | "owner";
export type KycStatus = "none" | "otp_verified" | "docs_submitted" | "verified" | "rejected";

export interface SessionProfile {
  id: string;
  fullName: string;
  mobile: string;
  role: UserRole;
  partnerType: PartnerType | null;
  kycStatus: KycStatus;
}

/** Where each role lands after signing in. */
export const HOME_FOR_ROLE: Record<UserRole, string> = {
  super_admin: "/admin",
  agent: "/agent",
  partner: "/partner",
  buyer: "/",
};

const ROLE_RANK: Record<UserRole, number> = {
  buyer: 0,
  partner: 1,
  agent: 2,
  super_admin: 3,
};

export function roleAtLeast(role: UserRole, minimum: UserRole): boolean {
  return ROLE_RANK[role] >= ROLE_RANK[minimum];
}

/**
 * The signed-in user's profile, or null. Reads through the user's own session,
 * so the profiles RLS policy applies and this can only ever return the caller's
 * own row.
 */
export async function getSessionProfile(): Promise<SessionProfile | null> {
  const supabase = await createSupabaseServerClient();

  // getUser() revalidates the token with Supabase. getSession() only decodes
  // the cookie, which the client controls, so it must not be used for an
  // authorization decision.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, mobile, role, partner_type, kyc_status")
    .eq("id", user.id)
    .maybeSingle();
  if (error || !data) return null;

  return {
    id: data.id,
    fullName: data.full_name ?? "",
    mobile: data.mobile ?? "",
    role: data.role as UserRole,
    partnerType: (data.partner_type as PartnerType | null) ?? null,
    kycStatus: data.kyc_status as KycStatus,
  };
}

/**
 * Gate a server component or server action on a minimum role.
 *
 * Middleware already blocks the route, but middleware only sees the URL. This
 * re-checks against the database on the request itself, so a server action
 * reached by any other path is still guarded.
 */
export async function requireRole(minimum: UserRole): Promise<SessionProfile> {
  const profile = await getSessionProfile();
  if (!profile) redirect(`/login?next=${encodeURIComponent(HOME_FOR_ROLE[minimum])}`);
  if (!roleAtLeast(profile.role, minimum)) redirect(HOME_FOR_ROLE[profile.role]);
  return profile;
}
