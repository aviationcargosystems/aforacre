import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin/is-admin";
import { AiUnavailableError, aiConfigured } from "@/lib/ai/client";
import { suggestFromPin } from "@/lib/ai/location";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
/** Web search plus two model calls; the default 15s would cut it off mid-research. */
export const maxDuration = 120;

export async function POST(request: Request) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  if (!aiConfigured()) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY is not set, so autofill is switched off. Add it to .env.local and restart." },
      { status: 503 }
    );
  }

  const body = (await request.json().catch(() => null)) as { lat?: number; lng?: number } | null;
  const lat = Number(body?.lat);
  const lng = Number(body?.lng);

  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    return NextResponse.json({ error: "Drop a pin first, or type a valid latitude and longitude." }, { status: 400 });
  }

  try {
    return NextResponse.json(await suggestFromPin(lat, lng));
  } catch (error) {
    if (error instanceof AiUnavailableError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    const message = error instanceof Error ? error.message : "Could not research that location.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
