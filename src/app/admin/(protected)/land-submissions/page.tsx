import Link from "next/link";
import { getAllLandSubmissions } from "@/lib/store/land-submissions";
import { LandSubmissionCard } from "@/components/admin/land-submission-card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function AdminLandSubmissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const submissions = await getAllLandSubmissions();
  const filtered = status ? submissions.filter((s) => s.status === status) : submissions;

  const tabs = [
    { key: undefined, label: `All (${submissions.length})` },
    { key: "pending", label: `Pending (${submissions.filter((s) => s.status === "pending").length})` },
    { key: "approved", label: `Approved (${submissions.filter((s) => s.status === "approved").length})` },
    { key: "rejected", label: `Rejected (${submissions.filter((s) => s.status === "rejected").length})` },
  ];

  return (
    <div>
      <div>
        <h1 className="font-heading text-2xl font-semibold text-foreground">Land submissions</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Owner/broker/reseller listings from{" "}
          <Link href="/submit-land" className="text-accent hover:underline">
            /submit-land
          </Link>
          . Approving assigns a FID and creates a draft property for you to finish editing.
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <Link key={tab.label} href={tab.key ? `/admin/land-submissions?status=${tab.key}` : "/admin/land-submissions"}>
            <Badge variant={status === tab.key ? "default" : "outline"} className="cursor-pointer px-3 py-1.5">
              {tab.label}
            </Badge>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((submission) => (
          <LandSubmissionCard key={submission.id} submission={submission} />
        ))}
        {filtered.length === 0 && (
          <p className="text-muted-foreground">No submissions{status ? ` with status "${status}"` : ""} yet.</p>
        )}
      </div>
    </div>
  );
}
