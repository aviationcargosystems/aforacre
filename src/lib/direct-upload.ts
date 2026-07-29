"use client";

/**
 * Uploads a file straight from the browser to Storage, with real progress.
 *
 * Routing bytes through the server action meant routing them through a Vercel
 * function, which rejects any request body over 4.5MB before our code runs.
 * A signed URL sidesteps that entirely: the function only ever handles the few
 * hundred bytes of the signing request.
 *
 * XHR rather than fetch because fetch still has no upload progress event, and a
 * capture on a 4G connection with no progress indicator is indistinguishable
 * from one that has hung.
 */

export interface UploadResult {
  publicUrl: string;
}

export async function uploadDirect(
  file: File,
  folder: "captures" | "properties",
  onProgress?: (fraction: number) => void
): Promise<UploadResult> {
  const signRes = await fetch("/api/upload-url", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ filename: file.name, contentType: file.type, size: file.size, folder }),
  });
  const signed = await signRes.json();
  if (!signRes.ok) throw new Error(signed.error ?? "Could not start the upload.");

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", signed.signedUrl, true);
    xhr.setRequestHeader("content-type", file.type || "application/octet-stream");
    // Storage keeps the object under the path the token was signed for.
    xhr.setRequestHeader("x-upsert", "false");

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress?.(e.loaded / e.total);
    };
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve()
        : reject(new Error(`Upload failed (${xhr.status}). ${xhr.responseText.slice(0, 120)}`));
    xhr.onerror = () => reject(new Error("Upload failed — check the connection and try again."));
    xhr.send(file);
  });

  onProgress?.(1);
  return { publicUrl: signed.publicUrl };
}
