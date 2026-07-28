/**
 * The three public infrastructure projects that define our selection criteria.
 *
 * We do not list land across Bangalore. We list it inside these three rings.
 *
 * Coordinates are village and site level, geocoded once and hardcoded here
 * rather than looked up at runtime: they do not change, and a geocoding call in
 * the request path would be a dependency for no benefit. They are accurate to
 * roughly the settlement centroid, which is the right precision for a "how far
 * is this plot" figure quoted to one decimal place.
 */

export type AnchorId = "iimb" | "stadium" | "airport";

/** How certain the project is. Drives chip weight, which must not overstate. */
export type AnchorCertainty = "under_construction" | "cabinet_approved" | "under_evaluation";

export interface GrowthAnchor {
  id: AnchorId;
  /** Ordinal shown on the map pin and the card. */
  index: "01" | "02" | "03";
  certainty: AnchorCertainty;
  chipLabel: string;
  title: string;
  place: string;
  body: string;
  nearestListings: string;
  lat: number;
  lng: number;
  /** Rendered on every surface that mentions this anchor. Never optional. */
  disclaimer?: string;
}

export const CERTAINTY_LABEL: Record<AnchorCertainty, string> = {
  under_construction: "Under construction",
  cabinet_approved: "Cabinet approved",
  under_evaluation: "Under evaluation",
};

export const GROWTH_ANCHORS: GrowthAnchor[] = [
  {
    id: "iimb",
    index: "01",
    certainty: "under_construction",
    chipLabel: "UNDER CONSTRUCTION",
    title: "IIM Bangalore, second campus",
    place: "Mahanthalingapura, Jigani, Anekal Taluk",
    body: "110 acres. The Management Development Centre is already built and operational. The undergraduate campus, a ₹450 crore build across 42.42 acres, went out to tender in late 2025.",
    nearestListings: "Jigani, Bannerghatta",
    lat: 12.7847,
    lng: 77.6408,
  },
  {
    id: "stadium",
    index: "02",
    certainty: "cabinet_approved",
    chipLabel: "CABINET APPROVED",
    title: "International cricket stadium and sports complex",
    place: "Suryanagar 4th Stage, Indlavadi, Anekal Taluk",
    body: "75 acres. ₹2,350 crore. 80,000 seats and facilities for 24 sports. Cleared in-principle by the Karnataka Cabinet. Detailed project report in progress.",
    nearestListings: "Attibele, Anekal",
    lat: 12.755,
    lng: 77.69,
  },
  {
    id: "airport",
    index: "03",
    certainty: "under_evaluation",
    chipLabel: "UNDER EVALUATION",
    title: "Bengaluru's second airport",
    place: "Kanakapura Road corridor",
    body: "Three sites shortlisted, two of them on Kanakapura Road at 4,800 and 5,000 acres. AAI has inspected. Feasibility consultancy appointed. Harohalli is currently the front runner. Site not yet finalised.",
    nearestListings: "Kanakapura Road, Harohalli, Kaggalipura",
    // Provisional. The site is not finalised, so this is the Harohalli front
    // runner's location and must be treated as indicative only. If the shortlist
    // resolves elsewhere, this coordinate and every distance derived from it
    // change.
    lat: 12.635,
    lng: 77.475,
    disclaimer: "Site not yet finalised.",
  },
];

/** Distances beyond this are too weak to be worth quoting, so they are hidden. */
export const MAX_RELEVANT_ANCHOR_KM = 40;

export function getAnchor(id: AnchorId): GrowthAnchor {
  const anchor = GROWTH_ANCHORS.find((entry) => entry.id === id);
  if (!anchor) throw new Error(`Unknown growth anchor: ${id}`);
  return anchor;
}

const EARTH_RADIUS_KM = 6371;

/** Great-circle distance in kilometres. */
export function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

export interface AnchorDistance {
  anchor: GrowthAnchor;
  km: number;
}

/**
 * This plot's distance to each anchor, nearest first, dropping anything beyond
 * MAX_RELEVANT_ANCHOR_KM. A 60km number invites the reader to treat a
 * coincidence as a reason.
 */
export function anchorDistancesFor(point: { lat: number | null; lng: number | null }): AnchorDistance[] {
  if (point.lat === null || point.lng === null) return [];
  const origin = { lat: point.lat, lng: point.lng };

  return GROWTH_ANCHORS.map((anchor) => ({ anchor, km: haversineKm(origin, anchor) }))
    .filter((entry) => entry.km <= MAX_RELEVANT_ANCHOR_KM)
    .sort((a, b) => a.km - b.km);
}
