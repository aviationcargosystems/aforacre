// Core domain types for the land discovery platform (Bangalore / South Bangalore).
// Mock data in src/data/* implements these shapes. Swapping to a real DB later
// should only require replacing the data source, not these types.

// What a plot is good for. This is a plot ATTRIBUTE used by the matching
// engine, never a browse path a buyer picks for themselves: the system tells
// the user who they are, the user does not self-select a category.
export type UseCase =
  | "polyhouse"
  | "commercial-farming"
  | "retirement"
  | "getaway";

export type WaterSource = "borewell" | "open-well" | "rain-fed" | "canal" | "none";

export type KhataType = "A" | "B" | "none";

export interface LandSuitability {
  polyhouse: { score: number; note: string };
  openFarming: { score: number; note: string };
  orchard: { score: number; note: string };
  residentialFarmhouse: { score: number; note: string };
  getaway: { score: number; note: string };
}

export interface TaxLineItem {
  label: string;
  amount: number;
  note?: string;
}

export interface TaxBreakdown {
  guidanceValuePerAcre: number;
  stampDutyRate: number; // e.g. 0.056 for 5.6%
  registrationRate: number; // e.g. 0.01 for 1%
  stampDuty: number;
  registrationFee: number;
  conversionCharges: number;
  estimatedAnnualLandRevenue: number;
  cessAndSurcharge: number;
  total: number;
  lineItems: TaxLineItem[];
}

/**
 * One RTC, which in practice means one survey number.
 *
 * A plot assembled from adjoining parcels carries a separate RTC per survey
 * number, each with its own owner, mutation history and land revenue — so these
 * fields repeat per record rather than sitting once on the property. Holding
 * them flat forced every multi-survey plot to be entered as whichever RTC the
 * person happened to type first, silently discarding the rest.
 */
export interface RtcRecord {
  surveyNumber: string;
  /** Stored scan of this RTC, so a reviewer can check the reading against it. */
  document: string;
  /** Revenue hierarchy as printed on this RTC. */
  hobli: string;
  taluk: string;
  district: string;
  /** Mutation reference, e.g. "MR H41/2025-2026". */
  mutationReference: string;
  /** This RTC's "valid from" date, as printed. */
  rtcValidFrom: string;
  /** Land revenue in rupees, as printed. */
  landRevenueRupees: string;
  /**
   * Owner as named on this RTC. Admin-only: vendor identity is never rendered on
   * a buyer-facing surface, so this must not reach a public page.
   */
  ownerOnRecord: string;
}

export interface LegalStatus {
  khata: KhataType;
  /** One entry per survey number. Read it through `rtcRecordsOf`, never raw. */
  rtcRecords: RtcRecord[];
  dcConverted: boolean;
  dcConversionNote: string;
  rtcAvailable: boolean;
  encumbranceClear: boolean;
  notes: string[];

  // ── Legacy single-RTC fields ────────────────────────────────────────────
  // Rows written before rtcRecords existed still carry these, and `legal` is a
  // jsonb blob rather than columns, so there is no migration that backfills
  // them. `rtcRecordsOf` folds them into a single record on read; nothing new
  // should write them except the compatibility shim in the builder.
  /** @deprecated use rtcRecords[].surveyNumber */
  surveyNumber?: string;
  /** @deprecated use rtcRecords[].document */
  rtcDocument?: string;
  /** @deprecated use rtcRecords[].hobli */
  hobli?: string;
  /** @deprecated use rtcRecords[].taluk */
  taluk?: string;
  /** @deprecated use rtcRecords[].district */
  district?: string;
  /** @deprecated use rtcRecords[].mutationReference */
  mutationReference?: string;
  /** @deprecated use rtcRecords[].rtcValidFrom */
  rtcValidFrom?: string;
  /** @deprecated use rtcRecords[].landRevenueRupees */
  landRevenueRupees?: string;
  /** @deprecated use rtcRecords[].ownerOnRecord */
  ownerOnRecord?: string;
}

export interface PropertyLocation {
  area: string;
  corridor: string; // e.g. "Kanakapura Road"
  lat: number;
  lng: number;
}

export interface VerifiedChecklist {
  ownership: boolean;
  survey: boolean;
  gps: boolean;
  physicalInspection: boolean;
  roadAccess: boolean;
  documents: boolean;
}

export interface Property {
  slug: string;
  title: string;
  location: PropertyLocation;
  extentAcres: number;
  pricePerAcre: number;
  totalPrice: number;
  tags: string[];
  useCaseFit: Record<UseCase, number>; // 0-100
  soilType: string;
  /**
   * What the land actually looks like standing on it — flat, gently sloping,
   * rocky in patches. Soil type says what is under the surface and acreage says
   * how much there is; neither tells a buyer whether they can build on it
   * without levelling first, which is usually the first thing they ask.
   */
  landObservation: string;
  waterSources: WaterSource[];
  roadAccess: string;
  fencing: boolean;
  electricity: boolean;
  images: string[];
  /**
   * Walkthrough clips. Optional per plot: some listings have one, most do not,
   * and an empty array must render as no video section rather than an empty
   * player. Served from the same Supabase Storage bucket as images, which is
   * already CDN-backed, so there is no separate host to configure.
   */
  videos: string[];
  description: string;
  taxes: TaxBreakdown;
  suitability: LandSuitability;
  legal: LegalStatus;
  nearbyLandmarks: string[];
  distanceFromBangaloreKm: number;
  featured?: boolean;
  /** "Farm ID", shown as "FID 0042" — admin-assigned, not set by sellers. */
  fid: string | null;
  verified: VerifiedChecklist;
}

export type CaptureStatus = "new" | "reviewed" | "archived";

export interface Capture {
  id: string;
  createdAt: string;
  images: string[]; // paths under /uploads/captures/
  /** Optional clips from the same visit. A slope reads on video and not in a still. */
  videos: string[];
  lat: number | null;
  lng: number | null;
  locationAccuracyM: number | null;
  label: string;
  notes: string;
  capturedBy: string;
  propertySlug: string | null;
  status: CaptureStatus;
  /** Brand tags picked in the field, carried through if this becomes a listing. */
  tags: string[];
  /**
   * Whatever else the person in the field happened to know. Every key is
   * optional and none of it is verified — it exists so a capture can carry
   * detail forward instead of making someone retype it later.
   */
  details: CaptureDetails;
}

export interface CaptureDetails {
  /** Seller contact, only ever collected on the public form. */
  phone?: string;
  ownerType?: string;
  area?: string;
  corridor?: string;
  extentAcres?: number;
  pricePerAcre?: number;
  soilType?: string;
  landObservation?: string;
  roadAccess?: string;
  surveyNumber?: string;
  khata?: KhataType;
  /** Raw RTC reading, kept whole so a reviewer can audit it against the scan. */
  rtc?: Record<string, unknown>;
  rtcImage?: string;
}

export type EnquiryStatus = "new" | "contacted" | "closed";

export interface Enquiry {
  id: string;
  createdAt: string;
  name: string;
  phone: string;
  context: string; // e.g. "quiz", "schedule-visit", "property"
  propertySlug: string | null;
  message: string;
  status: EnquiryStatus;
}

export interface Agent {
  id: string;
  name: string;
  phone: string;
  username: string;
  active: boolean;
  createdAt: string;
}

export type RecceType = "scout" | "pre_visit" | "client_visit";
export type RecceStatus = "assigned" | "in_progress" | "submitted" | "approved" | "rejected";

export interface Recce {
  id: string;
  type: RecceType;
  status: RecceStatus;
  agentId: string | null;
  propertySlug: string | null;
  area: string;
  lat: number | null;
  lng: number | null;
  scheduledFor: string | null;
  instructions: string;
  images: string[];
  notes: string;
  submittedLat: number | null;
  submittedLng: number | null;
  submittedAt: string | null;
  reviewNote: string;
  createdAt: string;
}

export type LandSubmissionOwnerType = "broker" | "reseller" | "owner";
export type LandSubmissionStatus = "pending" | "approved" | "rejected";

export interface LandSubmission {
  id: string;
  createdAt: string;
  images: string[];
  videos: string[];
  area: string;
  lat: number | null;
  lng: number | null;
  extentGunta: number | null;
  extentAcres: number | null;
  expectedPricePerGunta: number | null;
  ownerName: string;
  ownerType: LandSubmissionOwnerType;
  phone: string;
  tags: string[];
  notes: string;
  status: LandSubmissionStatus;
  propertySlug: string | null;
}
