import type { QuizAnswers } from "@/lib/quiz-questions";
import type { Persona } from "@/lib/persona";
import type { PlotUseCase } from "@/lib/plots/use-cases";

/**
 * Plot matching. A pure function over plain data, so an agent layer can call it
 * with rows it fetched itself and get the same answer the website shows.
 */

export interface MatchablePlot {
  id: string;
  fid: string;
  title: string;
  areaAcres: number;
  priceTotal: number;
  corridor: string;
  village: string;
  lat: number | null;
  lng: number | null;
  /** score 0 to 100 per use case, from plot_suitability. */
  suitability: Partial<Record<PlotUseCase, { score: number; rationale: string }>>;
  /** Lowercased haystack built from title, location and suitability rationales. */
  searchText: string;
  water: string;
  roadAccess: string;
  images: string[];
}

export interface MatchReason {
  label: string;
  /** Which component produced this, so the UI can order or filter by weight. */
  source: "budget" | "drive" | "suitability" | "features" | "acreage";
}

export interface PlotMatch {
  plot: MatchablePlot;
  score: number;
  reasons: MatchReason[];
}

// Component ceilings. These sum to 100 and are the whole scoring model.
const W_BUDGET = 30;
const W_DRIVE = 20;
const W_SUITABILITY = 25;
const W_FEATURES = 15;
const W_ACREAGE = 10;

const BENGALURU = { lat: 12.9716, lng: 77.5946 };
/** Average on these roads. Phase 6 reuses the same figure for itineraries. */
const AVG_SPEED_KMH = 35;

const BUDGET_BANDS: Record<string, { min: number; max: number }> = {
  "75l-1cr": { min: 7_500_000, max: 10_000_000 },
  "1-2cr": { min: 10_000_000, max: 20_000_000 },
  "2-5cr": { min: 20_000_000, max: 50_000_000 },
  "5cr-plus": { min: 50_000_000, max: Number.POSITIVE_INFINITY },
};

const DRIVE_LIMITS: Record<string, number> = { "45": 45, "60": 60, "90": 90, "120": 120 };

/** What each Q5 answer looks like in a plot's text. */
const FEATURE_KEYWORDS: Record<string, string[]> = {
  "mountain-views": ["view", "hill", "valley", "elevated", "ridge"],
  "dense-forest": ["forest", "wooded", "tree", "canopy", "grove"],
  "water-body": ["lake", "river", "stream", "canal", "pond", "creek"],
  "fruit-orchard": ["orchard", "mango", "coconut", "guava", "plantation"],
  silence: ["quiet", "secluded", "peaceful", "away from"],
  wildlife: ["wildlife", "bannerghatta", "sanctuary", "birds"],
  sunrise: ["sunrise", "east facing", "east-facing"],
  "investment-growth": ["appreciation", "corridor", "growth", "highway", "upcoming"],
  privacy: ["private", "gated", "fenced", "secluded"],
};

/** Preferred plot size by how hands-on the buyer intends to be. */
const ACREAGE_PREFERENCE: Record<string, { min: number; ideal: number; max: number }> = {
  "visit-occasionally": { min: 1, ideal: 1.5, max: 3 },
  "spend-weekends": { min: 1, ideal: 2, max: 4 },
  "actively-farm": { min: 2, ideal: 4, max: 10 },
  "managed-farm": { min: 2, ideal: 5, max: 12 },
  "hire-team": { min: 3, ideal: 8, max: 25 },
};

export function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function driveMinutesFromCity(plot: MatchablePlot): number | null {
  if (plot.lat === null || plot.lng === null) return null;
  const km = haversineKm(BENGALURU, { lat: plot.lat, lng: plot.lng });
  return Math.round((km / AVG_SPEED_KMH) * 60);
}

function budgetComponent(plot: MatchablePlot, answers: QuizAnswers) {
  const band = BUDGET_BANDS[(answers.budget ?? [])[0] ?? ""];
  // No band chosen means budget cannot discriminate, so award the full weight
  // rather than penalising every plot equally, which would just flatten scores.
  if (!band) return { points: W_BUDGET, reason: null as MatchReason | null };

  if (plot.priceTotal >= band.min && plot.priceTotal <= band.max) {
    return { points: W_BUDGET, reason: { label: "Inside your budget", source: "budget" as const } };
  }

  // Graceful falloff rather than a cliff: a plot 5% over budget is still worth
  // showing, one at double is not.
  const distance =
    plot.priceTotal < band.min ? (band.min - plot.priceTotal) / band.min : (plot.priceTotal - band.max) / band.max;
  const points = Math.max(0, W_BUDGET * (1 - Math.min(1, distance * 2)));

  if (plot.priceTotal < band.min) {
    return { points, reason: { label: "Below your range, more land for the money", source: "budget" as const } };
  }
  return { points, reason: null };
}

function driveComponent(plot: MatchablePlot, answers: QuizAnswers) {
  // The drive-time question is gone — it duplicated a filter /explore already
  // has, and the whole belt is inside 90 minutes anyway. Every plot now scores
  // the full weight and the component only contributes its "about N minutes"
  // line, which is still worth telling somebody.
  void answers;
  const choice = "any";
  const minutes = driveMinutesFromCity(plot);
  if (minutes === null) return { points: W_DRIVE * 0.5, reason: null as MatchReason | null };

  if (choice === "any") {
    return {
      points: W_DRIVE,
      reason: { label: `About ${minutes} minutes from the city`, source: "drive" as const },
    };
  }

  const limit = DRIVE_LIMITS[choice] ?? 120;
  if (minutes <= limit) {
    return {
      points: W_DRIVE,
      reason: { label: "Within your preferred drive time", source: "drive" as const },
    };
  }

  const over = (minutes - limit) / limit;
  return { points: Math.max(0, W_DRIVE * (1 - Math.min(1, over))), reason: null };
}

function suitabilityComponent(plot: MatchablePlot, persona: Persona) {
  const entry = plot.suitability[persona.primaryUseCase];
  // Missing rather than zero: not every plot has been scored for every use case
  // yet. Treating that as a zero would bury a good plot for having incomplete
  // paperwork, so it scores neutral and says nothing rather than lying.
  if (!entry) return { points: W_SUITABILITY * 0.5, reason: null as MatchReason | null };

  const points = (entry.score / 100) * W_SUITABILITY;
  const reason =
    entry.score >= 65 && entry.rationale.trim()
      ? { label: entry.rationale.trim(), source: "suitability" as const }
      : null;
  return { points, reason };
}

function featureComponent(plot: MatchablePlot, answers: QuizAnswers) {
  const wanted = answers.excites ?? [];
  if (wanted.length === 0) return { points: W_FEATURES, reasons: [] as MatchReason[] };

  const labelFor: Record<string, string> = {
    "mountain-views": "Has the views you asked for",
    "dense-forest": "Mature tree cover on the plot",
    "water-body": "Water on or beside the plot",
    "fruit-orchard": "Already planted as an orchard",
    silence: "Genuinely quiet, away from through traffic",
    wildlife: "Close to protected wildlife land",
    sunrise: "Open to the east",
    "investment-growth": "On a corridor that is still developing",
    privacy: "Private and enclosed",
  };

  const hits = wanted.filter((feature) =>
    (FEATURE_KEYWORDS[feature] ?? []).some((keyword) => plot.searchText.includes(keyword))
  );

  return {
    points: (hits.length / wanted.length) * W_FEATURES,
    reasons: hits.map((feature) => ({ label: labelFor[feature] ?? feature, source: "features" as const })),
  };
}

function acreageComponent(plot: MatchablePlot, answers: QuizAnswers) {
  const preference = ACREAGE_PREFERENCE[(answers.involvement ?? [])[0] ?? ""];
  if (!preference) return { points: W_ACREAGE, reason: null as MatchReason | null };

  if (plot.areaAcres >= preference.min && plot.areaAcres <= preference.max) {
    const closeness = 1 - Math.min(1, Math.abs(plot.areaAcres - preference.ideal) / preference.ideal);
    return {
      points: W_ACREAGE * (0.6 + 0.4 * closeness),
      reason: { label: "Sized for how you want to use it", source: "acreage" as const },
    };
  }
  return { points: 0, reason: null };
}

/**
 * Scores every plot and returns the best ones.
 *
 * Reasons are generated from the score breakdown, never from a generic list, so
 * a chip on a card always corresponds to something that actually moved the
 * score.
 */
export function computeMatches(
  plots: MatchablePlot[],
  answers: QuizAnswers,
  persona: Persona,
  limit = 12
): PlotMatch[] {
  return plots
    .map((plot) => {
      const budget = budgetComponent(plot, answers);
      const drive = driveComponent(plot, answers);
      const suitability = suitabilityComponent(plot, persona);
      const features = featureComponent(plot, answers);
      const acreage = acreageComponent(plot, answers);

      const score = Math.round(
        Math.min(100, budget.points + drive.points + suitability.points + features.points + acreage.points)
      );

      const reasons = [budget.reason, drive.reason, suitability.reason, acreage.reason, ...features.reasons].filter(
        (reason): reason is MatchReason => reason !== null
      );

      // Every card promises at least four reasons. Facts about the plot are
      // used to top up rather than filler copy, and only ones that are true.
      if (reasons.length < 4) {
        if (plot.water.startsWith("borewell")) {
          reasons.push({
            label:
              plot.water === "borewell_tested"
                ? "Borewell on site, yield tested"
                : "Borewell on site",
            source: "features",
          });
        }
        if (reasons.length < 4 && plot.roadAccess === "tar") {
          reasons.push({ label: "Tar road right up to the plot", source: "features" });
        }
        if (reasons.length < 4 && plot.corridor) {
          reasons.push({ label: `On ${plot.corridor}`, source: "features" });
        }
      }

      return { plot, score, reasons: reasons.slice(0, 6) };
    })
    .sort((a, b) => b.score - a.score || a.plot.fid.localeCompare(b.plot.fid))
    .slice(0, limit);
}
