import Link from "next/link";
import Image from "next/image";
import { ArrowRight, MapPin } from "lucide-react";
import type { Property } from "@/lib/types";
import { formatINR } from "@/lib/tax";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export function PropertyCard({ property, highlightLabel }: { property: Property; highlightLabel?: string }) {
  const metaItems = [`${property.extentAcres} acres`, ...property.tags.slice(0, 2), property.roadAccess];

  return (
    <Link href={`/property/${property.slug}`} className="group block h-full">
      <Card className="h-full overflow-hidden border-white/60 p-0 shadow-[0_8px_24px_rgba(15,23,42,0.07)] transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_14px_36px_rgba(15,23,42,0.11)]">
        <div className="relative aspect-[5/4] w-full overflow-hidden bg-muted">
          {/* A listing can exist before its photos do. Passing an undefined src
              to next/image renders a broken frame rather than nothing. */}
          {property.images[0] && (
          <Image
            src={property.images[0]}
            alt={property.title}
            fill
            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 390px"
            quality={72}
            className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          />
          )}
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,18,14,0)_0%,rgba(8,18,14,0.05)_45%,rgba(8,18,14,0.68)_100%)]" />
          <div className="absolute left-4 top-4 flex flex-wrap gap-2">
            {property.featured && (
              <Badge className="bg-white/90 text-foreground shadow-[0_10px_24px_rgba(15,23,42,0.12)]">
                Featured
              </Badge>
            )}
            {highlightLabel && <Badge className="bg-accent text-accent-foreground">{highlightLabel}</Badge>}
          </div>
          <div className="absolute bottom-4 left-4 right-4 flex flex-col gap-2 text-white sm:flex-row sm:items-end sm:justify-between sm:gap-4">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">
                South Bangalore{property.fid && ` · FID ${property.fid}`}
              </p>
              <p className="mt-1 font-heading text-lg font-semibold leading-tight sm:line-clamp-2 sm:text-xl">{property.title}</p>
            </div>
            <div className="shrink-0 self-start rounded-2xl border border-white/15 bg-white/10 px-3 py-2 backdrop-blur sm:min-w-[108px] sm:self-auto sm:text-right">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/68">Total price</p>
              <p className="mt-1 whitespace-nowrap font-heading text-lg font-semibold leading-none">
                {formatINR(property.totalPrice)}
              </p>
            </div>
          </div>
        </div>
        <CardContent className="space-y-4 p-5">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">
              {property.location.area}, {property.location.corridor}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {metaItems.map((item) => (
              <span
                key={item}
                className="rounded-full border border-border/70 bg-white/75 px-2.5 py-1 text-xs font-medium text-foreground"
              >
                {item}
              </span>
            ))}
          </div>
          <div className="flex items-center justify-between border-t border-border/70 pt-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Per acre</p>
              <p className="text-base font-semibold tracking-tight text-primary tabular-nums">{formatINR(property.pricePerAcre)}</p>
            </div>
            <span className="inline-flex items-center gap-1 text-sm font-medium text-foreground transition-transform group-hover:translate-x-0.5">
              View listing
              <ArrowRight className="h-4 w-4" />
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
