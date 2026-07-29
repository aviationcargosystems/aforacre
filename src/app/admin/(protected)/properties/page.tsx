import Link from "next/link";
import { Plus } from "lucide-react";
import { getAllProperties } from "@/lib/store/properties";
import { Button } from "@/components/ui/button";
import { PropertyCatalogue } from "./property-catalogue";

export const dynamic = "force-dynamic";

export default async function AdminPropertiesPage() {
  const properties = await getAllProperties();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Catalogue</p>
          <h1 className="mt-1 font-heading text-3xl font-semibold text-foreground">Properties</h1>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            Review pricing, verification, media and listing readiness across the complete land portfolio.
          </p>
        </div>
        <Button asChild variant="pill" size="sm">
          <Link href="/admin/properties/new">
            <Plus className="h-4 w-4" /> Add a property
          </Link>
        </Button>
      </div>

      <PropertyCatalogue properties={properties} />
    </div>
  );
}
