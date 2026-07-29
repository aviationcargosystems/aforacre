"use client";

import { useRef } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { Property } from "@/lib/types";
import { PropertyCard } from "@/components/property-card";
import { Button } from "@/components/ui/button";
import { DragRail } from "@/components/drag-rail";

export function FeaturedLandCarousel({ properties }: { properties: Property[] }) {
  const railRef = useRef<HTMLDivElement>(null);

  function scroll(direction: "left" | "right") {
    const rail = railRef.current;
    if (!rail) return;

    const card = rail.querySelector<HTMLElement>("[data-featured-card]");
    const cardWidth = card?.offsetWidth ?? 380;
    const gap = 20;
    rail.scrollBy({
      left: direction === "right" ? cardWidth + gap : -(cardWidth + gap),
      behavior: "smooth",
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end gap-2">
        <Button
          type="button"
          variant="pill-outline"
          size="icon-sm"
          aria-label="Scroll featured land left"
          onClick={() => scroll("left")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="pill-outline"
          size="icon-sm"
          aria-label="Scroll featured land right"
          onClick={() => scroll("right")}
        >
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      <DragRail innerRef={railRef} className="flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {properties.map((property) => (
          <div
            key={property.slug}
            data-featured-card
            className="min-w-[min(88vw,390px)] max-w-[390px] shrink-0 snap-start md:min-w-[360px]"
          >
            <PropertyCard property={property} />
          </div>
        ))}
      </DragRail>
    </div>
  );
}
