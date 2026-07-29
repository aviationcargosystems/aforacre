import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { getSupabaseAdmin, storageBucket } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Hands back a one-shot signed URL so the browser can upload straight to
 * Storage.
 *
 * Everything used to go through the server action, which on Vercel means
 * through a serverless function — and those cap request bodies at 4.5MB, a
 * platform limit no config raises. One phone video is several times that, so
 * the POST was rejected before any of our code ran and the page died with it.
 *
 * Signing here keeps the service role key on the server while the bytes go
 * direct, so upload size stops being bounded by the function at all.
 */

const ALLOWED = /^(image|video)\//;
/** Generous, but not unbounded — this endpoint is reachable by the public capture form. */
const MAX_BYTES = 200 * 1024 * 1024;

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | { filename?: string; contentType?: string; size?: number; folder?: string }
    | null;

  const contentType = body?.contentType ?? "";
  if (!ALLOWED.test(contentType)) {
    return NextResponse.json({ error: "Only images and video can be uploaded." }, { status: 415 });
  }
  if (typeof body?.size === "number" && body.size > MAX_BYTES) {
    return NextResponse.json({ error: "That file is too large." }, { status: 413 });
  }

  // Folder is picked from a fixed set rather than taken as given, so a caller
  // cannot write outside the paths this app owns.
  const folder = body?.folder === "captures" ? "captures" : body?.folder === "properties" ? "properties" : "captures";

  const name = (body?.filename ?? "").toLowerCase();
  const ext = name.includes(".") ? name.slice(name.lastIndexOf(".")) : contentType.startsWith("video/") ? ".mp4" : ".jpg";
  const objectPath = `${folder}/${randomUUID()}${ext.replace(/[^a-z0-9.]/g, "")}`;

  const bucket = storageBucket();
  const { data, error } = await getSupabaseAdmin().storage.from(bucket).createSignedUploadUrl(objectPath);
  if (error) return NextResponse.json({ error: error.message }, { status: 502 });

  const { data: pub } = getSupabaseAdmin().storage.from(bucket).getPublicUrl(objectPath);

  return NextResponse.json({ signedUrl: data.signedUrl, token: data.token, path: objectPath, publicUrl: pub.publicUrl });
}
