import Image from "next/image";

export interface ZoomThroughImage {
  src: string;
  alt: string;
}

/**
 * Continuous "zoom into the land" effect: N images stacked full-bleed, each
 * playing the same scale+fade keyframe (see .animate-zoom-through in
 * globals.css) staggered evenly around the cycle — so as one image finishes
 * zooming in and fades out, the next is just fading in beneath it, giving the
 * illusion of an endless zoom. Pure CSS (transform + opacity), no JS ticking.
 */
export function ZoomThrough({
  images,
  secondsPerImage = 5,
  className = "",
}: {
  images: ZoomThroughImage[];
  /** How long each image spends in the cycle before handing off to the next. */
  secondsPerImage?: number;
  className?: string;
}) {
  const duration = secondsPerImage * images.length;

  return (
    <div className={`relative h-full w-full overflow-hidden bg-deep-green ${className}`}>
      {images.map((image, index) => (
        <div
          key={image.src}
          className="animate-zoom-through absolute inset-0"
          style={{
            animationDuration: `${duration}s`,
            animationDelay: `${-(secondsPerImage * index)}s`,
            zIndex: index,
          }}
        >
          <Image src={image.src} alt={image.alt} fill sizes="100vw" className="object-cover" priority={index === 0} />
        </div>
      ))}
    </div>
  );
}
