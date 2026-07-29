import type { UseCase, VerifiedChecklist, WaterSource } from "@/lib/types";

export { USE_CASES as USE_CASE_FIELDS } from "@/data/use-cases";

export const WATER_SOURCE_OPTIONS: { value: WaterSource; label: string }[] = [
  { value: "borewell", label: "Borewell" },
  { value: "open-well", label: "Open well" },
  { value: "rain-fed", label: "Rain-fed" },
  { value: "canal", label: "Canal" },
  { value: "none", label: "None" },
];

/**
 * Water source is entered as a tag rather than its own checkbox set — it is one
 * of the things a buyer browses by, and having it in two places meant keeping
 * them in step. The structured value is derived from the tags on save, since
 * suitability scoring, the explore filter and the property page all read it.
 */
export const WATER_SOURCE_TAGS: Record<string, WaterSource> = {
  borewell: "borewell",
  "open well": "open-well",
  "open-well": "open-well",
  "rain-fed": "rain-fed",
  "rain fed": "rain-fed",
  canal: "canal",
};

export function waterSourcesFromTags(tags: string[]): WaterSource[] {
  const found = tags
    .map((tag) => WATER_SOURCE_TAGS[tag.trim().toLowerCase()])
    .filter((value): value is WaterSource => Boolean(value));
  return Array.from(new Set(found));
}

export const KHATA_OPTIONS = [
  { value: "A", label: "Khata A" },
  { value: "B", label: "Khata B" },
  { value: "none", label: "Not applicable" },
] as const;

// Deliberately not named useCaseFieldName: any identifier starting with "use"
// followed by a capital reads as a React Hook to the hooks lint rule.
export function fieldNameForUseCase(id: UseCase) {
  return `useCaseFit_${id}`;
}

/**
 * Suggestions only, offered through a datalist rather than a select. The field
 * stays free text because real plots rarely fit one word — "mostly flat, rocky
 * along the north boundary" is the useful answer and no fixed list contains it.
 */
export const LAND_OBSERVATIONS = [
  "Flat land",
  "Gently sloping",
  "Sloping",
  "Undulating",
  "Elevated, plateau-like",
  "Valley floor",
  "Rocky in patches",
  "Terraced",
];

export const VERIFIED_FIELDS: { key: keyof VerifiedChecklist; label: string }[] = [
  { key: "ownership", label: "Ownership verified" },
  { key: "survey", label: "Survey checked" },
  { key: "gps", label: "GPS verified" },
  { key: "physicalInspection", label: "Physical inspection completed" },
  { key: "roadAccess", label: "Road access confirmed" },
  { key: "documents", label: "Documents screened" },
];
