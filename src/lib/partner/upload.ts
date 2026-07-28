import { createSupabaseBrowserClient } from "@/lib/supabase/client";

/**
 * Uploads to Supabase Storage over XHR rather than the JS client's fetch.
 *
 * supabase-js gives no upload progress, and on a 4G connection in a field a
 * ten-image upload with no feedback looks identical to a frozen page. XHR
 * exposes real byte progress, so the bar reflects what is actually happening.
 */
export function uploadWithProgress(
  bucket: string,
  path: string,
  blob: Blob,
  accessToken: string,
  onProgress: (fraction: number) => void,
  signal?: AbortSignal
): Promise<void> {
  return new Promise((resolve, reject) => {
    const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const request = new XMLHttpRequest();
    request.open("POST", `${base}/storage/v1/object/${bucket}/${path}`);
    request.setRequestHeader("Authorization", `Bearer ${accessToken}`);
    request.setRequestHeader("x-upsert", "true");
    if (blob.type) request.setRequestHeader("Content-Type", blob.type);

    request.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(event.loaded / event.total);
    };
    request.onload = () => {
      if (request.status >= 200 && request.status < 300) {
        onProgress(1);
        resolve();
      } else {
        reject(new Error(`Upload failed (${request.status})`));
      }
    };
    request.onerror = () => reject(new Error("Network dropped during upload"));
    request.onabort = () => reject(new Error("Upload cancelled"));

    signal?.addEventListener("abort", () => request.abort(), { once: true });
    request.send(blob);
  });
}

/** The caller's current access token, needed for the raw storage request. */
export async function currentAccessToken(): Promise<string> {
  const supabase = createSupabaseBrowserClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error("Your session expired. Sign in again.");
  return session.access_token;
}
