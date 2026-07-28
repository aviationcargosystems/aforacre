import type { UseCase } from "@/lib/types";

// Labels for the use-case scores stored on every plot. These exist so admin can
// enter and read the scores; they are never rendered as a browse path for
// buyers. Replaces the old journeys module, which carried hero images, FAQ
// copy and "what to look for" checklists for a self-select flow we no longer
// have.
export const USE_CASES: { id: UseCase; label: string }[] = [
  { id: "polyhouse", label: "Polyhouse farming" },
  { id: "commercial-farming", label: "Commercial farming" },
  { id: "retirement", label: "Retirement" },
  { id: "getaway", label: "Weekend getaway" },
];

export const USE_CASE_LABELS: Record<UseCase, string> = Object.fromEntries(
  USE_CASES.map((useCase) => [useCase.id, useCase.label])
) as Record<UseCase, string>;
