// Core domain types for the land discovery platform (Bangalore / South Bangalore).
// Mock data in src/data/* implements these shapes. Swapping to a real DB later
// should only require replacing the data source, not these types.

export type JourneyId =
  | "polyhouse"
  | "commercial-farming"
  | "retirement"
  | "getaway";

export type ProfessionalCategory =
  | "broker"
  | "solar"
  | "irrigation"
  | "borewell"
  | "polyhouse-construction"
  | "soil-testing"
  | "fencing"
  | "farm-management"
  | "landscaping"
  | "legal-verification";

export type WaterSource = "borewell" | "open-well" | "rain-fed" | "canal" | "none";

export type KhataType = "A" | "B" | "none";

export interface Journey {
  id: JourneyId;
  title: string;
  shortTitle: string;
  tagline: string;
  description: string;
  heroImage: string;
  whatToLookFor: string[];
  recommendedFilters: {
    minAcres?: number;
    maxAcres?: number;
    maxDistanceKm?: number;
    tags?: string[];
  };
  relevantProfessionalCategories: ProfessionalCategory[];
  faqs: { question: string; answer: string }[];
  accentTag: string;
}

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

export interface LegalStatus {
  khata: KhataType;
  dcConverted: boolean;
  dcConversionNote: string;
  rtcAvailable: boolean;
  encumbranceClear: boolean;
  surveyNumber: string;
  notes: string[];
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
  journeyFit: Record<JourneyId, number>; // 0-100
  soilType: string;
  waterSources: WaterSource[];
  roadAccess: string;
  fencing: boolean;
  electricity: boolean;
  images: string[];
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

export interface Professional {
  slug: string;
  name: string;
  category: ProfessionalCategory;
  tagline: string;
  services: string[];
  startingPrice: string;
  experienceYears: number;
  projectsCompleted: number;
  serviceAreas: string[];
  rating: number;
  reviewCount: number;
  image: string;
  bio: string;
  phone: string;
}

export interface Vendor {
  slug: string;
  name: string;
  category: string;
  description: string;
  serviceAreas: string[];
}

export interface Broker {
  slug: string;
  name: string;
  agency: string;
  serviceAreas: string[];
  listingsCount: number;
  phone: string;
}

export type CaptureStatus = "new" | "reviewed" | "archived";

export interface Capture {
  id: string;
  createdAt: string;
  images: string[]; // paths under /uploads/captures/
  lat: number | null;
  lng: number | null;
  locationAccuracyM: number | null;
  label: string;
  notes: string;
  capturedBy: string;
  propertySlug: string | null;
  status: CaptureStatus;
}

export type EnquiryStatus = "new" | "contacted" | "closed";

export interface Enquiry {
  id: string;
  createdAt: string;
  name: string;
  phone: string;
  context: string; // e.g. "quiz", "schedule-visit", "property", "professional"
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
