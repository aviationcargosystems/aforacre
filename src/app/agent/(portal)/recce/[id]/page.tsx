import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarClock, CheckCircle2, MapPin, Navigation } from "lucide-react";
import type { Recce } from "@/lib/types";
import { requireAgent } from "@/lib/agent/require-agent";
import { getRecceForAgent } from "@/lib/store/recces";
import { Badge } from "@/components/ui/badge";
import { RecceForm } from "@/components/agent/recce-form";

export const dynamic = "force-dynamic";

const TYPE_LABELS: Record<Recce["type"], string> = {
  scout: "Scout new land",
  pre_visit: "Pre-visit check",
  client_visit: "Client visit",
};

const TYPE_BRIEFS: Record<Recce["type"], string> = {
  scout: "Survey this land and send back what you see. It isn't listed yet.",
  pre_visit: "Check this plot before a client sees it — confirm access and condition.",
  client_visit: "You're the on-site point of contact for this visit. The office handles the client directly.",
};

export default async function AgentReccePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const agent = await requireAgent();

  // Scoped to this agent in the query — another agent's recce is a 404 here,
  // not a permission error, so ids can't be probed for existence.
  const recce = await getRecceForAgent(id, agent.id);
  if (!recce) notFound();

  const canSubmit = recce.status === "assigned" || recce.status === "in_progress";
  const hasTarget = recce.lat !== null && recce.lng !== null;

  return (
    <div className="space-y-6">
      <Link
        href="/agent"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> My recces
      </Link>

      <div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
            {TYPE_LABELS[recce.type]}
          </span>
          <Badge variant="outline">{recce.status.replace("_", " ")}</Badge>
        </div>
        <h1 className="mt-2 font-heading text-2xl font-semibold text-foreground">
          {recce.area || "Location to confirm"}
        </h1>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">{TYPE_BRIEFS[recce.type]}</p>
      </div>

      <div className="space-y-3 rounded-2xl border border-border bg-background p-4">
        {recce.scheduledFor && (
          <p className="flex items-center gap-2 text-sm text-foreground">
            <CalendarClock className="h-4 w-4 shrink-0 text-primary" />
            {new Date(recce.scheduledFor).toLocaleString("en-IN", {
              weekday: "short",
              day: "numeric",
              month: "short",
              hour: "numeric",
              minute: "2-digit",
            })}
          </p>
        )}
        {hasTarget && (
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${recce.lat},${recce.lng}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 text-sm font-medium text-accent hover:underline"
          >
            <Navigation className="h-4 w-4 shrink-0" />
            Navigate to {recce.lat!.toFixed(5)}, {recce.lng!.toFixed(5)}
          </a>
        )}
        {!hasTarget && (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 shrink-0" /> No pin set — find it from the area name.
          </p>
        )}
        {recce.instructions && (
          <div className="border-t border-border pt-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">From the office</p>
            <p className="mt-1 text-sm leading-6 text-foreground">{recce.instructions}</p>
          </div>
        )}
      </div>

      {canSubmit ? (
        <RecceForm recceId={recce.id} />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2 rounded-2xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            {recce.status === "rejected"
              ? "The office asked for another look at this one."
              : "You've already submitted this recce."}
          </div>

          {recce.reviewNote && (
            <div className="rounded-2xl border border-border bg-background p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Office note</p>
              <p className="mt-1 text-sm leading-6 text-foreground">{recce.reviewNote}</p>
            </div>
          )}

          {recce.notes && (
            <div className="rounded-2xl border border-border bg-background p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">What you sent</p>
              <p className="mt-1 text-sm leading-6 text-foreground">{recce.notes}</p>
            </div>
          )}

          {recce.images.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {recce.images.map((image) => (
                <div key={image} className="relative aspect-square overflow-hidden rounded-xl bg-muted">
                  <Image src={image} alt="" fill sizes="120px" className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
