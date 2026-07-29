import { haversineKm } from "@/lib/anchors";

/**
 * How far a plot is from the city, measured rather than estimated.
 *
 * This used to be part of what the pin research asked the model for, which was
 * the wrong tool for it: we have both coordinates, so the answer is a
 * calculation, not a judgement. A model asked for "approximate road distance"
 * produces a number that looks authoritative and cannot be checked.
 *
 * Road distance comes from OSRM, which routes on real OpenStreetMap geometry
 * and needs no key. Straight-line is the fallback, and the two are never
 * conflated: a plot 40 km away as the crow flies is usually a 50 km drive
 * through this belt, and quoting the former as travel distance would understate
 * every listing. The caller is told which one it got.
 */

/** Vidhana Soudha, the conventional centre for "distance from Bengaluru". */
export const BENGALURU_CENTRE = { lat: 12.9794, lng: 77.5912 };

export interface DistanceResult {
  km: number;
  /** Driving time in minutes, only available from the routed measurement. */
  driveMinutes: number | null;
  method: "road" | "straight-line";
}

interface OsrmResponse {
  code?: string;
  routes?: { distance?: number; duration?: number }[];
}

export async function distanceFromBengaluru(lat: number, lng: number): Promise<DistanceResult> {
  const straightLine = haversineKm(BENGALURU_CENTRE, { lat, lng });

  try {
    // OSRM takes lng,lat order — reversed from every other coordinate in this
    // codebase, and a silent source of wrong answers if copied carelessly.
    const url =
      `https://router.project-osrm.org/route/v1/driving/` +
      `${BENGALURU_CENTRE.lng},${BENGALURU_CENTRE.lat};${lng},${lat}?overview=false`;

    const response = await fetch(url, {
      signal: AbortSignal.timeout(6000),
      next: { revalidate: 86400 },
    });
    if (!response.ok) throw new Error(`OSRM ${response.status}`);

    const data = (await response.json()) as OsrmResponse;
    const route = data.code === "Ok" ? data.routes?.[0] : undefined;
    if (typeof route?.distance !== "number") throw new Error("no route");

    return {
      km: Math.round(route.distance / 1000),
      driveMinutes: typeof route.duration === "number" ? Math.round(route.duration / 60) : null,
      method: "road",
    };
  } catch {
    // The public OSRM instance has no SLA. Falling back is fine; quietly
    // presenting a straight line as a drive is not, hence `method`.
    return { km: Math.round(straightLine), driveMinutes: null, method: "straight-line" };
  }
}
