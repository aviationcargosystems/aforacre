import { acresToGunta } from "@/lib/land-units";

/**
 * A readable, near-unique label for a plot, built from what has been entered.
 *
 * The parts are ordered by how well they distinguish one plot from the next:
 * size first because it is the thing that always differs, then the place, then
 * whatever single feature makes this plot not the one next door. Two plots in
 * the same village at the same size are genuinely hard to tell apart, so the
 * caller passes the labels already in use and gets a suffix rather than a
 * duplicate.
 *
 * Extent is rendered in acres above a quarter acre and in guntas below it,
 * because "0.1 acres" is how nobody in this belt describes four guntas.
 */

export interface SiteLabelParts {
  extentAcres?: number;
  /** Village or area name. */
  area?: string;
  /** Landmarks as "Name — distance"; the nearest is used. */
  nearbyLandmarks?: string[];
  tags?: string[];
}

/** Tags that describe a place rather than a transaction, so they read in a title. */
const FEATURE_TAGS = [
  "Lake View",
  "Scenic Views",
  "Mango Grove",
  "Hill View",
  "Riverside",
  "Gated Farm Community",
  "Open Farmland",
  "Farmhouse Ready",
  "Ready for Polyhouse",
  "Borewell",
];

function formatExtent(acres: number): string {
  if (!Number.isFinite(acres) || acres <= 0) return "";
  if (acres < 0.25) {
    const guntas = Math.round(acresToGunta(acres) * 10) / 10;
    return `${guntas} gunta${guntas === 1 ? "" : "s"}`;
  }
  return `${Number(acres.toFixed(2))} acre${acres === 1 ? "" : "s"}`;
}

/** "Uyyamballi Lake — 1.5km" is the stored shape; only the name belongs in a title. */
function landmarkName(entry: string): string {
  return entry.split(/[—–-]/)[0].trim();
}

export function buildSiteLabel(parts: SiteLabelParts, taken: string[] = []): string {
  const extent = formatExtent(parts.extentAcres ?? 0);
  const area = (parts.area ?? "").trim();

  // One distinguishing feature, not a list — a title with three of them stops
  // being a title. A named landmark beats a tag, since it is specific to the
  // spot rather than to the category of land.
  const landmark = parts.nearbyLandmarks?.length ? landmarkName(parts.nearbyLandmarks[0]) : "";
  const featureTag = (parts.tags ?? []).find((tag) => FEATURE_TAGS.includes(tag)) ?? "";

  const head = [extent, area && `in ${area}`].filter(Boolean).join(" ");
  const qualifier = landmark ? `near ${landmark}` : featureTag;
  const base = [head, qualifier].filter(Boolean).join(", ");

  if (!base) return "";

  // Same size, same village, no distinguishing feature: number them rather than
  // hand back a label that already belongs to something else.
  if (!taken.includes(base)) return base;
  let n = 2;
  while (taken.includes(`${base} (${n})`)) n += 1;
  return `${base} (${n})`;
}
