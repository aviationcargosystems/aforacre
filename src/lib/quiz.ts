import type { Property, UseCase } from "@/lib/types";

export type QuizQuestionId = "goals" | "involvement" | "scenery" | "budget";

export interface QuizOption {
  value: string;
  label: string;
}

export interface QuizQuestion {
  id: QuizQuestionId;
  question: string;
  options: QuizOption[];
}

export type QuizAnswers = Record<QuizQuestionId, string[]>;

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: "goals",
    question: "What are you hoping to do with your land?",
    options: [
      { value: "weekend-farmhouse", label: "Weekend Farmhouse" },
      { value: "long-term-investment", label: "Long-term Investment" },
      { value: "organic-farming", label: "Organic Farming" },
      { value: "commercial-farming", label: "Commercial Farming" },
      { value: "retirement-home", label: "Retirement Home" },
      { value: "not-sure", label: "Not Sure Yet" },
    ],
  },
  {
    id: "involvement",
    question: "How involved do you want to be?",
    options: [
      { value: "occasional", label: "I want to visit occasionally" },
      { value: "weekends", label: "I want to spend weekends" },
      { value: "active", label: "I want to actively farm" },
      { value: "hire-team", label: "I'll hire a team" },
    ],
  },
  {
    id: "scenery",
    question: "What excites you the most?",
    options: [
      { value: "mountain-views", label: "Mountain views" },
      { value: "dense-forest", label: "Dense forest" },
      { value: "water-body", label: "Water body" },
      { value: "plantations", label: "Plantations" },
      { value: "investment-growth", label: "Investment growth" },
    ],
  },
  {
    id: "budget",
    question: "What's your investment range?",
    options: [
      { value: "75l-1cr", label: "₹75L–1Cr" },
      { value: "1-2cr", label: "₹1–2Cr" },
      { value: "2-5cr", label: "₹2–5Cr" },
      { value: "5cr-plus", label: "₹5Cr+" },
    ],
  },
];

// Best-effort mapping from the quiz's goal options to the use-case scores
// stored on every plot. "long-term-investment" and "not-sure" have no single
// natural use case, so they stay neutral and blend across all four rather than
// guessing.
/**
 * What each goal looks for in a plot's tags and description.
 *
 * Scoring used to run entirely on `useCaseFit`, a 0-100 figure an admin typed
 * per property. That field lost its input, so every plot scored identically and
 * the quiz ranked arbitrarily — silently, since a tie is not an error.
 *
 * Tags are what an admin actually records now, so the base score is derived
 * from them. Matched as substrings across tags, title, description and
 * landmarks, because the tag vocabulary is admin-editable and a new tag should
 * count without a code change.
 */
const GOAL_KEYWORDS: Record<string, string[]> = {
  "weekend-farmhouse": ["farmhouse", "weekend", "getaway", "scenic", "view", "gated", "retreat"],
  "retirement-home": ["farmhouse", "gated", "road", "power", "electric", "water", "borewell", "quiet"],
  "commercial-farming": ["farm", "crop", "multi-crop", "open farmland", "irrigat", "borewell", "soil"],
  "organic-farming": ["organic", "soil", "water", "borewell", "farm", "plantation"],
  "long-term-investment": ["investment", "potential", "road", "highway", "immediate", "clear"],
  "not-sure": [],
};

const GOAL_TO_USE_CASE: Partial<Record<string, UseCase>> = {
  "weekend-farmhouse": "getaway",
  "retirement-home": "retirement",
  "commercial-farming": "commercial-farming",
  "organic-farming": "commercial-farming",
};

const SCENERY_KEYWORDS: Record<string, string[]> = {
  "mountain-views": ["view", "hill", "valley"],
  "dense-forest": ["forest", "tree", "wooded"],
  "water-body": ["lake", "water", "canal", "stream", "pond"],
  plantations: ["orchard", "coffee", "plantation"],
  "investment-growth": [],
};

/** The 5 canonical property "type" tags, per the spec — used as the quiz's scenery options and as seller-submission tag choices. */
export const CANONICAL_PROPERTY_TAGS = [
  "Mountain views",
  "Dense forest",
  "Water body",
  "Plantations",
  "Investment growth",
];

const BUDGET_RANGES: Record<string, { min: number; max: number }> = {
  "75l-1cr": { min: 7_500_000, max: 10_000_000 },
  "1-2cr": { min: 10_000_000, max: 20_000_000 },
  "2-5cr": { min: 20_000_000, max: 50_000_000 },
  "5cr-plus": { min: 50_000_000, max: Infinity },
};

const ALL_USE_CASES: UseCase[] = ["polyhouse", "commercial-farming", "retirement", "getaway"];

export interface QuizMatch {
  property: Property;
  score: number;
}

export function computeMatches(properties: Property[], answers: QuizAnswers, limit = 6): QuizMatch[] {
  const mappedUseCases = Array.from(
    new Set((answers.goals ?? []).map((goal) => GOAL_TO_USE_CASE[goal]).filter((id): id is UseCase => Boolean(id)))
  );
  const useCasesToScore = mappedUseCases.length > 0 ? mappedUseCases : ALL_USE_CASES;

  const sceneryKeywords = (answers.scenery ?? []).flatMap((value) => SCENERY_KEYWORDS[value] ?? []);
  const budgetRanges = (answers.budget ?? []).map((value) => BUDGET_RANGES[value]).filter(Boolean);

  const goalKeywords = Array.from(
    new Set((answers.goals ?? []).flatMap((goal) => GOAL_KEYWORDS[goal] ?? []))
  );

  const scored = properties.map((property) => {
    const haystack = [property.title, property.description, ...property.tags, ...property.nearbyLandmarks]
      .join(" ")
      .toLowerCase();

    // useCaseFit still counts where it was filled in, but it is no longer the
    // whole score — a catalogue of zeroes would otherwise flatten everything.
    const curated =
      useCasesToScore.reduce((sum, id) => sum + (property.useCaseFit[id] ?? 0), 0) / useCasesToScore.length;

    // Start from neutral and earn upward, so a plot with no curation is ranked
    // on what it actually carries rather than pinned to the bottom.
    const hits = goalKeywords.filter((keyword) => haystack.includes(keyword)).length;
    const fromTags = goalKeywords.length > 0 ? Math.min(40, (hits / goalKeywords.length) * 80) : 0;

    let score = curated > 0 ? Math.max(curated, 50 + fromTags) : 50 + fromTags;

    if (budgetRanges.length > 0) {
      const fitsAnyRange = budgetRanges.some((range) => property.totalPrice >= range.min && property.totalPrice <= range.max);
      if (!fitsAnyRange) score -= 15;
    }

    if (sceneryKeywords.length > 0) {
      const matchesScenery = sceneryKeywords.some((keyword) => haystack.includes(keyword));
      if (matchesScenery) score += 8;
    }

    return { property, score: Math.max(0, Math.min(100, Math.round(score))) };
  });

  return scored.sort((a, b) => b.score - a.score).slice(0, limit);
}
