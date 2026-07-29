import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin/is-admin";
import { isShortMapLink, parseMapLink } from "@/lib/map-link";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Follows a shortened map link far enough to read the coordinates out of it.
 *
 * The share button in Google Maps produces a maps.app.goo.gl URL that carries
 * no coordinates at all — they only appear once the redirect is followed, and
 * the browser cannot follow it because the response has no CORS headers. So it
 * happens here instead.
 */
export async function POST(request: Request) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { url?: string } | null;
  const url = (body?.url ?? "").trim();
  if (!url) return NextResponse.json({ error: "Paste a map link." }, { status: 400 });

  // Anything already carrying coordinates never needs a network call.
  const direct = parseMapLink(url);
  if (direct) return NextResponse.json(direct);

  if (!isShortMapLink(url)) {
    return NextResponse.json({ error: "No coordinates in that link." }, { status: 422 });
  }

  try {
    // Only ever a known shortener host, so this cannot be pointed at an
    // arbitrary internal address.
    const response = await fetch(url, {
      redirect: "follow",
      headers: { "User-Agent": "Mozilla/5.0 (compatible; aforacre/1.0)" },
      signal: AbortSignal.timeout(8000),
    });

    // The coordinates can end up in the final URL or, for some place links,
    // only in the page body.
    const resolved = parseMapLink(response.url) ?? parseMapLink(await response.text());
    if (!resolved) {
      return NextResponse.json(
        { error: "That link resolved, but had no coordinates. Open it in Maps and copy the full URL." },
        { status: 422 }
      );
    }
    return NextResponse.json(resolved);
  } catch {
    return NextResponse.json({ error: "Could not open that link. Paste the full Maps URL instead." }, { status: 502 });
  }
}
