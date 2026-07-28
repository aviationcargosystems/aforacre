import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";
import type { PlotMatch } from "@/lib/match";
import { formatINR } from "@/lib/tax";

/** One recommendation. FID is always visible, per the public identifier rule. */
export function MatchCard({ match }: { match: PlotMatch }) {
  const { plot, score, reasons } = match;
  const image = plot.images[0];

  return (
    <Link
      href={`/property/${plot.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-border/70 bg-white/85 shadow-[0_18px_50px_rgba(15,23,42,0.06)] transition-shadow hover:shadow-[0_22px_60px_rgba(15,23,42,0.10)]"
    >
      <div className="relative aspect-[4/3] bg-muted">
        {image && (
          <Image
            src={image}
            alt={plot.title}
            fill
            sizes="(max-width: 640px) 100vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        )}
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold tracking-[0.08em] text-foreground backdrop-blur">
          {plot.fid}
        </span>
        <span className="absolute right-3 top-3 rounded-full bg-accent px-3 py-1 text-[11px] font-semibold text-accent-foreground">
          {score}% match
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-heading text-lg font-semibold leading-snug text-foreground">{plot.title}</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          {[plot.village, plot.corridor].filter(Boolean).join(", ")}
        </p>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="font-heading text-xl font-semibold text-foreground">{formatINR(plot.priceTotal)}</span>
          <span className="text-xs text-muted-foreground">{plot.areaAcres} acres</span>
        </div>

        <ul className="mt-4 space-y-1.5 border-t border-border/60 pt-4">
          {reasons.map((reason) => (
            <li key={reason.label} className="flex items-start gap-2 text-xs leading-5 text-muted-foreground">
              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
              <span className="line-clamp-2">{reason.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </Link>
  );
}
