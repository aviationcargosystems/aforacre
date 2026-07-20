import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";

// Saves uploaded files under public/uploads/<subdir>/ so they're served directly
// as static assets by Next.js. Internal/local-server storage only — swap for
// object storage (S3, etc.) once this goes past internal use.
const UPLOADS_ROOT = path.join(process.cwd(), "public", "uploads");

function extensionFor(file: File): string {
  const fromName = path.extname(file.name || "");
  if (fromName) return fromName.toLowerCase();
  if (file.type === "image/png") return ".png";
  if (file.type === "image/webp") return ".webp";
  if (file.type === "image/heic") return ".heic";
  return ".jpg";
}

export async function saveUploadedFile(file: File, subdir: string): Promise<string> {
  const dir = path.join(UPLOADS_ROOT, subdir);
  await fs.mkdir(dir, { recursive: true });
  const filename = `${randomUUID()}${extensionFor(file)}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(dir, filename), buffer);
  return `/uploads/${subdir}/${filename}`;
}

export async function saveUploadedFiles(files: File[], subdir: string): Promise<string[]> {
  const results: string[] = [];
  for (const file of files) {
    if (!file || file.size === 0) continue;
    results.push(await saveUploadedFile(file, subdir));
  }
  return results;
}
