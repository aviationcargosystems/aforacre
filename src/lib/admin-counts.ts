import { getAllCaptures } from "@/lib/store/captures";
import { getAllEnquiries } from "@/lib/store/enquiries";
import { getAllLandSubmissions } from "@/lib/store/land-submissions";
import { getAllRecces } from "@/lib/store/recces";

/**
 * Counts of work actually waiting on an admin, keyed by the route that clears it.
 * The sidebar badges and the dashboard's "Needs attention" band read the same
 * numbers, so they can never disagree.
 */
export type AdminAttentionCounts = Record<string, number>;

export async function getAdminAttentionCounts(): Promise<AdminAttentionCounts> {
  const [recces, landSubmissions, enquiries, captures] = await Promise.all([
    getAllRecces(),
    getAllLandSubmissions(),
    getAllEnquiries(),
    getAllCaptures(),
  ]);

  return {
    "/admin/recces": recces.filter((r) => r.status === "submitted").length,
    "/admin/land-submissions": landSubmissions.filter((s) => s.status === "pending").length,
    "/admin/enquiries": enquiries.filter((e) => e.status === "new").length,
    "/admin/captures": captures.filter((c) => c.status === "new").length,
  };
}
