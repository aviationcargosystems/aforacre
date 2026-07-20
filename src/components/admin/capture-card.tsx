"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, User } from "lucide-react";
import type { Capture } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { setCaptureStatusAction, deleteCaptureAction } from "@/app/admin/(protected)/captures/actions";

const statusStyles: Record<Capture["status"], string> = {
  new: "bg-accent text-accent-foreground",
  reviewed: "bg-primary text-primary-foreground",
  archived: "bg-muted text-muted-foreground",
};

export function CaptureCard({ capture, linkedPropertyTitle }: { capture: Capture; linkedPropertyTitle?: string }) {
  const hasLocation = capture.lat !== null && capture.lng !== null;

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-background">
      {capture.images.length > 0 ? (
        <div className="grid grid-cols-3 gap-0.5 bg-muted">
          {capture.images.slice(0, 3).map((img) => (
            <div key={img} className="relative aspect-square">
              <Image src={img} alt="" fill sizes="200px" className="object-cover" />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex aspect-[3/1] items-center justify-center bg-muted text-xs text-muted-foreground">No photos</div>
      )}

      <div className="space-y-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-medium text-foreground">{capture.label || "Untitled capture"}</p>
            <p className="text-xs text-muted-foreground">{new Date(capture.createdAt).toLocaleString("en-IN")}</p>
          </div>
          <Badge className={statusStyles[capture.status]}>{capture.status}</Badge>
        </div>

        {capture.notes && <p className="text-sm text-muted-foreground">{capture.notes}</p>}

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {hasLocation && (
            <a
              href={`https://www.google.com/maps?q=${capture.lat},${capture.lng}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-accent hover:underline"
            >
              <MapPin className="h-3.5 w-3.5" />
              {capture.lat!.toFixed(5)}, {capture.lng!.toFixed(5)}
              {capture.locationAccuracyM ? ` (±${Math.round(capture.locationAccuracyM)}m)` : ""}
            </a>
          )}
          {capture.capturedBy && (
            <span className="flex items-center gap-1">
              <User className="h-3.5 w-3.5" /> {capture.capturedBy}
            </span>
          )}
        </div>

        {linkedPropertyTitle && capture.propertySlug && (
          <Link href={`/property/${capture.propertySlug}`} className="block text-xs text-accent hover:underline">
            Linked to: {linkedPropertyTitle}
          </Link>
        )}

        <div className="flex items-center justify-between border-t border-border pt-3">
          <form action={setCaptureStatusAction} className="flex items-center gap-2">
            <input type="hidden" name="id" value={capture.id} />
            <select
              name="status"
              defaultValue={capture.status}
              onChange={(e) => e.currentTarget.form?.requestSubmit()}
              className="rounded-md border border-input bg-background px-2 py-1 text-xs"
            >
              <option value="new">New</option>
              <option value="reviewed">Reviewed</option>
              <option value="archived">Archived</option>
            </select>
          </form>
          <div className="flex items-center gap-3">
            <Link
              href={`/admin/properties/new?captureId=${capture.id}`}
              className="text-xs font-medium text-accent hover:underline"
            >
              Use in new property
            </Link>
            <form
              action={deleteCaptureAction}
              onSubmit={(e) => {
                if (!confirm("Delete this capture? This can't be undone.")) e.preventDefault();
              }}
            >
              <input type="hidden" name="id" value={capture.id} />
              <button type="submit" className="text-xs font-medium text-destructive hover:underline">
                Delete
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
