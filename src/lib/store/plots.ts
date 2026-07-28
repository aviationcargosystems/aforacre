import { getSupabaseAdmin, isMissingSchemaError } from "@/lib/supabase/server";
import type { MatchablePlot } from "@/lib/match";
import type { PlotUseCase } from "@/lib/plots/use-cases";
import type { Property } from "@/lib/types";
import { getAllProperties } from "@/lib/store/properties";

interface PlotRow {
  id: string;
  fid: string;
  title: string;
  area_acres: number;
  price_total: number;
  corridor: string;
  village: string;
  lat: number | null;
  lng: number | null;
  water: string;
  road_access: string;
}

interface SuitabilityRow {
  plot_id: string;
  use_case: PlotUseCase;
  score: number;
  rationale: string;
}

interface MediaRow {
  plot_id: string;
  storage_path: string;
}

/**
 * Live plots in the shape the match engine wants.
 *
 * Falls back to the legacy properties table when plots is empty, so the match
 * flow works before the data migration has been decided. The bridge is marked
 * clearly and comes out once plots is populated: see adaptLegacyProperty.
 */
export async function getMatchablePlots(): Promise<MatchablePlot[]> {
  const supabase = getSupabaseAdmin();

  const { data: plotRows, error } = await supabase
    .from("plots")
    .select("id, fid, title, area_acres, price_total, corridor, village, lat, lng, water, road_access")
    .eq("status", "live");

  if (error && !isMissingSchemaError(error)) throw error;

  const rows = (plotRows ?? []) as PlotRow[];
  if (rows.length === 0) {
    const properties = await getAllProperties();
    return properties.map(adaptLegacyProperty);
  }

  const ids = rows.map((row) => row.id);
  const [{ data: suitabilityRows }, { data: mediaRows }] = await Promise.all([
    supabase.from("plot_suitability").select("plot_id, use_case, score, rationale").in("plot_id", ids),
    supabase.from("plot_media").select("plot_id, storage_path").in("plot_id", ids).order("sort_order"),
  ]);

  const suitabilityByPlot = new Map<string, MatchablePlot["suitability"]>();
  ((suitabilityRows ?? []) as SuitabilityRow[]).forEach((row) => {
    const existing = suitabilityByPlot.get(row.plot_id) ?? {};
    existing[row.use_case] = { score: row.score, rationale: row.rationale };
    suitabilityByPlot.set(row.plot_id, existing);
  });

  const mediaByPlot = new Map<string, string[]>();
  ((mediaRows ?? []) as MediaRow[]).forEach((row) => {
    mediaByPlot.set(row.plot_id, [...(mediaByPlot.get(row.plot_id) ?? []), row.storage_path]);
  });

  return rows.map((row) => {
    const suitability = suitabilityByPlot.get(row.id) ?? {};
    return {
      id: row.id,
      fid: row.fid,
      title: row.title,
      areaAcres: Number(row.area_acres),
      priceTotal: Number(row.price_total),
      corridor: row.corridor,
      village: row.village,
      lat: row.lat === null ? null : Number(row.lat),
      lng: row.lng === null ? null : Number(row.lng),
      suitability,
      searchText: buildSearchText([
        row.title,
        row.corridor,
        row.village,
        ...Object.values(suitability).map((entry) => entry?.rationale ?? ""),
      ]),
      water: row.water,
      roadAccess: row.road_access,
      images: mediaByPlot.get(row.id) ?? [],
    };
  });
}

function buildSearchText(parts: string[]): string {
  return parts.filter(Boolean).join(" ").toLowerCase();
}

/**
 * Temporary bridge from the legacy properties table.
 *
 * The old data has curated scores for four use cases only. The three the new
 * schema added (farmhouse, investment, organic) have no data behind them, so
 * they are left absent rather than invented: the match engine treats a missing
 * use case as neutral and says nothing about it, which is honest. Inventing a
 * number here would put a fabricated score in front of a buyer.
 *
 * Remove this once plots is populated and the data-migration question is
 * settled.
 */
function adaptLegacyProperty(property: Property): MatchablePlot {
  const suitability: MatchablePlot["suitability"] = {
    polyhouse: {
      score: property.useCaseFit.polyhouse,
      rationale: property.suitability.polyhouse.note,
    },
    commercial: {
      score: property.useCaseFit["commercial-farming"],
      rationale: property.suitability.openFarming.note,
    },
    retirement: {
      score: property.useCaseFit.retirement,
      rationale: property.suitability.residentialFarmhouse.note,
    },
    getaway: {
      score: property.useCaseFit.getaway,
      rationale: property.suitability.getaway.note,
    },
  };

  return {
    // The legacy table has no FID for every row, so the slug stands in for
    // routing. Real FIDs arrive with the migration.
    id: property.slug,
    fid: property.fid ?? property.slug,
    title: property.title,
    areaAcres: property.extentAcres,
    priceTotal: property.totalPrice,
    corridor: property.location.corridor,
    village: property.location.area,
    lat: property.location.lat,
    lng: property.location.lng,
    suitability,
    searchText: buildSearchText([
      property.title,
      property.description,
      property.location.corridor,
      property.location.area,
      property.roadAccess,
      ...property.tags,
      ...property.nearbyLandmarks,
      ...Object.values(suitability).map((entry) => entry?.rationale ?? ""),
    ]),
    water: property.waterSources.includes("borewell") ? "borewell_tested" : "none",
    roadAccess: property.roadAccess.toLowerCase().includes("tar") ? "tar" : "mud",
    images: property.images,
  };
}

/** True while the match flow is still reading legacy rows. */
export async function isUsingLegacyPlots(): Promise<boolean> {
  const { data, error } = await getSupabaseAdmin().from("plots").select("id").eq("status", "live").limit(1);
  if (error) return true;
  return (data ?? []).length === 0;
}
