"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const PlotTerrainMap = dynamic(() => import("./plot-terrain-map"), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full" />,
});

export function PlotTerrainView(props: { lat: number; lng: number; area: string }) {
  return <PlotTerrainMap {...props} />;
}
