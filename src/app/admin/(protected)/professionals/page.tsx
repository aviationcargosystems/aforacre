import Link from "next/link";
import Image from "next/image";
import { Plus, Star } from "lucide-react";
import { getAllProfessionals } from "@/lib/store/professionals";
import { professionalCategoryLabels } from "@/data/professionals";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DeleteProfessionalButton } from "./delete-button";

export const dynamic = "force-dynamic";

export default async function AdminProfessionalsPage() {
  const professionals = await getAllProfessionals();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground">Professionals</h1>
          <p className="mt-1 text-sm text-muted-foreground">{professionals.length} profiles</p>
        </div>
        <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
          <Link href="/admin/professionals/new">
            <Plus className="mr-1.5 h-4 w-4" /> Add professional
          </Link>
        </Button>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {professionals.map((p) => (
          <div key={p.slug} className="rounded-xl border border-border bg-background p-4">
            <div className="flex items-center gap-3">
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-muted">
                <Image src={p.image} alt={p.name} fill sizes="48px" className="object-cover" />
              </div>
              <div className="min-w-0">
                <p className="truncate font-medium text-foreground">{p.name}</p>
                <Badge variant="secondary" className="mt-0.5">
                  {professionalCategoryLabels[p.category]}
                </Badge>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
              <Star className="h-3.5 w-3.5 fill-accent text-accent" /> {p.rating} ({p.reviewCount})
            </div>
            <div className="mt-3 flex items-center gap-3 border-t border-border pt-3">
              <Link href={`/admin/professionals/${p.slug}/edit`} className="text-sm font-medium text-accent hover:underline">
                Edit
              </Link>
              <DeleteProfessionalButton slug={p.slug} name={p.name} />
            </div>
          </div>
        ))}
        {professionals.length === 0 && <p className="text-muted-foreground">No professionals yet.</p>}
      </div>
    </div>
  );
}
