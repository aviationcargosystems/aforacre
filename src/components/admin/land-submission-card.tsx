"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, Phone, User } from "lucide-react";
import type { LandSubmission } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { guntaToAcres } from "@/lib/land-units";
import { approveLandSubmissionAction, rejectLandSubmissionAction } from "@/app/admin/(protected)/land-submissions/actions";

const statusStyles: Record<LandSubmission["status"], string> = {
  pending: "bg-accent text-accent-foreground",
  approved: "bg-primary text-primary-foreground",
  rejected: "bg-muted text-muted-foreground",
};

export function LandSubmissionCard({ submission }: { submission: LandSubmission }) {
  const acres = submission.extentAcres ?? (submission.extentGunta ? guntaToAcres(submission.extentGunta) : null);
  const hasLocation = submission.lat !== null && submission.lng !== null;

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-background">
      {submission.images.length > 0 ? (
        <div className="grid grid-cols-3 gap-0.5 bg-muted">
          {submission.images.slice(0, 3).map((img) => (
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
            <p className="font-medium text-foreground">{submission.area || "Untitled submission"}</p>
            <p className="text-xs text-muted-foreground">{new Date(submission.createdAt).toLocaleString("en-IN")}</p>
          </div>
          <Badge className={statusStyles[submission.status]}>{submission.status}</Badge>
        </div>

        <p className="text-sm text-muted-foreground">
          {acres !== null ? `${acres.toFixed(2)} acres` : "Size not given"}
          {submission.expectedPricePerGunta ? ` · ₹${submission.expectedPricePerGunta.toLocaleString("en-IN")}/gunta` : ""}
        </p>

        {submission.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {submission.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-[10px]">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {submission.notes && <p className="text-sm text-muted-foreground">{submission.notes}</p>}

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {hasLocation && (
            <a
              href={`https://www.google.com/maps?q=${submission.lat},${submission.lng}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-accent hover:underline"
            >
              <MapPin className="h-3.5 w-3.5" />
              {submission.lat!.toFixed(5)}, {submission.lng!.toFixed(5)}
            </a>
          )}
          <span className="flex items-center gap-1">
            <User className="h-3.5 w-3.5" /> {submission.ownerName || "Unnamed"} ({submission.ownerType})
          </span>
          <a href={`tel:${submission.phone}`} className="flex items-center gap-1 text-accent hover:underline">
            <Phone className="h-3.5 w-3.5" /> {submission.phone}
          </a>
        </div>

        {submission.propertySlug && (
          <Link href={`/admin/properties/${submission.propertySlug}/edit`} className="block text-xs text-accent hover:underline">
            Linked property →
          </Link>
        )}

        {submission.status === "pending" && (
          <div className="flex items-center gap-3 border-t border-border pt-3">
            <form action={approveLandSubmissionAction}>
              <input type="hidden" name="id" value={submission.id} />
              <button type="submit" className="text-xs font-medium text-primary hover:underline">
                Approve → assign FID
              </button>
            </form>
            <form
              action={rejectLandSubmissionAction}
              onSubmit={(e) => {
                if (!confirm("Reject this submission?")) e.preventDefault();
              }}
            >
              <input type="hidden" name="id" value={submission.id} />
              <button type="submit" className="text-xs font-medium text-destructive hover:underline">
                Reject
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
