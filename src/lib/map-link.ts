/**
 * Coordinates out of a map link.
 *
 * The share button in Google Maps hands you a shortened URL, and the address
 * bar hands you a long one; both are what someone actually has when they say
 * "here is the plot". Typing latitude and longitude by hand from either is a
 * transcription step with nothing to gain and a digit to lose.
 */

/** Matches the `@lat,lng` and `q=lat,lng` forms, plus a bare "12.68, 77.47" paste. */
const PATTERNS = [
  /@(-?\d+\.\d+),(-?\d+\.\d+)/,
  /[?&](?:q|query|ll|center|daddr)=(-?\d+\.\d+),\s*(-?\d+\.\d+)/,
  /\/(-?\d+\.\d+),(-?\d+\.\d+)/,
  /^\s*(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)\s*$/,
  // Google's "!3dLAT!4dLNG" place encoding, which is the only coordinate in
  // some /place/ URLs once the @ part has been rewritten to a viewport.
  /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/,
];

export interface ParsedPoint {
  lat: number;
  lng: number;
}

export function parseMapLink(input: string): ParsedPoint | null {
  const text = input.trim();
  if (!text) return null;

  for (const pattern of PATTERNS) {
    const match = text.match(pattern);
    if (!match) continue;
    const lat = Number(match[1]);
    const lng = Number(match[2]);
    if (isPlausible(lat, lng)) return { lat, lng };
  }
  return null;
}

function isPlausible(lat: number, lng: number): boolean {
  return Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180;
}

/**
 * True for the shortened forms, which carry no coordinates at all — they have
 * to be followed server-side before there is anything to parse.
 */
export function isShortMapLink(input: string): boolean {
  return /(maps\.app\.goo\.gl|goo\.gl\/maps|g\.co\/kgs)/i.test(input);
}
