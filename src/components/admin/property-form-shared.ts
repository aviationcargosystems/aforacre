import type { JourneyId, WaterSource } from "@/lib/types";

export const JOURNEY_FIELDS: { id: JourneyId; label: string }[] = [
  { id: "polyhouse", label: "Polyhouse Farming" },
  { id: "commercial-farming", label: "Commercial Farming" },
  { id: "retirement", label: "Retirement" },
  { id: "getaway", label: "Weekend Getaway" },
];

export const WATER_SOURCE_OPTIONS: { value: WaterSource; label: string }[] = [
  { value: "borewell", label: "Borewell" },
  { value: "open-well", label: "Open well" },
  { value: "rain-fed", label: "Rain-fed" },
  { value: "canal", label: "Canal" },
  { value: "none", label: "None" },
];

export const KHATA_OPTIONS = [
  { value: "A", label: "Khata A" },
  { value: "B", label: "Khata B" },
  { value: "none", label: "Not applicable" },
] as const;

export function journeyFieldName(id: JourneyId) {
  return `journeyFit_${id}`;
}
