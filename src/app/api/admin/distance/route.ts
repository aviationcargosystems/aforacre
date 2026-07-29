import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin/is-admin";
import { distanceFromBengaluru } from "@/lib/distance";
import { reverseGeocode } from "@/lib/ai/location";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Distance from a pin, on its own.
 *
 * The pin-research route computes this too, but that costs two model calls and
 * a web search. Distance needs neither — it is a routing lookup — so dropping a
 * pin can fill the field immediately, without anyone pressing anything and
 * without an API key being configured at all.
 */
export async function POST(request: Request) {
  if (!(await isAdminRequest())) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const body = (await request.json().catch(() => null)) as { lat?: number; lng?: number } | null;
  const lat = Number(body?.lat);
  const lng = Number(body?.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json({ error: "Need a latitude and longitude." }, { status: 400 });
  }

  // Both are lookups, not judgements, so a dropped pin can fill them with no
  // model call and no API key. Corridor stays behind Read this pin, because
  // naming the approach road genuinely is a judgement.
  const [distance, place] = await Promise.all([
    distanceFromBengaluru(lat, lng),
    reverseGeocode(lat, lng).catch(() => null),
  ]);

  return NextResponse.json({
    ...distance,
    area: place?.settlement || undefined,
    taluk: place?.taluk || undefined,
    district: place?.district || undefined,
  });
}
