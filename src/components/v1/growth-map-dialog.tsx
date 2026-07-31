"use client";

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
import { SouthBangaloreMapView } from "@/components/home/south-bangalore-map-view";
import type { CoverageArea } from "@/components/home/south-bangalore-map";

/**
 * "Explore growth map" opens the corridor map rather than leaving the page.
 *
 * It is the same component the homepage uses, so the blooms, the pins and the
 * framing are the one map, maintained once. Mounting it inside the dialog
 * rather than beside the cards keeps a heavy Leaflet instance out of the
 * initial page: the dialog content is not rendered until it opens.
 */
export function GrowthMapDialog({ areas }: { areas: CoverageArea[] }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="mt-6 inline-flex items-center gap-2 rounded-full border border-border bg-background px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary"
        >
          Explore growth map <ArrowRight className="h-4 w-4" />
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-[min(56rem,92vw)] p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="font-heading text-xl font-semibold">
            Where the corridor is
          </DialogTitle>
          <DialogDescription>
            The three committed projects, and the villages we list in. Click a marker for detail.
          </DialogDescription>
        </DialogHeader>
        <div className="h-[min(60vh,26rem)] px-6 pb-6">
          {open && <SouthBangaloreMapView areas={areas} />}
        </div>
      </DialogContent>
    </Dialog>
  );
}
