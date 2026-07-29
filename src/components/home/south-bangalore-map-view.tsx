"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import type { CoverageArea } from "./south-bangalore-map";

const SouthBangaloreMap = dynamic(() => import("./south-bangalore-map"), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full" />,
});

export function SouthBangaloreMapView({ areas }: { areas: CoverageArea[] }) {
  return (
    <div className="flex h-full flex-col">
      {/* Leaflet paints tiles to the container edge, so the rounding has to be
          clipped here rather than set on the map itself.

          `isolate` matters as much as the clipping: Leaflet gives its panes and
          popups z-indexes in the 400-700 range, which outrank the sticky header
          at z-50 and let an open popup paint straight over it. A stacking
          context here keeps all of that contained, so the header stays on top
          however Leaflet numbers its own layers. */}
      <div className="relative isolate z-0 min-h-0 flex-1 overflow-hidden rounded-[1.75rem]">
        <SouthBangaloreMap areas={areas} />
      </div>
      <p className="mt-2.5 text-right text-[10px] leading-none text-muted-foreground/55">
        © OpenStreetMap contributors, © CARTO
      </p>
    </div>
  );
}
