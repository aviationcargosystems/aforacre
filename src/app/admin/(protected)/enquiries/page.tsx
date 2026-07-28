import Link from "next/link";
import { getAllEnquiries } from "@/lib/store/enquiries";
import { Badge } from "@/components/ui/badge";
import { setEnquiryStatusAction } from "./actions";

export const dynamic = "force-dynamic";

const statusStyles: Record<string, string> = {
  new: "bg-accent text-accent-foreground",
  contacted: "bg-primary text-primary-foreground",
  closed: "bg-muted text-muted-foreground",
};

export default async function AdminEnquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const enquiries = await getAllEnquiries();
  const filtered = status ? enquiries.filter((e) => e.status === status) : enquiries;

  const tabs = [
    { key: undefined, label: `All (${enquiries.length})` },
    { key: "new", label: `New (${enquiries.filter((e) => e.status === "new").length})` },
    { key: "contacted", label: `Contacted (${enquiries.filter((e) => e.status === "contacted").length})` },
    { key: "closed", label: `Closed (${enquiries.filter((e) => e.status === "closed").length})` },
  ];

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-foreground">Enquiries</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Leads from property/professional pages, the match quiz, and &quot;Schedule a visit&quot;.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <Link key={tab.label} href={tab.key ? `/admin/enquiries?status=${tab.key}` : "/admin/enquiries"}>
            <Badge variant={status === tab.key ? "default" : "outline"} className="cursor-pointer px-3 py-1.5">
              {tab.label}
            </Badge>
          </Link>
        ))}
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-secondary/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Context</th>
              <th className="px-4 py-3">Property</th>
              <th className="px-4 py-3">When</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((enquiry) => (
              <tr key={enquiry.id} className="bg-background">
                <td className="px-4 py-3 font-medium text-foreground">{enquiry.name || "—"}</td>
                <td className="px-4 py-3">
                  <a href={`tel:${enquiry.phone}`} className="text-accent hover:underline">
                    {enquiry.phone}
                  </a>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{enquiry.context || "—"}</td>
                <td className="px-4 py-3">
                  {enquiry.propertySlug ? (
                    <Link href={`/property/${enquiry.propertySlug}`} className="text-accent hover:underline">
                      {enquiry.propertySlug}
                    </Link>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                  {new Date(enquiry.createdAt).toLocaleString("en-IN")}
                </td>
                <td className="px-4 py-3">
                  <form action={setEnquiryStatusAction} className="flex items-center gap-2">
                    <input type="hidden" name="id" value={enquiry.id} />
                    <select
                      name="status"
                      defaultValue={enquiry.status}
                      onChange={(e) => e.currentTarget.form?.requestSubmit()}
                      className={`rounded-md border border-input bg-background px-2 py-1 text-xs ${statusStyles[enquiry.status]}`}
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="closed">Closed</option>
                    </select>
                  </form>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  No enquiries{status ? ` with status "${status}"` : ""} yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
