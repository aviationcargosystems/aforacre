"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import type { Property } from "@/lib/types";

const LeafletMap = dynamic(() => import("./leaflet-map"), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full" />,
});

export function PropertyMap(props: {
  properties: Property[];
  hoveredSlug: string | null;
  onHover: (slug: string | null) => void;
}) {
  return <LeafletMap {...props} />;
}
