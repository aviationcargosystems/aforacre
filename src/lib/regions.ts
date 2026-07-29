/**
 * The belt we actually work in, named and placed.
 *
 * "South Bangalore" is too vague to mean anything to someone deciding where to
 * spend a crore. Naming the villages is the specific version of the same claim,
 * and a pin makes it checkable.
 *
 * Coordinates are settlement level, geocoded once against OpenStreetMap and
 * hardcoded here for the same reason the growth anchors are: they do not
 * change, and a geocoding call in the request path would be a dependency for no
 * benefit.
 *
 * `lat`/`lng` are deliberately optional. Four of these villages return nothing
 * from OpenStreetMap, and a pin guessed from a name is worse than no pin: it
 * would put a confident dot on a map in the wrong field. Those regions render
 * as plain chips until someone who knows the ground supplies the coordinate.
 */

export interface CoreRegion {
  name: string;
  lat?: number;
  lng?: number;
}

export const CORE_REGIONS: CoreRegion[] = [
  { name: "Harohalli", lat: 12.6801, lng: 77.4697 },
  { name: "Maralavadi" },
  { name: "Dodda Maralavadi", lat: 12.6156, lng: 77.522 },
  { name: "Thattekere", lat: 12.6729, lng: 77.5738 },
  { name: "Kaggalipura", lat: 12.809, lng: 77.5097 },
  { name: "Kalanakuppe" },
  { name: "Sheetalwadi" },
  { name: "Anekal interiors", lat: 12.7103, lng: 77.6886 },
  { name: "Bannerghatta surroundings" },
];

export function isPlaced(region: CoreRegion): region is CoreRegion & { lat: number; lng: number } {
  return typeof region.lat === "number" && typeof region.lng === "number";
}
