// Karnataka land-measurement conversions, per the product spec: 40 gunta = 1 acre, 1 gunta ≈ 1100 sq ft.
export const GUNTA_PER_ACRE = 40;
export const SQFT_PER_GUNTA = 1100;

export function guntaToAcres(gunta: number): number {
  return gunta / GUNTA_PER_ACRE;
}

export function acresToGunta(acres: number): number {
  return acres * GUNTA_PER_ACRE;
}

export function guntaToSqft(gunta: number): number {
  return gunta * SQFT_PER_GUNTA;
}

export function pricePerGuntaToPricePerAcre(pricePerGunta: number): number {
  return Math.round(pricePerGunta * GUNTA_PER_ACRE);
}

/**
 * Sq ft per acre follows from the two constants above rather than the survey
 * acre's 43,560. Mixing the two would mean a plot's gunta figure and its sq ft
 * figure disagreed by about 1%, which is exactly the kind of discrepancy a
 * buyer notices on a listing and cannot explain.
 */
export const SQFT_PER_ACRE = GUNTA_PER_ACRE * SQFT_PER_GUNTA;

export function sqftToGunta(sqft: number): number {
  return sqft / SQFT_PER_GUNTA;
}

export function acresToSqft(acres: number): number {
  return acres * SQFT_PER_ACRE;
}

export function sqftToAcres(sqft: number): number {
  return sqft / SQFT_PER_ACRE;
}

/** Karnataka RTC extents are written acre-gunta, e.g. "0.39.00.00" is 0 acres 39 guntas. */
export function acreGuntaToAcres(acre: number, gunta: number): number {
  return acre + guntaToAcres(gunta);
}

export function acresToAcreGunta(acres: number): { acre: number; gunta: number } {
  const acre = Math.floor(acres);
  return { acre, gunta: Math.round((acres - acre) * GUNTA_PER_ACRE * 100) / 100 };
}
