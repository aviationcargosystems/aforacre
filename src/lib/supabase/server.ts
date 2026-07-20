import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Server-only client using the service-role key — full read/write access, bypasses
// Row Level Security. Every store module in src/lib/store/* runs on the server
// (server components / server actions) and uses this, mirroring how the old
// file-based store had unrestricted access to .data/*.json. Never import this
// file from a "use client" component — the service role key must never reach the browser.
let cached: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (cached) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Supabase isn't configured — set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local."
    );
  }

  cached = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}

export function storageBucket(): string {
  return process.env.SUPABASE_STORAGE_BUCKET || "project-a-uploads";
}
