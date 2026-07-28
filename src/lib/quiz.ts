import type { JourneyId, Property } from "@/lib/types";

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

// Best-effort mapping from the quiz's goal options to the site's existing
// journey taxonomy. "long-term-investment" and "not-sure" have no single
// natural journey — they stay neutral and blend across all four instead of
// guessing.
const GOAL_TO_JOURNEY: Partial<Record<string, JourneyId>> = {
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

const ALL_JOURNEY_IDS: JourneyId[] = ["polyhouse", "commercial-farming", "retirement", "getaway"];

export interface QuizMatch {
  property: Property;
  score: number;
}

export function computeMatches(properties: Property[], answers: QuizAnswers, limit = 6): QuizMatch[] {
  const mappedJourneys = Array.from(
    new Set((answers.goals ?? []).map((goal) => GOAL_TO_JOURNEY[goal]).filter((id): id is JourneyId => Boolean(id)))
  );
  const journeysToScore = mappedJourneys.length > 0 ? mappedJourneys : ALL_JOURNEY_IDS;

  const sceneryKeywords = (answers.scenery ?? []).flatMap((value) => SCENERY_KEYWORDS[value] ?? []);
  const budgetRanges = (answers.budget ?? []).map((value) => BUDGET_RANGES[value]).filter(Boolean);

  const scored = properties.map((property) => {
    const baseScore =
      journeysToScore.reduce((sum, id) => sum + property.journeyFit[id], 0) / journeysToScore.length;

    let score = baseScore;

    if (budgetRanges.length > 0) {
      const fitsAnyRange = budgetRanges.some((range) => property.totalPrice >= range.min && property.totalPrice <= range.max);
      if (!fitsAnyRange) score -= 15;
    }

    if (sceneryKeywords.length > 0) {
      const haystack = [property.title, property.description, ...property.tags, ...property.nearbyLandmarks]
        .join(" ")
        .toLowerCase();
      const matchesScenery = sceneryKeywords.some((keyword) => haystack.includes(keyword));
      if (matchesScenery) score += 8;
    }

    return { property, score: Math.max(0, Math.min(100, Math.round(score))) };
  });

  return scored.sort((a, b) => b.score - a.score).slice(0, limit);
}
