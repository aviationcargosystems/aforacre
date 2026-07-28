/**
 * The seven use cases a plot is scored against.
 *
 * Mirrors the use_case enum in supabase/migrations/0002. Every live plot needs
 * a plot_suitability row per use case, because the match engine scores against
 * the persona's primary use case and the "why this plot" chips are generated
 * from the rationale text.
 */
export const USE_CASE_KEYS = [
  "polyhouse",
  "commercial",
  "farmhouse",
  "getaway",
  "retirement",
  "investment",
  "organic",
] as const;

export type PlotUseCase = (typeof USE_CASE_KEYS)[number];

export const USE_CASE_LABELS: Record<PlotUseCase, string> = {
  polyhouse: "Polyhouse",
  commercial: "Commercial farming",
  farmhouse: "Farmhouse",
  getaway: "Weekend getaway",
  retirement: "Retirement",
  investment: "Investment",
  organic: "Organic farming",
};
