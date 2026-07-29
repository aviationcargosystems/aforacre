import { randomUUID } from "crypto";
import { getSupabaseAdmin, storageBucket } from "@/lib/supabase/server";

// Uploads go to Supabase Storage rather than the local filesystem — a serverless
// deploy (Vercel etc.) doesn't persist local writes between requests, so this is
// required for uploads to actually survive past the request that created them.
const EXTENSION_BY_TYPE: Record<string, string> = {
  "image/png": ".png",
  "image/webp": ".webp",
  "image/heic": ".heic",
  "image/jpeg": ".jpg",
  "video/mp4": ".mp4",
  "video/quicktime": ".mov",
  "video/webm": ".webm",
};

function extensionFor(file: File): string {
  const fromName = file.name?.includes(".") ? file.name.slice(file.name.lastIndexOf(".")) : "";
  if (fromName) return fromName.toLowerCase();
  // Falling back to .jpg for a video would give the object a filename that
  // contradicts its content type, and some CDNs and players go by extension.
  return EXTENSION_BY_TYPE[file.type] ?? (file.type.startsWith("video/") ? ".mp4" : ".jpg");
}

export async function saveUploadedFile(file: File, subdir: string): Promise<string> {
  const bucket = storageBucket();
  const objectPath = `${subdir}/${randomUUID()}${extensionFor(file)}`;

  const { error } = await getSupabaseAdmin().storage.from(bucket).upload(objectPath, file, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
    // Storage is CDN-fronted and these objects are immutable once written —
    // the path carries a UUID, so a changed file is always a new URL.
    cacheControl: "31536000",
  });
  if (error) throw error;

  const { data } = getSupabaseAdmin().storage.from(bucket).getPublicUrl(objectPath);
  return data.publicUrl;
}

export async function saveUploadedFiles(files: File[], subdir: string): Promise<string[]> {
  const results: string[] = [];
  for (const file of files) {
    if (!file || file.size === 0) continue;
    results.push(await saveUploadedFile(file, subdir));
  }
  return results;
}
