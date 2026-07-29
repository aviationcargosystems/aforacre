import type { Property, UseCase, VerifiedChecklist } from "@/lib/types";
import { getSupabaseAdmin, isMissingSchemaError } from "@/lib/supabase/server";

const DEFAULT_VERIFIED: VerifiedChecklist = {
  ownership: false,
  survey: false,
  gps: false,
  physicalInspection: false,
  roadAccess: false,
  documents: false,
};

interface PropertyRow {
  slug: string;
  title: string;
  area: string;
  corridor: string;
  lat: number;
  lng: number;
  extent_acres: number;
  price_per_acre: number;
  total_price: number;
  tags: string[];
  // Column name still reads journey_fit. The domain concept is now useCaseFit;
  // the column gets renamed with the Phase 2 schema rebuild rather than in a
  // one-off migration here.
  journey_fit: Record<UseCase, number>;
  soil_type: string;
  water_sources: Property["waterSources"];
  road_access: string;
  fencing: boolean;
  electricity: boolean;
  images: string[];
  description: string;
  taxes: Property["taxes"];
  suitability: Property["suitability"];
  legal: Property["legal"];
  nearby_landmarks: string[];
  distance_from_bangalore_km: number;
  land_observation: string | null;
  videos: string[] | null;
  featured: boolean;
  fid: string | null;
  verified: Property["verified"];
}

function rowToProperty(row: PropertyRow): Property {
  return {
    slug: row.slug,
    title: row.title,
    location: { area: row.area, corridor: row.corridor, lat: row.lat, lng: row.lng },
    extentAcres: row.extent_acres,
    pricePerAcre: row.price_per_acre,
    totalPrice: row.total_price,
    tags: row.tags ?? [],
    useCaseFit: row.journey_fit,
    soilType: row.soil_type,
    landObservation: row.land_observation ?? "",
    waterSources: row.water_sources ?? [],
    roadAccess: row.road_access,
    fencing: row.fencing,
    electricity: row.electricity,
    images: row.images ?? [],
    videos: row.videos ?? [],
    description: row.description,
    taxes: row.taxes,
    suitability: row.suitability,
    legal: row.legal,
    nearbyLandmarks: row.nearby_landmarks ?? [],
    distanceFromBangaloreKm: row.distance_from_bangalore_km,
    featured: row.featured,
    fid: row.fid ?? null,
    verified: row.verified ?? DEFAULT_VERIFIED,
  };
}

function propertyToRow(p: Property): Omit<PropertyRow, "created_at" | "updated_at"> {
  return {
    slug: p.slug,
    title: p.title,
    area: p.location.area,
    corridor: p.location.corridor,
    lat: p.location.lat,
    lng: p.location.lng,
    extent_acres: p.extentAcres,
    price_per_acre: p.pricePerAcre,
    total_price: p.totalPrice,
    tags: p.tags,
    journey_fit: p.useCaseFit,
    soil_type: p.soilType,
    land_observation: p.landObservation,
    water_sources: p.waterSources,
    road_access: p.roadAccess,
    fencing: p.fencing,
    electricity: p.electricity,
    images: p.images,
    videos: p.videos,
    description: p.description,
    taxes: p.taxes,
    suitability: p.suitability,
    legal: p.legal,
    nearby_landmarks: p.nearbyLandmarks,
    distance_from_bangalore_km: p.distanceFromBangaloreKm,
    featured: !!p.featured,
    fid: p.fid ?? null,
    verified: p.verified ?? DEFAULT_VERIFIED,
  };
}

export async function getAllProperties(): Promise<Property[]> {
  const { data, error } = await getSupabaseAdmin().from("properties").select("*").order("title");
  if (error) throw error;
  return (data as PropertyRow[]).map(rowToProperty);
}

export async function getProperty(slug: string): Promise<Property | undefined> {
  const { data, error } = await getSupabaseAdmin().from("properties").select("*").eq("slug", slug).maybeSingle();
  if (error) throw error;
  return data ? rowToProperty(data as PropertyRow) : undefined;
}

export async function featuredProperties(): Promise<Property[]> {
  const { data, error } = await getSupabaseAdmin().from("properties").select("*").eq("featured", true).order("title");
  if (error) throw error;
  return (data as PropertyRow[]).map(rowToProperty);
}

export async function allTags(): Promise<string[]> {
  const all = await getAllProperties();
  return Array.from(new Set(all.flatMap((p) => p.tags))).sort();
}

export async function allCorridors(): Promise<string[]> {
  const all = await getAllProperties();
  return Array.from(new Set(all.map((p) => p.location.corridor))).sort();
}

export async function saveProperty(property: Property, opts: { isNew: boolean }): Promise<void> {
  const supabase = getSupabaseAdmin();
  const row = propertyToRow(property);
  // `fid`/`verified` are only in the row payload once the migration in
  // supabase/schema.sql has been run — if the columns don't exist yet, retry
  // without them rather than breaking property save entirely.
  const rowWithoutMigrationFields: Partial<PropertyRow> = { ...row };
  delete rowWithoutMigrationFields.fid;
  delete rowWithoutMigrationFields.verified;

  if (opts.isNew) {
    const { data: existing } = await supabase.from("properties").select("slug").eq("slug", property.slug).maybeSingle();
    if (existing) throw new Error(`A property with slug "${property.slug}" already exists.`);
    const { error } = await supabase.from("properties").insert(row);
    if (error) {
      if (!isMissingSchemaError(error)) throw error;
      const { error: retryError } = await supabase.from("properties").insert(rowWithoutMigrationFields);
      if (retryError) throw retryError;
    }
  } else {
    const { error } = await supabase.from("properties").update(row).eq("slug", property.slug);
    if (error) {
      if (!isMissingSchemaError(error)) throw error;
      const { error: retryError } = await supabase.from("properties").update(rowWithoutMigrationFields).eq("slug", property.slug);
      if (retryError) throw retryError;
    }
  }
}

export async function deleteProperty(slug: string): Promise<void> {
  const { error } = await getSupabaseAdmin().from("properties").delete().eq("slug", slug);
  if (error) throw error;
}

/** Next sequential "FID 0042"-style number — highest existing fid + 1, formatted to 4 digits. */
export async function nextFid(): Promise<string> {
  const { data, error } = await getSupabaseAdmin().from("properties").select("fid").not("fid", "is", null);
  if (error) {
    if (isMissingSchemaError(error)) return "0001"; // migration not run yet
    throw error;
  }
  const highest = (data as { fid: string | null }[]).reduce((max, row) => {
    const n = row.fid ? parseInt(row.fid, 10) : 0;
    return Number.isFinite(n) && n > max ? n : max;
  }, 0);
  return String(highest + 1).padStart(4, "0");
}
