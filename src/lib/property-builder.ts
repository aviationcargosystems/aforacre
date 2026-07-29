import type { UseCase, KhataType, LandSuitability, Property, VerifiedChecklist, WaterSource } from "@/lib/types";
import { computeKarnatakaTaxes } from "@/lib/tax";

export const EMPTY_VERIFIED: VerifiedChecklist = {
  ownership: false,
  survey: false,
  gps: false,
  physicalInspection: false,
  roadAccess: false,
  documents: false,
};

type Tier = "excellent" | "good" | "moderate" | "limited";

function tier(score: number): Tier {
  if (score >= 80) return "excellent";
  if (score >= 60) return "good";
  if (score >= 40) return "moderate";
  return "limited";
}

function suitabilityNote(
  category: "polyhouse" | "openFarming" | "orchard" | "residentialFarmhouse" | "getaway",
  score: number,
  ctx: { waterSources: WaterSource[]; soilType: string; distanceFromBangaloreKm: number; roadAccess: string }
): string {
  const t = tier(score);
  const water = ctx.waterSources.includes("borewell")
    ? "a tested borewell"
    : ctx.waterSources.includes("open-well")
      ? "an open well"
      : ctx.waterSources.includes("canal")
        ? "canal access"
        : "rain-fed water only";

  switch (category) {
    case "polyhouse":
      return t === "excellent"
        ? `Flat terrain, ${water}, and three-phase power make this a strong polyhouse candidate with minimal site prep.`
        : t === "good"
          ? `Workable for polyhouse with some site grading; ${water} covers a moderate structure.`
          : t === "moderate"
            ? `Possible but needs water infrastructure investment before a polyhouse is viable here.`
            : `Not recommended for polyhouse — water and terrain constraints would push setup costs high.`;
    case "openFarming":
      return t === "excellent"
        ? `${ctx.soilType} soil and good extent make this well suited to row-crop or mixed farming at scale.`
        : t === "good"
          ? `Decent open-farming potential; ${ctx.soilType} soil performs well with seasonal crop rotation.`
          : t === "moderate"
            ? `Smaller extent limits mechanized farming, but kitchen-garden scale cultivation works fine.`
            : `Limited open-farming upside given extent and water access — better suited to other uses.`;
    case "orchard":
      return t === "excellent"
        ? `Established tree cover and soil quality support fruit orchard planting (mango, coconut, guava) with low ongoing input.`
        : t === "good"
          ? `Orchard planting is viable; expect 3-4 years to first meaningful yield.`
          : t === "moderate"
            ? `Orchard planting possible on part of the plot with supplemental irrigation.`
            : `Water access is the limiting factor for a productive orchard here.`;
    case "residentialFarmhouse":
      return t === "excellent"
        ? `${ctx.distanceFromBangaloreKm}km from the city with ${ctx.roadAccess.toLowerCase()} — comfortable for regular farmhouse living.`
        : t === "good"
          ? `A reasonable farmhouse plot; the commute is manageable for weekly rather than daily trips.`
          : t === "moderate"
            ? `Livable with planning, though distance and access mean this suits occasional stays over full-time living.`
            : `Distance and access make this a poor fit for a primary farmhouse residence.`;
    case "getaway":
      return t === "excellent"
        ? `Scenic setting and easy access make this a genuine weekend-escape plot with farm-stay potential.`
        : t === "good"
          ? `A pleasant weekend property, particularly once basic landscaping is done.`
          : t === "moderate"
            ? `Functional as a getaway plot but lacks standout scenic features.`
            : `Best suited to farming use rather than a leisure getaway.`;
  }
}

export function buildSuitability(
  useCaseFit: Record<UseCase, number>,
  ctx: { waterSources: WaterSource[]; soilType: string; distanceFromBangaloreKm: number; roadAccess: string }
): LandSuitability {
  const orchardScore = Math.round(
    (useCaseFit["commercial-farming"] * 0.6 + useCaseFit.retirement * 0.4) * (ctx.waterSources.length > 1 ? 1.05 : 0.9)
  );
  const scores = {
    polyhouse: useCaseFit.polyhouse,
    openFarming: useCaseFit["commercial-farming"],
    orchard: Math.min(100, orchardScore),
    residentialFarmhouse: useCaseFit.retirement,
    getaway: useCaseFit.getaway,
  };
  return {
    polyhouse: { score: scores.polyhouse, note: suitabilityNote("polyhouse", scores.polyhouse, ctx) },
    openFarming: { score: scores.openFarming, note: suitabilityNote("openFarming", scores.openFarming, ctx) },
    orchard: { score: scores.orchard, note: suitabilityNote("orchard", scores.orchard, ctx) },
    residentialFarmhouse: {
      score: scores.residentialFarmhouse,
      note: suitabilityNote("residentialFarmhouse", scores.residentialFarmhouse, ctx),
    },
    getaway: { score: scores.getaway, note: suitabilityNote("getaway", scores.getaway, ctx) },
  };
}

export interface PropertyInput {
  slug: string;
  title: string;
  area: string;
  corridor: string;
  lat: number;
  lng: number;
  extentAcres: number;
  pricePerAcre: number;
  guidanceValuePerAcre: number;
  tags: string[];
  useCaseFit: Record<UseCase, number>;
  soilType: string;
  landObservation: string;
  waterSources: WaterSource[];
  roadAccess: string;
  fencing: boolean;
  electricity: boolean;
  images: string[];
  videos: string[];
  description: string;
  khata: KhataType;
  dcConverted: boolean;
  rtcAvailable: boolean;
  encumbranceClear: boolean;
  surveyNumber: string;
  hobli: string;
  taluk: string;
  district: string;
  mutationReference: string;
  rtcValidFrom: string;
  landRevenueRupees: string;
  ownerOnRecord: string;
  rtcDocument: string;
  legalNotes: string[];
  nearbyLandmarks: string[];
  distanceFromBangaloreKm: number;
  featured?: boolean;
  fid?: string | null;
  verified?: VerifiedChecklist;
}

export function buildProperty(input: PropertyInput): Property {
  const totalPrice = Math.round(input.pricePerAcre * input.extentAcres);
  const taxes = computeKarnatakaTaxes({
    totalPrice,
    guidanceValuePerAcre: input.guidanceValuePerAcre,
    extentAcres: input.extentAcres,
    dcConverted: input.dcConverted,
  });
  const ctx = {
    waterSources: input.waterSources,
    soilType: input.soilType,
    distanceFromBangaloreKm: input.distanceFromBangaloreKm,
    roadAccess: input.roadAccess,
  };
  return {
    slug: input.slug,
    title: input.title,
    location: { area: input.area, corridor: input.corridor, lat: input.lat, lng: input.lng },
    extentAcres: input.extentAcres,
    pricePerAcre: input.pricePerAcre,
    totalPrice,
    tags: input.tags,
    useCaseFit: input.useCaseFit,
    soilType: input.soilType,
    landObservation: input.landObservation,
    waterSources: input.waterSources,
    roadAccess: input.roadAccess,
    fencing: input.fencing,
    electricity: input.electricity,
    images: input.images,
    videos: input.videos,
    description: input.description,
    taxes,
    suitability: buildSuitability(input.useCaseFit, ctx),
    legal: {
      khata: input.khata,
      dcConverted: input.dcConverted,
      dcConversionNote: input.dcConverted
        ? "Already converted for non-agricultural use."
        : "Not yet DC-converted — required before any permanent structure can be built.",
      rtcAvailable: input.rtcAvailable,
      encumbranceClear: input.encumbranceClear,
      surveyNumber: input.surveyNumber,
      hobli: input.hobli,
      taluk: input.taluk,
      district: input.district,
      mutationReference: input.mutationReference,
      rtcValidFrom: input.rtcValidFrom,
      landRevenueRupees: input.landRevenueRupees,
      ownerOnRecord: input.ownerOnRecord,
      rtcDocument: input.rtcDocument,
      notes: input.legalNotes,
    },
    nearbyLandmarks: input.nearbyLandmarks,
    distanceFromBangaloreKm: input.distanceFromBangaloreKm,
    featured: input.featured,
    fid: input.fid ?? null,
    verified: input.verified ?? EMPTY_VERIFIED,
  };
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
