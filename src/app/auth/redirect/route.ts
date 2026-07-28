import { NextResponse, type NextRequest } from "next/server";
import { getSessionProfile, HOME_FOR_ROLE } from "@/lib/auth/roles";

// Where a freshly signed-in user goes. The client cannot work this out for
// itself without reading its own role, and the role lives behind RLS, so the
// decision is made here.
export async function GET(request: NextRequest) {
  const profile = await getSessionProfile();
  if (!profile) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.redirect(new URL(HOME_FOR_ROLE[profile.role], request.url));
}
