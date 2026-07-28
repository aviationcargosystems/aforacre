import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/**
 * Request-scoped Supabase client that carries the signed-in user's session.
 *
 * Use this for anything a user does on their own behalf, so RLS applies. It is
 * deliberately separate from getSupabaseAdmin() in ./server, which uses the
 * service-role key and bypasses RLS entirely. Reach for the admin client only
 * where the operation genuinely has no user context, such as a trigger-driven
 * job or an anonymous quiz write.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Server components cannot set cookies. Session refresh happens in
            // middleware instead, so swallowing this is correct rather than a
            // silenced bug.
          }
        },
      },
    }
  );
}
