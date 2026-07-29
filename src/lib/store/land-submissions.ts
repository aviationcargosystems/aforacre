import type { LandSubmission, LandSubmissionOwnerType, LandSubmissionStatus } from "@/lib/types";
import { getSupabaseAdmin, isMissingSchemaError } from "@/lib/supabase/server";
import { buildProperty, slugify } from "@/lib/property-builder";
import { saveProperty, nextFid } from "@/lib/store/properties";
import { guntaToAcres, pricePerGuntaToPricePerAcre } from "@/lib/land-units";

interface LandSubmissionRow {
  id: string;
  created_at: string;
  images: string[];
  videos: string[];
  area: string;
  lat: number | null;
  lng: number | null;
  extent_gunta: number | null;
  extent_acres: number | null;
  expected_price_per_gunta: number | null;
  owner_name: string;
  owner_type: LandSubmissionOwnerType;
  phone: string;
  tags: string[];
  notes: string;
  status: LandSubmissionStatus;
  property_slug: string | null;
}

function rowToLandSubmission(row: LandSubmissionRow): LandSubmission {
  return {
    id: row.id,
    createdAt: row.created_at,
    images: row.images ?? [],
    videos: row.videos ?? [],
    area: row.area,
    lat: row.lat,
    lng: row.lng,
    extentGunta: row.extent_gunta,
    extentAcres: row.extent_acres,
    expectedPricePerGunta: row.expected_price_per_gunta,
    ownerName: row.owner_name,
    ownerType: row.owner_type,
    phone: row.phone,
    tags: row.tags ?? [],
    notes: row.notes,
    status: row.status,
    propertySlug: row.property_slug,
  };
}

export async function getAllLandSubmissions(): Promise<LandSubmission[]> {
  const { data, error } = await getSupabaseAdmin().from("land_submissions").select("*").order("created_at", { ascending: false });
  if (error) {
    if (isMissingSchemaError(error)) return []; // migration not run yet — degrade instead of crashing pages that list this
    throw error;
  }
  return (data as LandSubmissionRow[]).map(rowToLandSubmission);
}

export async function getLandSubmission(id: string): Promise<LandSubmission | undefined> {
  const { data, error } = await getSupabaseAdmin().from("land_submissions").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? rowToLandSubmission(data as LandSubmissionRow) : undefined;
}

export async function createLandSubmission(input: {
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
}): Promise<void> {
  const { error } = await getSupabaseAdmin().from("land_submissions").insert({
    images: input.images,
    videos: input.videos,
    area: input.area,
    lat: input.lat,
    lng: input.lng,
    extent_gunta: input.extentGunta,
    extent_acres: input.extentAcres,
    expected_price_per_gunta: input.expectedPricePerGunta,
    owner_name: input.ownerName,
    owner_type: input.ownerType,
    phone: input.phone,
    tags: input.tags,
    notes: input.notes,
    status: "pending",
  });
  if (error) throw error;
}

export async function rejectLandSubmission(id: string): Promise<void> {
  const { error } = await getSupabaseAdmin().from("land_submissions").update({ status: "rejected" }).eq("id", id);
  if (error) throw error;
}

/**
 * Approves a submission: builds a draft Property with a freshly-assigned FID
 * and saves it, then links the submission to that property. The draft is
 * intentionally bare (neutral use-case scores, unverified checklist,
 * placeholder legal/soil fields) — admin fleshes it out via the normal
 * property edit form afterward, per the spec's "ADMIN CAN EDIT" step.
 */
export async function approveLandSubmission(id: string): Promise<string> {
  const submission = await getLandSubmission(id);
  if (!submission) throw new Error(`Land submission "${id}" not found.`);
  if (submission.status === "approved" && submission.propertySlug) return submission.propertySlug;

  const extentAcres = submission.extentAcres ?? (submission.extentGunta ? guntaToAcres(submission.extentGunta) : 1);
  const pricePerAcre = submission.expectedPricePerGunta
    ? pricePerGuntaToPricePerAcre(submission.expectedPricePerGunta)
    : 0;

  const fid = await nextFid();
  const baseSlug = slugify(`${submission.area}-${extentAcres}ac-${fid}`);

  const property = buildProperty({
    slug: baseSlug,
    title: `${extentAcres}-Acre Plot, ${submission.area}`,
    area: submission.area,
    corridor: submission.area,
    lat: submission.lat ?? 0,
    lng: submission.lng ?? 0,
    extentAcres,
    pricePerAcre,
    guidanceValuePerAcre: pricePerAcre, // placeholder — admin must confirm the real guidance value before tax figures are trustworthy
    tags: submission.tags,
    useCaseFit: { polyhouse: 50, "commercial-farming": 50, retirement: 50, getaway: 50 },
    soilType: "Not yet assessed",
    landObservation: "",
    waterSources: [],
    roadAccess: "Not yet assessed",
    fencing: false,
    electricity: false,
    images: submission.images,
    // Sellers submit stills today; a video field on the intake form is a
    // separate change, so an approved submission starts with none.
    videos: [],
    description: submission.notes || "Details pending admin review after site visit.",
    khata: "none",
    dcConverted: false,
    rtcAvailable: false,
    encumbranceClear: false,
    surveyNumber: "",
    legalNotes: ["Submitted via land intake — legal and site details pending verification."],
    nearbyLandmarks: [],
    distanceFromBangaloreKm: 0,
    featured: false,
    fid,
  });

  await saveProperty(property, { isNew: true });

  const { error } = await getSupabaseAdmin()
    .from("land_submissions")
    .update({ status: "approved", property_slug: property.slug })
    .eq("id", id);
  if (error) throw error;

  return property.slug;
}
