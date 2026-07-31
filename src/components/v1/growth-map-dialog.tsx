"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { CORE_REGIONS, isPlaced } from "@/lib/regions";
import { GROWTH_ANCHORS } from "@/lib/anchors";
import type { AnchorPin, RegionPin } from "@/components/v1/geography-map";

const GeographyMap = dynamic(() => import("@/components/v1/geography-map"), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full rounded-xl" />,
});

/**
 * "Explore growth map" opens the corridor rather than leaving the page.
 *
 * It draws the same labelled map the geography section uses, not the older
 * unlabelled coverage map: a handful of anonymous dots asked the reader to take
 * on trust which one was the airport. The three projects are named on the map,
 * the villages we list in sit under them, and the frame is fitted to both — so
 * "we list inside these rings" is something you can see rather than a claim.
 *
 * The map is only mounted once the dialog opens, which keeps a Leaflet instance
 * out of the initial page.
 */

/** Short enough to sit on a pin without covering the next one. */
const ANCHOR_LABELS: Record<string, string> = {
  iimb: "New IIMB campus",
  stadium: "Cricket stadium",
  airport: "Second airport",
};

export function GrowthMapDialog() {
  const [open, setOpen] = useState(false);
  const [focus, setFocus] = useState<RegionPin | null>(null);
  const [resetKey, setResetKey] = useState(0);

  const villages: RegionPin[] = CORE_REGIONS.filter(isPlaced).map((region) => ({
    name: region.name,
    lat: region.lat,
    lng: region.lng,
  }));

  const anchors: AnchorPin[] = GROWTH_ANCHORS.map((anchor) => ({
    name: ANCHOR_LABELS[anchor.id] ?? anchor.title,
    lat: anchor.lat,
    lng: anchor.lng,
    // The airport site is not settled, and every surface that names it says so.
    note: anchor.disclaimer,
  }));

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) {
          setFocus(null);
          setResetKey((k) => k + 1);
        }
      }}
    >
      <DialogTrigger asChild>
        <button
          type="button"
          className="mt-6 inline-flex items-center gap-2 rounded-full border border-border bg-background px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary"
        >
          Explore growth map <ArrowRight className="h-4 w-4" />
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-[min(60rem,94vw)] p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="font-heading text-xl font-semibold">
            Where the corridor is
          </DialogTitle>
          <DialogDescription>
            Terracotta marks the three committed projects. The dark pins are the villages we list in.
          </DialogDescription>
        </DialogHeader>
        <div className="px-6 pb-6">
          <div className="relative isolate z-0 h-[min(62vh,30rem)] overflow-hidden rounded-xl">
            {open && (
              <GeographyMap
                pins={villages}
                anchors={anchors}
                focus={focus}
                onSelect={setFocus}
                resetKey={resetKey}
              />
            )}
          </div>
          <p className="mt-2 text-right text-[10px] leading-none text-muted-foreground/55">
            © OpenStreetMap contributors, © CARTO
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
