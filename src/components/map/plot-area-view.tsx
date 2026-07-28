"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const PlotAreaMap = dynamic(() => import("./plot-area-map"), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full" />,
});

export function PlotAreaView(props: { lat: number; lng: number; area: string }) {
  return <PlotAreaMap {...props} />;
}
