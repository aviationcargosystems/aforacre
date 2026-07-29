import { AI_MODEL, anthropic, textOf } from "./client";
import { anchorDistancesFor } from "@/lib/anchors";
import { distanceFromBengaluru } from "@/lib/distance";

/**
 * Turning a dropped pin into a draft listing.
 *
 * Two things happen here, and they are kept apart on purpose. The hard facts of
 * where a point is — village, hobli, taluk, district — come from OpenStreetMap's
 * reverse geocoder, which is authoritative and free. Only the softer,
 * descriptive material that no gazetteer holds is asked of the model, and it is
 * given web search so it can look rather than recall.
 *
 * Everything returned is a draft for the admin to accept, edit or throw away.
 * Nothing is written to a listing without a human pressing save, which is the
 * same standard we hold the rest of the catalogue to: we do not publish a number
 * we cannot defend.
 */

export interface LocationSuggestion {
  title: string;
  area: string;
  corridor: string;
  district: string;
  taluk: string;
  hobli: string;
  distanceFromBangaloreKm: number;
  /** Minutes by road, when the route could be measured. */
  driveMinutes: number | null;
  /** Whether the distance was routed or is a straight line. */
  distanceMethod: "road" | "straight-line";
  nearbyLandmarks: string[];
  /** Chosen from the catalogue's existing tags, never invented. */
  tags: string[];
  soilType: string;
  description: string;
  /** Anything the research could not establish, so the admin knows where to look themselves. */
  uncertain: string[];
  sources: string[];
}

interface NominatimAddress {
  village?: string;
  hamlet?: string;
  town?: string;
  suburb?: string;
  city_district?: string;
  county?: string;
  state_district?: string;
  state?: string;
}

/** Settlement-level reverse geocode. Free, no key, and the right authority for administrative names. */
async function reverseGeocode(lat: number, lng: number) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&zoom=14&lat=${lat}&lon=${lng}`;
  const response = await fetch(url, {
    headers: { "User-Agent": "aforacre/1.0 (admin property tooling)" },
    // These never change for a fixed coordinate, so let the platform cache them.
    next: { revalidate: 86400 },
  });
  if (!response.ok) return null;
  const data = (await response.json()) as { display_name?: string; address?: NominatimAddress };
  const a = data.address ?? {};
  return {
    displayName: data.display_name ?? "",
    settlement: a.village || a.hamlet || a.town || a.suburb || a.city_district || "",
    taluk: a.county || "",
    district: a.state_district || "",
    state: a.state || "",
  };
}

const STRING = { type: "string" } as const;

const SUGGESTION_SCHEMA = {
  type: "object",
  properties: {
    title: STRING,
    area: STRING,
    corridor: STRING,
    district: STRING,
    taluk: STRING,
    hobli: STRING,
    nearbyLandmarks: { type: "array", items: STRING },
    tags: { type: "array", items: STRING },
    soilType: STRING,
    description: STRING,
    uncertain: { type: "array", items: STRING },
  },
  required: [
    "title",
    "area",
    "corridor",
    "district",
    "taluk",
    "hobli",
    "nearbyLandmarks",
    "tags",
    "soilType",
    "description",
    "uncertain",
  ],
  additionalProperties: false,
} as const;

export async function suggestFromPin(
  lat: number,
  lng: number,
  availableTags: string[] = []
): Promise<LocationSuggestion> {
  // Both are measurements, so both are computed rather than researched.
  const [place, distance] = await Promise.all([reverseGeocode(lat, lng), distanceFromBengaluru(lat, lng)]);
  const anchors = anchorDistancesFor({ lat, lng });

  const anchorContext = anchors.length
    ? anchors.map((d) => `${d.anchor.title}: ${d.km.toFixed(1)} km`).join("; ")
    : "no growth anchor within 40 km";

  // Step one: look things up. Kept separate from the structuring call because
  // search results carry citations, which cannot be combined with a constrained
  // output format in one request.
  const research = await anthropic().messages.create({
    model: AI_MODEL,
    max_tokens: 4000,
    thinking: { type: "adaptive" },
    system: `You research farmland locations in south Bengaluru for a land listing catalogue. Search the web before answering; do not rely on memory for anything specific.

Report only what you can support. If you cannot establish a fact — the soil type of a particular village, the exact distance by road — say so plainly instead of estimating. This catalogue's standing rule is that it does not publish a number it cannot defend, and that applies to your research too.

Do not comment on land prices, appreciation, or investment returns. Public price data for this belt is unreliable and we do not ship figures we cannot stand behind.`,
    tools: [{ type: "web_search_20260209", name: "web_search", max_uses: 6 }],
    messages: [
      {
        role: "user",
        content: `A plot sits at ${lat.toFixed(5)}, ${lng.toFixed(5)} in Karnataka, India.

OpenStreetMap reverse geocode for that point:
- Settlement: ${place?.settlement || "unknown"}
- Taluk: ${place?.taluk || "unknown"}
- District: ${place?.district || "unknown"}
- Full: ${place?.displayName || "unavailable"}

Straight-line distance to the infrastructure projects we track: ${anchorContext}.
Distance from central Bengaluru: ${distance.km} km${
          distance.driveMinutes ? ` (about ${distance.driveMinutes} minutes by road)` : ""
        }. This is already measured — use it as context, do not restate or re-estimate it.

Research and report:
1. The hobli this settlement falls under, if you can establish it.
2. Which road corridor it is approached by (for example Kanakapura Road, Bannerghatta Road, Anekal Road).
3. Real, named nearby landmarks within about 10 km — lakes, reservoirs, hills, forests, temples, towns. Give each as "Name — approximate distance".
4. The predominant soil type of the area, only if a credible source states it.
5. Three or four sentences describing the setting, in plain prose, for someone who has never been there.
6. Which of these existing catalogue tags plausibly apply to land at this location, based only on what you established above: ${
          availableTags.length ? availableTags.join(", ") : "(none configured)"
        }. Choose only from that list, never invent one, and leave it empty rather than guessing — a tag is a filter a buyer relies on.
7. A listing title for a plot here, following the house style: a defining feature, the word Plot or Farm or Farmland, then the place. For example "Lakeview Plot, Anekal" or "Hillside Plot Near Chunchi Falls". Do not invent an acreage or a price into the title — the extent is entered separately and gets prefixed to the title later.

Note anything you could not establish.`,
      },
    ],
  });

  const findings = textOf(research.content);

  const sources = research.content
    .filter((block) => block.type === "web_search_tool_result")
    .flatMap((block) => {
      const results = (block as { content?: unknown }).content;
      return Array.isArray(results)
        ? results.map((r) => (r as { url?: string }).url).filter((u): u is string => Boolean(u))
        : [];
    });

  // Step two: shape the findings into the fields the form actually has.
  const structured = await anthropic().messages.create({
    model: AI_MODEL,
    max_tokens: 2000,
    system:
      "Convert the research notes into the given schema. Use empty strings and empty arrays for anything the notes did not establish, and list those field names in `uncertain`. Do not add facts that are not in the notes. `tags` must contain only tags the notes explicitly named.",
    output_config: { format: { type: "json_schema", schema: SUGGESTION_SCHEMA } },
    messages: [{ role: "user", content: findings }],
  });

  const text = structured.content.find((block) => block.type === "text");
  if (!text || text.type !== "text") throw new Error("The model returned no usable suggestions for this pin.");

  const parsed = JSON.parse(text.text) as Omit<
    LocationSuggestion,
    "sources" | "distanceFromBangaloreKm" | "driveMinutes" | "distanceMethod"
  >;

  return {
    ...parsed,
    distanceFromBangaloreKm: distance.km,
    driveMinutes: distance.driveMinutes,
    distanceMethod: distance.method,
    // Prefer the geocoder over the model for the administrative names it knows.
    area: place?.settlement || parsed.area,
    district: place?.district || parsed.district,
    taluk: place?.taluk || parsed.taluk,
    // Belt and braces: the model was told to pick from the list, and anything
    // that still came back off-list is dropped rather than created.
    tags: parsed.tags.filter((tag) => availableTags.includes(tag)),
    sources: Array.from(new Set(sources)),
  };
}
