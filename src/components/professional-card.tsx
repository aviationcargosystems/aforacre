import Link from "next/link";
import Image from "next/image";
import { MapPin, Star } from "lucide-react";
import type { Professional } from "@/lib/types";
import { professionalCategoryLabels } from "@/data/professionals";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function ProfessionalCard({ professional }: { professional: Professional }) {
  return (
    <Link href={`/professionals/${professional.slug}`} className="group block h-full">
      <Card className="h-full transition-shadow hover:shadow-lg">
        <CardContent className="flex h-full flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-muted">
              <Image src={professional.image} alt={professional.name} fill sizes="56px" className="object-cover" />
            </div>
            <div className="min-w-0">
              <h3 className="truncate font-heading text-base font-semibold text-foreground">{professional.name}</h3>
              <Badge variant="secondary" className="mt-1">
                {professionalCategoryLabels[professional.category]}
              </Badge>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">{professional.tagline}</p>

          <div className="mt-auto flex items-center justify-between pt-2 text-sm">
            <div className="flex items-center gap-1 text-foreground">
              <Star className="h-4 w-4 fill-accent text-accent" />
              <span className="font-medium">{professional.rating}</span>
              <span className="text-muted-foreground">({professional.reviewCount})</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              <span>{professional.serviceAreas[0]}+{professional.serviceAreas.length - 1}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
