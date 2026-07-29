import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin/is-admin";
import { distanceFromBengaluru } from "@/lib/distance";

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

  return NextResponse.json(await distanceFromBengaluru(lat, lng));
}
