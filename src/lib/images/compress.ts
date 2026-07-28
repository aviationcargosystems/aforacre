/**
 * Client-side image compression.
 *
 * Partners submit from phones on 4G in the middle of a field. A modern phone
 * camera produces 4 to 8MB per shot, and ten of those is a 60MB upload that
 * will not finish. Resizing and re-encoding in the browser first turns that
 * into roughly 2MB total.
 */

export const MAX_EDGE_PX = 1600;
export const TARGET_BYTES = 200 * 1024;
/** Hard ceiling. Some photos will not reach the target without looking bad. */
export const MAX_BYTES = 300 * 1024;

const QUALITY_LADDER = [0.82, 0.7, 0.6, 0.5, 0.42];

function loadBitmap(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === "function") {
    // Honours EXIF orientation, which a bare <img> does not in every browser.
    return createImageBitmap(file, { imageOrientation: "from-image" });
  }
  return new Promise((resolve, reject) => {
    const image = new Image();
    const url = URL.createObjectURL(file);
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read that image"));
    };
    image.src = url;
  });
}

function toBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
}

export interface CompressedImage {
  blob: Blob;
  width: number;
  height: number;
  bytes: number;
}

/**
 * Scales the long edge down to MAX_EDGE_PX and steps quality down until the
 * result fits TARGET_BYTES, stopping at the lowest rung rather than degrading
 * indefinitely. An image already smaller than the target is still re-encoded so
 * that output is predictable regardless of what the camera produced.
 */
export async function compressImage(file: File): Promise<CompressedImage> {
  const source = await loadBitmap(file);
  const sourceWidth = "width" in source ? source.width : 0;
  const sourceHeight = "height" in source ? source.height : 0;

  const scale = Math.min(1, MAX_EDGE_PX / Math.max(sourceWidth, sourceHeight));
  const width = Math.max(1, Math.round(sourceWidth * scale));
  const height = Math.max(1, Math.round(sourceHeight * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is unavailable in this browser");
  context.drawImage(source as CanvasImageSource, 0, 0, width, height);
  if ("close" in source) source.close();

  let best: Blob | null = null;
  for (const quality of QUALITY_LADDER) {
    const blob = await toBlob(canvas, quality);
    if (!blob) continue;
    best = blob;
    if (blob.size <= TARGET_BYTES) break;
  }

  if (!best) throw new Error("Could not compress that image");
  return { blob: best, width, height, bytes: best.size };
}
