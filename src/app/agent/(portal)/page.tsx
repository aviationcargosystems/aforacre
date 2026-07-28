import Link from "next/link";
import { CalendarClock, ChevronRight, MapPin } from "lucide-react";
import type { Recce, RecceStatus } from "@/lib/types";
import { requireAgent } from "@/lib/agent/require-agent";
import { getReccesForAgent } from "@/lib/store/recces";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "My Recces — A for Acre",
};

const TYPE_LABELS: Record<Recce["type"], string> = {
  scout: "Scout new land",
  pre_visit: "Pre-visit check",
  client_visit: "Client visit",
};

const STATUS_STYLES: Record<RecceStatus, string> = {
  assigned: "bg-accent text-accent-foreground",
  in_progress: "bg-accent/80 text-accent-foreground",
  submitted: "bg-primary text-primary-foreground",
  approved: "bg-primary text-primary-foreground",
  rejected: "bg-destructive/15 text-destructive",
};

function RecceRow({ recce }: { recce: Recce }) {
  const open = recce.status === "assigned" || recce.status === "in_progress";

  return (
    <Link
      href={`/agent/recce/${recce.id}`}
      className="flex items-center gap-3 rounded-2xl border border-border bg-background p-4 transition-colors hover:bg-secondary/40"
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
            {TYPE_LABELS[recce.type]}
          </span>
          <Badge className={STATUS_STYLES[recce.status]}>{recce.status.replace("_", " ")}</Badge>
        </div>
        <p className="mt-1 truncate font-medium text-foreground">{recce.area || "Location to confirm"}</p>
        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
          {recce.lat !== null && recce.lng !== null && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {recce.lat.toFixed(4)}, {recce.lng.toFixed(4)}
            </span>
          )}
          {recce.scheduledFor && (
            <span className="flex items-center gap-1">
              <CalendarClock className="h-3 w-3" />
              {new Date(recce.scheduledFor).toLocaleString("en-IN", {
                day: "numeric",
                month: "short",
                hour: "numeric",
                minute: "2-digit",
              })}
            </span>
          )}
        </div>
      </div>
      {open && <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />}
    </Link>
  );
}

export default async function AgentHomePage() {
  const agent = await requireAgent();
  const recces = await getReccesForAgent(agent.id);

  const open = recces.filter((r) => r.status === "assigned" || r.status === "in_progress");
  const done = recces.filter((r) => r.status !== "assigned" && r.status !== "in_progress");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-foreground">My recces</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {open.length > 0
            ? `${open.length} waiting on you.`
            : "Nothing assigned right now — the office will send work here."}
        </p>
      </div>

      {open.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">To do</h2>
          {open.map((recce) => (
            <RecceRow key={recce.id} recce={recce} />
          ))}
        </section>
      )}

      {done.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Submitted</h2>
          {done.map((recce) => (
            <RecceRow key={recce.id} recce={recce} />
          ))}
        </section>
      )}

      {recces.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border bg-background p-10 text-center text-sm text-muted-foreground">
          No recces assigned to you yet.
        </div>
      )}
    </div>
  );
}
