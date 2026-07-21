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
      <Card className="h-full overflow-hidden border-white/60 p-0 shadow-[0_20px_60px_rgba(15,23,42,0.10)] transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_28px_70px_rgba(15,23,42,0.14)]">
        <div className="relative aspect-[16/10] overflow-hidden bg-muted">
          <Image
            src={professional.image}
            alt={professional.name}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,18,14,0)_0%,rgba(8,18,14,0.58)_100%)]" />
          <Badge className="absolute left-4 top-4 bg-white/90 text-foreground shadow-[0_10px_24px_rgba(15,23,42,0.12)]">
            {professionalCategoryLabels[professional.category]}
          </Badge>
        </div>
        <CardContent className="flex flex-col gap-4 p-5">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <h3 className="truncate font-heading text-xl font-semibold text-foreground">{professional.name}</h3>
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-foreground">
                <Star className="h-3.5 w-3.5 fill-accent text-accent" />
                {professional.rating}
                <span className="font-normal text-muted-foreground">({professional.reviewCount})</span>
              </span>
            </div>
            <p className="line-clamp-2 min-h-10 text-sm leading-5 text-muted-foreground">{professional.tagline}</p>
          </div>

          <div className="flex h-7 items-center gap-1.5 overflow-hidden">
            {professional.serviceAreas.slice(0, 2).map((area) => (
              <span
                key={area}
                className="shrink-0 rounded-full border border-border/70 bg-white/75 px-2.5 py-1 text-xs font-medium text-foreground"
              >
                {area}
              </span>
            ))}
            {professional.serviceAreas.length > 2 && (
              <span className="shrink-0 rounded-full border border-border/70 bg-white/75 px-2.5 py-1 text-xs font-medium text-muted-foreground">
                +{professional.serviceAreas.length - 2} more
              </span>
            )}
          </div>

          <div className="mt-auto flex items-center justify-between border-t border-border/70 pt-4 text-sm">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              <span>South Bangalore</span>
            </div>
            <span className="font-medium text-foreground transition-transform group-hover:translate-x-0.5">
              View profile
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
