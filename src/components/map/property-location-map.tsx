"use client";

import { useState } from "react";
import type { Property } from "@/lib/types";
import { PropertyMap } from "@/components/map/property-map";

export function PropertyLocationMap({ property }: { property: Property }) {
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(property.slug);
  return <PropertyMap properties={[property]} hoveredSlug={hoveredSlug} onHover={setHoveredSlug} />;
}
