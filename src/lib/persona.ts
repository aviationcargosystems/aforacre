import type { QuizAnswers } from "@/lib/quiz-questions";
import type { PlotUseCase } from "@/lib/plots/use-cases";

/**
 * Persona scoring. A pure function: same answers in, same persona out.
 *
 * The system tells the user who they are, so this must never be a coin flip.
 * Every option carries an explicit weight table below, which means a scoring
 * change is a visible diff rather than a tweak buried in branching logic. An
 * agent layer can call scorePersonas() directly with no web context.
 */

export type PersonaKey =
  | "weekend_naturalist"
  | "legacy_builder"
  | "future_farmer"
  | "investor"
  | "escape_artist"
  | "working_farmer";

export interface Persona {
  key: PersonaKey;
  title: string;
  description: string;
  /** Drives which plot_suitability row the match engine weighs most. */
  primaryUseCase: PlotUseCase;
}

export const PERSONAS: Record<PersonaKey, Persona> = {
  weekend_naturalist: {
    key: "weekend_naturalist",
    title: "The Weekend Naturalist",
    description:
      "You want the drive out on Friday and the quiet that follows. Land that already has trees, water and a view matters more to you than acreage, and you want it close enough that going is never a decision.",
    primaryUseCase: "getaway",
  },
  legacy_builder: {
    key: "legacy_builder",
    title: "The Legacy Builder",
    description:
      "You are buying something to hand over, not to flip. Clean title, real road access and a plot large enough to build on matter more than the entry price, because this one stays in the family.",
    primaryUseCase: "farmhouse",
  },
  future_farmer: {
    key: "future_farmer",
    title: "The Future Farmer",
    description:
      "You intend to grow something, just not yet. You want good soil and dependable water now, and the option to start small and scale when your time frees up.",
    primaryUseCase: "organic",
  },
  investor: {
    key: "investor",
    title: "The Investor",
    description:
      "You are underwriting an asset. Corridor, infrastructure timelines and clean paperwork decide this, and you would rather hold something appreciating than something you have to visit.",
    primaryUseCase: "investment",
  },
  escape_artist: {
    key: "escape_artist",
    title: "The Escape Artist",
    description:
      "You are buying distance from the city. Privacy, silence and space to build a place of your own matter more than proximity, and you are willing to drive further to get them.",
    primaryUseCase: "retirement",
  },
  working_farmer: {
    key: "working_farmer",
    title: "The Working Farmer",
    description:
      "This is a business. Yield per acre, water security and access for machinery and produce decide the plot, and you already know what you intend to put in the ground.",
    primaryUseCase: "commercial",
  },
};

type Weights = Partial<Record<PersonaKey, number>>;

/**
 * Weight tables, one per question. Q1 carries the most because a stated goal is
 * a stronger signal than a job title. Q3 carries least: being a doctor nudges,
 * it does not decide.
 */
const GOAL_WEIGHTS: Record<string, Weights> = {
  "weekend-farm": { weekend_naturalist: 10, escape_artist: 4 },
  farmhouse: { legacy_builder: 9, escape_artist: 5 },
  investment: { investor: 11 },
  organic: { future_farmer: 9, working_farmer: 4 },
  commercial: { working_farmer: 11 },
  retirement: { escape_artist: 8, legacy_builder: 4 },
  legacy: { legacy_builder: 10, investor: 3 },
  "eco-tourism": { weekend_naturalist: 6, working_farmer: 3, investor: 2 },
  // Deliberately flat. "Not sure" is information about certainty, not direction,
  // so it must not tilt the result.
  "not-sure": {},
};



const INVOLVEMENT_WEIGHTS: Record<string, Weights> = {
  "visit-occasionally": { investor: 5, weekend_naturalist: 2 },
  "spend-weekends": { weekend_naturalist: 8, escape_artist: 3 },
  "actively-farm": { working_farmer: 7, future_farmer: 6 },
  "managed-farm": { future_farmer: 5, investor: 3, legacy_builder: 2 },
  "hire-team": { working_farmer: 6, investor: 3 },
};

const EXCITES_WEIGHTS: Record<string, Weights> = {
  "mountain-views": { weekend_naturalist: 4, escape_artist: 3 },
  "dense-forest": { weekend_naturalist: 4, escape_artist: 3 },
  "water-body": { weekend_naturalist: 3, future_farmer: 3 },
  "fruit-orchard": { future_farmer: 5, working_farmer: 2 },
  silence: { escape_artist: 5, weekend_naturalist: 2 },
  wildlife: { weekend_naturalist: 4, escape_artist: 2 },
  sunrise: { weekend_naturalist: 3, escape_artist: 2 },
  "investment-growth": { investor: 6 },
  privacy: { escape_artist: 5, legacy_builder: 3 },
};

const PERSONA_KEYS = Object.keys(PERSONAS) as PersonaKey[];

function apply(totals: Record<PersonaKey, number>, weights: Weights | undefined) {
  if (!weights) return;
  for (const [key, value] of Object.entries(weights)) {
    totals[key as PersonaKey] += value ?? 0;
  }
}

/** Every persona's score. Exposed so the result screen can explain the call. */
export function scorePersonas(answers: QuizAnswers): Record<PersonaKey, number> {
  const totals = Object.fromEntries(PERSONA_KEYS.map((key) => [key, 0])) as Record<PersonaKey, number>;

  // Timeline and identity were dropped with their questions. Their weight
  // tables are gone rather than left dangling: a persona inferred from a
  // question nobody is asked is an inference from nothing.
  (answers.goals ?? []).forEach((goal) => apply(totals, GOAL_WEIGHTS[goal]));
  (answers.involvement ?? []).forEach((value) => apply(totals, INVOLVEMENT_WEIGHTS[value]));
  (answers.excites ?? []).forEach((value) => apply(totals, EXCITES_WEIGHTS[value]));

  return totals;
}

/**
 * The winning persona.
 *
 * Ties break on the first goal selected in Q1, because a stated goal beats an
 * accumulated inference. If that still does not separate them, the order the
 * personas are declared in decides, so the function is total and never random.
 */
export function computePersona(answers: QuizAnswers): Persona {
  const totals = scorePersonas(answers);

  let best: PersonaKey = PERSONA_KEYS[0];
  for (const key of PERSONA_KEYS) {
    if (totals[key] > totals[best]) best = key;
  }

  const topScore = totals[best];
  const tied = PERSONA_KEYS.filter((key) => totals[key] === topScore);
  if (tied.length > 1) {
    const primaryGoal = (answers.goals ?? [])[0];
    const goalPreference = GOAL_WEIGHTS[primaryGoal ?? ""] ?? {};
    const preferred = tied
      .filter((key) => (goalPreference[key] ?? 0) > 0)
      .sort((a, b) => (goalPreference[b] ?? 0) - (goalPreference[a] ?? 0))[0];
    best = preferred ?? tied[0];
  }

  return PERSONAS[best];
}
