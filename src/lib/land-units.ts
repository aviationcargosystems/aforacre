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
