/**
 * The capture field schema, in one place.
 *
 * This is the single description of what a partner submits about a plot. The
 * web form at /partner/capture renders from it, the QC queue reviews against
 * it, and a WhatsApp flow can reuse it verbatim rather than drifting into a
 * second, slightly different set of questions.
 *
 * Deliberately plain data with no React and no Supabase imports, so it can be
 * imported from anywhere including a worker or a bot.
 */

export type PartnerType = "broker" | "reseller" | "owner";
export type RoadAccess = "tar" | "mud" | "none";
export type WaterSource = "borewell_tested" | "borewell_untested" | "open_well" | "none";
export type SoilQuality = "rich" | "moderate" | "poor";

export const PARTNER_TYPES: { value: PartnerType; label: string }[] = [
  { value: "owner", label: "I own this land" },
  { value: "broker", label: "I am a broker" },
  { value: "reseller", label: "I am reselling" },
];

export const ROAD_ACCESS_OPTIONS: { value: RoadAccess; label: string }[] = [
  { value: "tar", label: "Tar road" },
  { value: "mud", label: "Mud road" },
  { value: "none", label: "No road yet" },
];

export const WATER_OPTIONS: { value: WaterSource; label: string }[] = [
  { value: "borewell_tested", label: "Borewell, yield tested" },
  { value: "borewell_untested", label: "Borewell, not tested" },
  { value: "open_well", label: "Open well" },
  { value: "none", label: "No water source" },
];

export const SOIL_OPTIONS: { value: SoilQuality; label: string }[] = [
  { value: "rich", label: "Rich" },
  { value: "moderate", label: "Moderate" },
  { value: "poor", label: "Poor" },
];

/** Minimum listable size. Stated publicly, and enforced by a CHECK on plots. */
export const MIN_AREA_ACRES = 1;
export const MIN_IMAGES = 3;
export const MAX_IMAGES = 10;

/**
 * What a partner sends. Step 1 fields are required to submit. Step 2 fields are
 * optional and can be completed later by the partner or by an agent, which is
 * the whole point: a broker standing in a field on 4G should be able to finish
 * in under a minute.
 */
export interface CapturePayload {
  // Step 1, required
  mobile: string;
  partnerType: PartnerType | null;
  lat: number | null;
  lng: number | null;
  areaAcres: number | null;
  askingPrice: number | null;
  images: string[];

  // Step 2, optional
  corridor: string;
  village: string;
  roadAccess: RoadAccess | null;
  roadWidthFt: number | null;
  water: WaterSource | null;
  fencing: boolean;
  electricity: boolean;
  existingStructure: string;
  soilNotes: string;
  notes: string;
}

export const EMPTY_CAPTURE: CapturePayload = {
  mobile: "",
  partnerType: null,
  lat: null,
  lng: null,
  areaAcres: null,
  askingPrice: null,
  images: [],
  corridor: "",
  village: "",
  roadAccess: null,
  roadWidthFt: null,
  water: null,
  fencing: false,
  electricity: false,
  existingStructure: "",
  soilNotes: "",
  notes: "",
};

export interface CaptureGap {
  field: keyof CapturePayload;
  message: string;
}

/**
 * What is still missing before this can be submitted.
 *
 * Returns every gap rather than the first one, so the form can show a partner
 * the whole list at once instead of making them discover the requirements one
 * failed submit at a time.
 */
export function missingRequiredFields(payload: CapturePayload): CaptureGap[] {
  const gaps: CaptureGap[] = [];

  if (payload.mobile.replace(/\D/g, "").length < 10) {
    gaps.push({ field: "mobile", message: "Add a 10 digit mobile number" });
  }
  if (!payload.partnerType) {
    gaps.push({ field: "partnerType", message: "Say whether you own, broker or resell this land" });
  }
  if (payload.lat === null || payload.lng === null) {
    gaps.push({ field: "lat", message: "Drop a pin or use your current location" });
  }
  if (payload.areaAcres === null || payload.areaAcres < MIN_AREA_ACRES) {
    gaps.push({ field: "areaAcres", message: `Area must be at least ${MIN_AREA_ACRES} acre` });
  }
  if (payload.askingPrice === null || payload.askingPrice <= 0) {
    gaps.push({ field: "askingPrice", message: "Add the asking price" });
  }
  if (payload.images.length < MIN_IMAGES) {
    gaps.push({
      field: "images",
      message: `Add at least ${MIN_IMAGES} photos (${payload.images.length} so far)`,
    });
  }

  return gaps;
}

export function isSubmittable(payload: CapturePayload): boolean {
  return missingRequiredFields(payload).length === 0;
}

/** Narrows an arbitrary jsonb payload back into the shape above. */
export function parseCapturePayload(raw: unknown): CapturePayload {
  const source = (raw ?? {}) as Partial<CapturePayload>;
  return {
    ...EMPTY_CAPTURE,
    ...source,
    images: Array.isArray(source.images) ? source.images.filter((i): i is string => typeof i === "string") : [],
  };
}
