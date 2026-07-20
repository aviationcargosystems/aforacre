import Link from "next/link";
import Image from "next/image";
import { MapPin } from "lucide-react";
import type { Property } from "@/lib/types";
import { formatINR } from "@/lib/tax";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export function PropertyCard({ property, highlightJourney }: { property: Property; highlightJourney?: string }) {
  const metaItems = [`${property.extentAcres} Acres`, ...property.tags.slice(0, 2), property.roadAccess];

  return (
    <Link href={`/property/${property.slug}`} className="group block">
      <Card className="overflow-hidden py-0 gap-0 transition-shadow hover:shadow-lg">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
          <Image
            src={property.images[0]}
            alt={property.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {property.featured && (
            <Badge className="absolute left-3 top-3 bg-primary text-primary-foreground uppercase tracking-wide">
              Featured
            </Badge>
          )}
          {highlightJourney && (
            <div className="absolute bottom-3 right-3 rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-accent-foreground">
              {highlightJourney}
            </div>
          )}
        </div>
        <CardContent className="space-y-1.5 p-4">
          <h3 className="font-heading text-lg font-semibold leading-tight text-foreground">{property.title}</h3>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">
              {property.location.area}, {property.location.corridor}
            </span>
          </div>
          <p className="truncate text-xs text-muted-foreground">{metaItems.join(" · ")}</p>
          <div className="flex items-baseline justify-between pt-1.5">
            <span className="font-heading text-xl font-bold text-primary">{formatINR(property.totalPrice)}</span>
            <span className="text-xs text-muted-foreground">{formatINR(property.pricePerAcre)}/acre</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
