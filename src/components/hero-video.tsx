"use client";

import { useEffect, useRef } from "react";

export function HeroVideo({ poster }: { poster: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Belt-and-suspenders: the autoplay attribute alone doesn't always fire reliably
    // (some browsers need an explicit play() call once the element is mounted/hydrated).
    ref.current?.play().catch(() => {});
  }, []);

  return (
    <video
      ref={ref}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      poster={poster}
      className="h-full w-full object-cover"
    >
      <source src="/videos/hero-a-for-acre.mp4" type="video/mp4" />
    </video>
  );
}
