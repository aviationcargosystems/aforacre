import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { requireAgent } from "@/lib/agent/require-agent";
import { getAllTags } from "@/lib/store/tags";
import { CaptureForm } from "@/components/capture-form";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Quick capture — A for Acre",
};

/**
 * Quick capture is the agent's main job, not a side errand off a recce: most
 * sites they stand in front of have no recce assigned yet. The form is the same
 * one the public capture page uses, on the "admin" variant — an agent is signed
 * in, so RTC reading and map-link resolution are unlocked, and the action reads
 * their name off the session rather than asking them to type it.
 */
export default async function AgentCapturePage() {
  await requireAgent();
  const tags = await getAllTags();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/agent"
          className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="h-3.5 w-3.5" /> Back
        </Link>
        <h1 className="mt-2 font-heading text-2xl font-semibold text-foreground">Quick capture</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Photos and a pin are enough. Everything else can follow later.
        </p>
      </div>

      <CaptureForm existingTags={tags} variant="admin" />
    </div>
  );
}
