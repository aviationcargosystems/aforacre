import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { getSessionProfile, HOME_FOR_ROLE } from "@/lib/auth/roles";

// Magic-link landing. Supabase sends the user here with a one-time code that
// gets exchanged for a session cookie.
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const next = request.nextUrl.searchParams.get("next");

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=missing_code", request.url));
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(new URL("/login?error=invalid_link", request.url));
  }

  if (next) return NextResponse.redirect(new URL(next, request.url));

  const profile = await getSessionProfile();
  return NextResponse.redirect(new URL(profile ? HOME_FOR_ROLE[profile.role] : "/", request.url));
}
