"use client";

import { createBrowserClient } from "@supabase/ssr";

// Browser client. Uses the anon key, so every query it makes is subject to the
// RLS policies in supabase/migrations/0006. That is the point: the browser is
// never trusted, and a bug in a component cannot read past a policy.
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
