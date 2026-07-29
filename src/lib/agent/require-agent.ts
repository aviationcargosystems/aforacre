import { redirect } from "next/navigation";
import { getSessionProfile, type SessionProfile } from "@/lib/auth/roles";

/**
 * Gate for the agent portal.
 *
 * Defense in depth, same shape as requireRole(): middleware already gates
 * /agent/* on the session, but a server action can be invoked directly, so
 * every agent action re-checks here.
 *
 * This is also where a disabled account actually bites. Disabling bans the
 * login in Supabase, and getSessionProfile() revalidates the token with
 * Supabase rather than decoding the cookie, so a banned agent stops getting
 * through on the next request instead of whenever their token happens to
 * expire.
 *
 * Super admins pass too, so they can see the portal their agents are using.
 */
export async function requireAgent(): Promise<SessionProfile> {
  const profile = await getSessionProfile();

  if (!profile) {
    redirect("/login?next=%2Fagent");
  }
  if (profile.role !== "agent" && profile.role !== "super_admin") {
    redirect("/login?error=not_an_agent");
  }

  return profile;
}
