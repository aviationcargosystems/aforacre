import { anchorDistancesFor, type AnchorCertainty } from "@/lib/anchors";

/**
 * How close this plot sits to the three committed public projects.
 *
 * Distances are computed from the plot's own coordinates, and anything beyond
 * MAX_RELEVANT_ANCHOR_KM is dropped rather than shown as a weak number: a 60km
 * figure invites the reader to treat a coincidence as a reason to buy.
 *
 * There is deliberately no appreciation percentage here. Public rate data for
 * this belt is not reliable enough to defend.
 * TODO: Kaveri guidance values are the future source if that changes.
 */

const CHIP_STYLE: Record<AnchorCertainty, string> = {
  under_construction: "bg-primary text-primary-foreground",
  cabinet_approved: "bg-primary/12 text-primary",
  under_evaluation: "border border-muted-foreground/35 text-muted-foreground",
};

export function GrowthAnchors({ lat, lng }: { lat: number | null; lng: number | null }) {
  const distances = anchorDistancesFor({ lat, lng });
  if (distances.length === 0) return null;

  return (
    <section className="border-t border-border/70 pt-8">
      <h3 className="font-heading text-base font-semibold text-foreground">Growth anchors</h3>
      <p className="mt-1 text-xs text-muted-foreground">Straight-line distance from this plot.</p>

      <ul className="mt-4 space-y-3">
        {distances.map(({ anchor, km }) => (
          <li key={anchor.id} className="border-b border-border/50 pb-3 last:border-0 last:pb-0">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium leading-snug text-foreground">{anchor.title}</p>
                <span
                  className={`mt-1.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-[0.12em] ${CHIP_STYLE[anchor.certainty]}`}
                >
                  {anchor.chipLabel}
                </span>
              </div>
              <span className="shrink-0 text-sm font-semibold tabular-nums text-foreground">{km.toFixed(1)} km</span>
            </div>
            {/* Rendered whenever the anchor carries one. The airport row must
                never appear without its clause. */}
            {anchor.disclaimer && (
              <p className="mt-1.5 text-[11px] text-muted-foreground">{anchor.disclaimer}</p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
