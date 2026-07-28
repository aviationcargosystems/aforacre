import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ZoomThrough } from "@/components/zoom-through";

export const metadata = {
  title: "Zoom Demo — A for Acre",
  description: "Prototype: a continuous zoom-through effect using real forest and farmland photography.",
};

const ZOOM_IMAGES = [
  { src: "https://images.unsplash.com/photo-1640125346217-e4bb9313d6bd?auto=format&fit=crop&w=1600&q=75", alt: "Aerial view of forest canopy" },
  { src: "https://images.unsplash.com/photo-1774284583593-2232114e19d9?auto=format&fit=crop&w=1600&q=75", alt: "Aerial farmland patchwork" },
  { src: "https://images.unsplash.com/photo-1631006995557-9866a74ee05c?auto=format&fit=crop&w=1600&q=75", alt: "Dense tropical forest canopy" },
  { src: "https://images.unsplash.com/photo-1734373810472-4c246b1ea5b9?auto=format&fit=crop&w=1600&q=75", alt: "Misty forest interior" },
  { src: "https://images.unsplash.com/photo-1751237140957-e65874b39247?auto=format&fit=crop&w=1600&q=75", alt: "Sunlight through tree canopy" },
  { src: "https://images.unsplash.com/photo-1764936511066-2e1486ddd861?auto=format&fit=crop&w=1600&q=75", alt: "Forest floor undergrowth" },
];

export default function ZoomDemoPage() {
  return (
    <div className="relative h-[100dvh] w-full">
      <ZoomThrough images={ZOOM_IMAGES} secondsPerImage={5} />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
      <Link
        href="/"
        className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm sm:left-6 sm:top-6"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to site
      </Link>
      <div className="absolute inset-x-0 bottom-0 px-4 pb-10 text-center text-white sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/70">Prototype</p>
        <h1 className="mt-2 font-heading text-3xl font-semibold sm:text-4xl">Zoom into the land</h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-white/80">
          A continuous zoom effect built from real forest &amp; farmland photography — not a true infinite
          zoomquilt (that needs custom nested artwork), but a convincing loop for a hero moment.
        </p>
      </div>
    </div>
  );
}
