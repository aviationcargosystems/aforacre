import Link from "next/link";
import { Plus } from "lucide-react";
import { getAllCaptures } from "@/lib/store/captures";
import { getAllProperties } from "@/lib/store/properties";
import { CaptureCard } from "@/components/admin/capture-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function AdminCapturesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const [captures, properties] = await Promise.all([getAllCaptures(), getAllProperties()]);
  const filtered = status ? captures.filter((c) => c.status === status) : captures;
  const propertyTitleBySlug = new Map(properties.map((p) => [p.slug, p.title]));

  const tabs = [
    { key: undefined, label: `All (${captures.length})` },
    { key: "new", label: `New (${captures.filter((c) => c.status === "new").length})` },
    { key: "reviewed", label: `Reviewed (${captures.filter((c) => c.status === "reviewed").length})` },
    { key: "archived", label: `Archived (${captures.filter((c) => c.status === "archived").length})` },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground">Field captures</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Photos and locations from site visits — captured here or from{" "}
            <Link href="/capture" className="text-accent hover:underline">
              /capture
            </Link>
            .
          </p>
        </div>
        <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
          <Link href="/admin/captures/new">
            <Plus className="mr-1.5 h-4 w-4" /> Quick capture
          </Link>
        </Button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <Link key={tab.label} href={tab.key ? `/admin/captures?status=${tab.key}` : "/admin/captures"}>
            <Badge variant={status === tab.key ? "default" : "outline"} className="cursor-pointer px-3 py-1.5">
              {tab.label}
            </Badge>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((capture) => (
          <CaptureCard key={capture.id} capture={capture} linkedPropertyTitle={capture.propertySlug ? propertyTitleBySlug.get(capture.propertySlug) : undefined} />
        ))}
        {filtered.length === 0 && <p className="text-muted-foreground">No captures{status ? ` with status "${status}"` : ""} yet.</p>}
      </div>
    </div>
  );
}
