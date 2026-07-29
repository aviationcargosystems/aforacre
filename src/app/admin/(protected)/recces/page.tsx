import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";
import type { RecceStatus } from "@/lib/types";
import { getAllRecces } from "@/lib/store/recces";
import { getStaff } from "@/lib/store/staff";
import { getAllProperties } from "@/lib/store/properties";
import { Badge } from "@/components/ui/badge";
import { RecceAssignForm } from "@/components/admin/recce-assign-form";
import { assignRecceAction, reviewRecceAction } from "./actions";

export const dynamic = "force-dynamic";

const STATUS_STYLES: Record<RecceStatus, string> = {
  assigned: "bg-accent text-accent-foreground",
  in_progress: "bg-accent/80 text-accent-foreground",
  submitted: "bg-primary text-primary-foreground",
  approved: "bg-primary text-primary-foreground",
  rejected: "bg-muted text-muted-foreground",
};

const TYPE_LABELS: Record<string, string> = {
  scout: "Scout",
  pre_visit: "Pre-visit",
  client_visit: "Client visit",
};

export default async function AdminReccesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; error?: string; assigned?: string }>;
}) {
  const { status, error, assigned } = await searchParams;
  const [recces, staff, properties] = await Promise.all([
    getAllRecces(),
    getStaff(),
    getAllProperties(),
  ]);
  // Anyone with the agent role can be sent on a recce. Super admins are
  // excluded from the assign list: they review, they do not get assigned.
  const agents = staff
    .filter((person) => person.role === "agent")
    .map((person) => ({
      id: person.id,
      name: person.fullName || person.email || person.mobile,
      active: !person.disabled,
    }));

  const agentNameById = new Map(agents.map((a) => [a.id, a.name]));
  const activeAgents = agents.filter((a) => a.active);
  const filtered = status ? recces.filter((r) => r.status === status) : recces;

  const tabs = [
    { key: undefined, label: `All (${recces.length})` },
    { key: "assigned", label: `Assigned (${recces.filter((r) => r.status === "assigned").length})` },
    { key: "submitted", label: `Submitted (${recces.filter((r) => r.status === "submitted").length})` },
    { key: "approved", label: `Approved (${recces.filter((r) => r.status === "approved").length})` },
  ];

  return (
    <div>
      <div>
        <h1 className="font-heading text-2xl font-semibold text-foreground">Recces</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Assign site surveys to agents and review what comes back from the field.
        </p>
      </div>

      {error === "agent" && (
        <p className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
          Pick an agent to assign this recce to.
        </p>
      )}
      {assigned && (
        <p className="mt-4 rounded-md border border-primary/30 bg-primary/10 px-4 py-2.5 text-sm text-primary">
          Recce assigned — it&apos;s now on that agent&apos;s phone.
        </p>
      )}

      {activeAgents.length === 0 ? (
        <p className="mt-6 rounded-xl border border-dashed border-border bg-background p-6 text-sm text-muted-foreground">
          No active agents yet —{" "}
          <Link href="/admin/agents" className="text-accent hover:underline">
            add one under Staff
          </Link>
          .
        </p>
      ) : (
        <RecceAssignForm
          action={assignRecceAction}
          agents={activeAgents.map((agent) => ({ id: agent.id, name: agent.name }))}
          properties={properties.map((property) => ({
            slug: property.slug,
            title: property.title,
            area: property.location.area,
            lat: property.location.lat,
            lng: property.location.lng,
          }))}
        />
      )}

      <div className="mt-8 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <Link key={tab.label} href={tab.key ? `/admin/recces?status=${tab.key}` : "/admin/recces"}>
            <Badge variant={status === tab.key ? "default" : "outline"} className="cursor-pointer px-3 py-1.5">
              {tab.label}
            </Badge>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {filtered.map((recce) => (
          <div key={recce.id} className="overflow-hidden rounded-xl border border-border bg-background">
            {recce.images.length > 0 && (
              <div className="grid grid-cols-3 gap-0.5 bg-muted">
                {recce.images.slice(0, 3).map((image) => (
                  <div key={image} className="relative aspect-square">
                    <Image src={image} alt="" fill sizes="200px" className="object-cover" />
                  </div>
                ))}
              </div>
            )}
            <div className="space-y-2 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
                    {TYPE_LABELS[recce.type] ?? recce.type}
                  </p>
                  <p className="truncate font-medium text-foreground">{recce.area || "Location to confirm"}</p>
                </div>
                <Badge className={STATUS_STYLES[recce.status]}>{recce.status.replace("_", " ")}</Badge>
              </div>

              <p className="text-xs text-muted-foreground">
                {recce.agentId ? agentNameById.get(recce.agentId) ?? "Unknown agent" : "Unassigned"} ·{" "}
                {new Date(recce.createdAt).toLocaleDateString("en-IN")}
              </p>

              {recce.instructions && <p className="text-sm text-muted-foreground">{recce.instructions}</p>}
              {recce.notes && (
                <div className="rounded-lg bg-secondary/50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    Agent&apos;s report
                  </p>
                  <p className="mt-1 text-sm text-foreground">{recce.notes}</p>
                </div>
              )}

              {recce.submittedLat !== null && recce.submittedLng !== null && (
                <a
                  href={`https://www.google.com/maps?q=${recce.submittedLat},${recce.submittedLng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-xs font-medium text-accent hover:underline"
                >
                  <MapPin className="h-3.5 w-3.5" />
                  Submitted from {recce.submittedLat.toFixed(5)}, {recce.submittedLng.toFixed(5)}
                </a>
              )}

              {recce.status === "submitted" && (
                <form action={reviewRecceAction} className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
                  <input type="hidden" name="id" value={recce.id} />
                  <input
                    name="reviewNote"
                    placeholder="Note back to the agent (optional)"
                    className="min-w-0 flex-1 rounded-md border border-input bg-background px-2 py-1 text-xs"
                  />
                  <button
                    type="submit"
                    name="status"
                    value="approved"
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    Approve
                  </button>
                  <button
                    type="submit"
                    name="status"
                    value="rejected"
                    className="text-xs font-medium text-destructive hover:underline"
                  >
                    Send back
                  </button>
                </form>
              )}

              {recce.status === "approved" && recce.type === "scout" && (
                <Link
                  href="/admin/properties/new"
                  className="block border-t border-border pt-3 text-xs font-medium text-accent hover:underline"
                >
                  Create a listing from this →
                </Link>
              )}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-muted-foreground">No recces{status ? ` with status "${status}"` : ""} yet.</p>
        )}
      </div>
    </div>
  );
}
