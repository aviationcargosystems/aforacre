"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const PinLocationMap = dynamic(() => import("./pin-location-map"), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full" />,
});

export function PinLocationPicker(props: {
  lat: number | null;
  lng: number | null;
  onPick: (lat: number, lng: number) => void;
}) {
  return <PinLocationMap {...props} />;
}
