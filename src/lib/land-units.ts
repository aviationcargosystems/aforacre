// Karnataka land-measurement conversions: 40 gunta = 1 acre, 1 gunta = 1089 sq ft.
//
// The spec document said 1100, which is a rounding that does not survive
// multiplication: 40 x 1100 is 44,000 sq ft, about 1% more than an acre. 1089 is
// the standard figure and reconciles exactly, since 40 x 1089 = 43,560, the
// survey acre. Nothing stored changes — extent is held in acres and guntas are
// still 40 to the acre — only the square-foot figure shown alongside them.
export const GUNTA_PER_ACRE = 40;
export const SQFT_PER_GUNTA = 1089;

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

/** 43,560 — the survey acre, and exactly what the two constants above multiply to. */
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
