import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_SESSION_COOKIE, isValidSessionToken } from "@/lib/auth";
import { AGENT_SESSION_COOKIE, agentIdFromSessionToken } from "@/lib/agent-auth";

// Two independent tiers. An admin session must not grant agent access and an
// agent session must not grant admin access — separate cookies, separate
// secrets, separate checks. This runs on the Edge runtime, so everything here
// uses WebCrypto only (see the note in src/lib/agent-auth.ts).
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/agent")) {
    if (pathname === "/agent/login") {
      return NextResponse.next();
    }

    const agentId = await agentIdFromSessionToken(request.cookies.get(AGENT_SESSION_COOKIE)?.value);
    if (!agentId) {
      const loginUrl = new URL("/agent/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // The signature is valid. Whether the agent is still *active* is re-checked
    // server-side in requireAgent(), which can reach the database — Edge can't.
    return NextResponse.next();
  }

  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const valid = await isValidSessionToken(token);

  if (!valid) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/agent/:path*"],
};
