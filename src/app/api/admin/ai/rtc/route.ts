import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin/is-admin";
import { AiUnavailableError, aiConfigured } from "@/lib/ai/client";
import { extractRtc } from "@/lib/ai/rtc";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Comfortably above a phone photo of an A4 sheet, well below the API's 5 MB per-image limit. */
const MAX_BYTES = 4 * 1024 * 1024;

export async function POST(request: Request) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  if (!aiConfigured()) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY is not set, so RTC reading is switched off. Add it to .env.local and restart." },
      { status: 503 }
    );
  }

  const form = await request.formData();
  const file = form.get("rtc");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Attach the RTC scan as `rtc`." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "That scan is over 4 MB. Re-save it smaller and try again." }, { status: 413 });
  }

  try {
    const base64 = Buffer.from(await file.arrayBuffer()).toString("base64");
    const result = await extractRtc(base64, file.type);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof AiUnavailableError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    // The message is admin-facing only, so the real reason is more useful than a generic one.
    const message = error instanceof Error ? error.message : "Could not read that RTC.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
