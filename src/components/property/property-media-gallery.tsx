"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, MapPin, Play } from "lucide-react";

type GalleryMedia =
  | { kind: "image"; src: string; label: string }
  | { kind: "video"; src: string; label: string; poster?: string };

export function PropertyMediaGallery({
  title,
  location,
  images,
  videos,
}: {
  title: string;
  location: string;
  images: string[];
  videos: string[];
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const media: GalleryMedia[] = [
    ...(images[0] ? [{ kind: "image" as const, src: images[0], label: title }] : []),
    ...videos.map((src, index) => ({
      kind: "video" as const,
      src,
      label: `Property walkthrough ${index + 1}`,
      poster: images[index + 1] ?? images[0],
    })),
    ...images.slice(1).map((src, index) => ({
      kind: "image" as const,
      src,
      label: `${title}, photograph ${index + 2}`,
    })),
  ];

  function moveTo(index: number) {
    const nextIndex = Math.max(0, Math.min(media.length - 1, index));
    const scroller = scrollerRef.current;
    if (!scroller) return;
    scroller.scrollTo({ left: scroller.clientWidth * nextIndex, behavior: "smooth" });
    setActiveIndex(nextIndex);
  }

  if (media.length === 0) {
    return (
      <div className="flex aspect-[16/8.2] min-h-[24rem] items-center justify-center rounded-[1.5rem] bg-muted text-sm text-muted-foreground sm:aspect-[16/7]">
        Photography coming soon
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-[1.5rem] bg-muted" aria-label="Property photo and video gallery">
      <div
        ref={scrollerRef}
        onScroll={(event) => {
          const element = event.currentTarget;
          if (!element.clientWidth) return;
          setActiveIndex(Math.round(element.scrollLeft / element.clientWidth));
        }}
        className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain"
      >
        {media.map((item, index) => (
          <div
            key={`${item.kind}-${item.src}`}
            // Photos get the tall editorial frame; a landscape clip in that
            // frame is mostly black bars, so video slides take a 16/9 shape on
            // a phone and match the photos again once the frame is wide.
            className={`relative min-w-full snap-center sm:aspect-[16/8.2] lg:aspect-[16/7] ${
              item.kind === "video" ? "aspect-video" : "aspect-[4/5] min-h-[28rem]"
            }`}
          >
            {item.kind === "image" ? (
              <Image
                src={item.src}
                alt={item.label}
                fill
                sizes="(max-width: 768px) 100vw, 1280px"
                className="object-cover"
                priority={index === 0}
              />
            ) : (
              <video
                src={item.src}
                poster={item.poster}
                controls
                playsInline
                preload="metadata"
                className="h-full w-full bg-black object-contain"
                aria-label={item.label}
              />
            )}
            {item.kind === "image" && (
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_58%,rgba(7,17,13,0.42)_100%)]" />
            )}
            {item.kind === "video" && (
              <span className="pointer-events-none absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white backdrop-blur sm:left-6 sm:top-5">
                <Play className="h-3 w-3 fill-current" /> Walkthrough
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="pointer-events-none absolute inset-x-4 bottom-4 flex items-end justify-between gap-4 text-white sm:inset-x-6 sm:bottom-5">
        <p className="flex min-w-0 items-center gap-1.5 text-xs font-medium drop-shadow">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{location}</span>
        </p>
        <span className="shrink-0 rounded-full bg-black/45 px-2.5 py-1 text-[10px] font-semibold tabular-nums backdrop-blur">
          {activeIndex + 1} / {media.length}
        </span>
      </div>

      {media.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => moveTo(activeIndex - 1)}
            disabled={activeIndex === 0}
            className="absolute left-3 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/88 text-foreground shadow-sm backdrop-blur transition hover:bg-white disabled:opacity-0 sm:flex"
            aria-label="Previous media"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => moveTo(activeIndex + 1)}
            disabled={activeIndex === media.length - 1}
            className="absolute right-3 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/88 text-foreground shadow-sm backdrop-blur transition hover:bg-white disabled:opacity-0 sm:flex"
            aria-label="Next media"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <div className="absolute left-1/2 top-4 flex -translate-x-1/2 gap-1.5 sm:top-5" aria-hidden="true">
            {media.map((item, index) => (
              <span
                key={`${item.kind}-${index}`}
                className={`h-1 rounded-full shadow-sm transition-all ${
                  activeIndex === index ? "w-6 bg-white" : "w-1.5 bg-white/55"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
