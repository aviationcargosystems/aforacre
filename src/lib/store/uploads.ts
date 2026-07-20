import { randomUUID } from "crypto";
import { getSupabaseAdmin, storageBucket } from "@/lib/supabase/server";

// Uploads go to Supabase Storage rather than the local filesystem — a serverless
// deploy (Vercel etc.) doesn't persist local writes between requests, so this is
// required for uploads to actually survive past the request that created them.
function extensionFor(file: File): string {
  const fromName = file.name?.includes(".") ? file.name.slice(file.name.lastIndexOf(".")) : "";
  if (fromName) return fromName.toLowerCase();
  if (file.type === "image/png") return ".png";
  if (file.type === "image/webp") return ".webp";
  if (file.type === "image/heic") return ".heic";
  return ".jpg";
}

export async function saveUploadedFile(file: File, subdir: string): Promise<string> {
  const bucket = storageBucket();
  const objectPath = `${subdir}/${randomUUID()}${extensionFor(file)}`;

  const { error } = await getSupabaseAdmin()
    .storage.from(bucket)
    .upload(objectPath, file, { contentType: file.type || "image/jpeg", upsert: false });
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
