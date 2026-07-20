// Core domain types for the land discovery platform (Bangalore / South Bangalore).
// Mock data in src/data/* implements these shapes. Swapping to a real DB later
// should only require replacing the data source, not these types.

export type JourneyId =
  | "polyhouse"
  | "commercial-farming"
  | "retirement"
  | "getaway";

export type ProfessionalCategory =
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
