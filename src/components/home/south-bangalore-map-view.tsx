"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import type { CoverageArea } from "./south-bangalore-map";

const SouthBangaloreMap = dynamic(() => import("./south-bangalore-map"), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full" />,
});

export function SouthBangaloreMapView({ areas }: { areas: CoverageArea[] }) {
  return <SouthBangaloreMap areas={areas} />;
}
