import Link from "next/link";
import { Plus } from "lucide-react";
import { getAllProperties } from "@/lib/store/properties";
import { formatINR } from "@/lib/tax";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DeletePropertyButton } from "./delete-button";

export const dynamic = "force-dynamic";

export default async function AdminPropertiesPage() {
  const properties = await getAllProperties();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground">Properties</h1>
          <p className="mt-1 text-sm text-muted-foreground">{properties.length} listings</p>
        </div>
        <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
          <Link href="/admin/properties/new">
            <Plus className="mr-1.5 h-4 w-4" /> Add property
          </Link>
        </Button>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-background">
        <table className="w-full min-w-[860px] text-sm">
          {/* Explicit widths. Left to itself the browser was giving Price barely
              more than the header word, so "Rs 89.10 L" broke across two lines
              while Title had room to spare. */}
          <colgroup>
            <col className="w-[30%]" />
            <col className="w-[22%]" />
            <col className="w-[8%]" />
            <col className="w-[12%]" />
            <col className="w-[20%]" />
            <col className="w-[8%]" />
          </colgroup>
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Corridor</th>
              <th className="whitespace-nowrap px-4 py-3 text-right">Extent</th>
              <th className="whitespace-nowrap px-4 py-3 text-right">Price</th>
              <th className="px-4 py-3">Tags</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {properties.map((p) => (
              <tr key={p.slug} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-medium text-foreground">
                  <span className="flex items-center gap-2">
                    <span className="min-w-0 truncate">{p.title}</span>
                    {p.featured && <Badge className="shrink-0">Featured</Badge>}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  <span className="block truncate">
                    {p.location.area}, {p.location.corridor}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums text-muted-foreground">
                  {p.extentAcres} ac
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right font-medium tabular-nums text-foreground">
                  {formatINR(p.totalPrice)}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  <div className="flex flex-wrap gap-1">
                    {p.tags.slice(0, 2).map((t) => (
                      <Badge key={t} variant="secondary">
                        {t}
                      </Badge>
                    ))}
                  </div>
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <div className="flex items-center justify-end gap-3">
                    <Link href={`/admin/properties/${p.slug}/edit`} className="text-sm font-medium text-accent hover:underline">
                      Edit
                    </Link>
                    <DeletePropertyButton slug={p.slug} title={p.title} />
                  </div>
                </td>
              </tr>
            ))}
            {properties.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                  No properties yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
