import type { TaxBreakdown } from "@/lib/types";

// Karnataka registration & land charges, as applied to agricultural/converted
// land transactions around Bangalore Urban / Bangalore Rural districts.
// Rates reflect the commonly quoted 2025-26 figures:
//   Stamp duty: 5.6% (5% + 10% surcharge + 3% cess, blended) of guidance value or sale price, whichever is higher
//   Registration fee: 1% of guidance value or sale price, whichever is higher
// These are indicative, for illustration only — always confirm with a registered
// document writer / sub-registrar office before transacting.
export const KARNATAKA_STAMP_DUTY_RATE = 0.056;
export const KARNATAKA_REGISTRATION_RATE = 0.01;
export const KARNATAKA_CESS_SURCHARGE_RATE = 0.006; // folded out separately for display

export function computeKarnatakaTaxes(params: {
  totalPrice: number;
  guidanceValuePerAcre: number;
  extentAcres: number;
  dcConverted: boolean;
}): TaxBreakdown {
  const { totalPrice, guidanceValuePerAcre, extentAcres, dcConverted } = params;
  const guidanceValueTotal = guidanceValuePerAcre * extentAcres;
  const taxableValue = Math.max(totalPrice, guidanceValueTotal);

  const stampDuty = round(taxableValue * (KARNATAKA_STAMP_DUTY_RATE - KARNATAKA_CESS_SURCHARGE_RATE));
  const cessAndSurcharge = round(taxableValue * KARNATAKA_CESS_SURCHARGE_RATE);
  const registrationFee = round(taxableValue * KARNATAKA_REGISTRATION_RATE);
  const conversionCharges = dcConverted ? 0 : round(extentAcres * 15000); // approx DC conversion charge/acre if not yet converted
  const estimatedAnnualLandRevenue = round(extentAcres * 450); // nominal agricultural land revenue

  const total = stampDuty + cessAndSurcharge + registrationFee + conversionCharges;

  return {
    guidanceValuePerAcre,
    stampDutyRate: KARNATAKA_STAMP_DUTY_RATE,
    registrationRate: KARNATAKA_REGISTRATION_RATE,
    stampDuty,
    registrationFee,
    conversionCharges,
    estimatedAnnualLandRevenue,
    cessAndSurcharge,
    total,
    lineItems: [
      { label: "Stamp duty (5%)", amount: stampDuty, note: "On higher of sale price or guidance value" },
      { label: "Cess & surcharge (0.6%)", amount: cessAndSurcharge },
      { label: "Registration fee (1%)", amount: registrationFee },
      {
        label: dcConverted ? "DC conversion charges" : "DC conversion charges (est., not yet converted)",
        amount: conversionCharges,
        note: dcConverted ? "Already converted — no charge due" : "₹15,000/acre indicative, payable to convert to non-agricultural use",
      },
    ],
  };
}

function round(n: number) {
  return Math.round(n / 100) * 100;
}

export function formatINR(amount: number): string {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(amount % 10000000 === 0 ? 0 : 2)} Cr`;
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(amount % 100000 === 0 ? 0 : 2)} L`;
  }
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function formatINRFull(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}
