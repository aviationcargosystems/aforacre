import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { ADMIN_SESSION_COOKIE, isValidSessionToken } from "@/lib/auth";

type Role = "super_admin" | "agent" | "partner" | "buyer";

const RANK: Record<Role, number> = { buyer: 0, partner: 1, agent: 2, super_admin: 3 };

/**
 * Reads the Supabase session and the caller's role, refreshing the auth cookies
 * onto `response` as it goes. Returns null when there is no signed-in user.
 */
async function supabaseRole(request: NextRequest, response: NextResponse): Promise<Role | null> {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  return (data?.role as Role | undefined) ?? null;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next({ request });

  // Public auth entry points.
  if (pathname === "/login" || pathname === "/admin/login" || pathname === "/agent/login") {
    return response;
  }

  // /partner is the new-model surface: Supabase Auth only, no legacy path.
  if (pathname.startsWith("/partner")) {
    const role = await supabaseRole(request, response);
    if (!role) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (RANK[role] < RANK.partner) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return response;
  }

  const required: Role = pathname.startsWith("/agent") ? "agent" : "super_admin";
  const role = await supabaseRole(request, response);
  if (role && RANK[role] >= RANK[required]) {
    return response;
  }

  // Agents are profiles now, so there is no second cookie tier to fall back to
  // for /agent. Anyone without a Supabase session goes to the one login page.
  if (pathname.startsWith("/agent")) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // The shared admin password is the last legacy gate. It goes when admin moves
  // onto Supabase Auth; until then it is what keeps the running product usable.
  if (await isValidSessionToken(request.cookies.get(ADMIN_SESSION_COOKIE)?.value)) {
    return response;
  }

  const loginUrl = new URL("/admin/login", request.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*", "/agent/:path*", "/partner/:path*"],
};
