import type { LegalStatus, RtcRecord } from "@/lib/types";

/**
 * Reading RTCs off a property, whatever shape the row happens to be in.
 *
 * `legal` is a jsonb blob, so rows predating `rtcRecords` were never migrated
 * and still carry the flat `surveyNumber` / `rtcDocument` / `hobli` fields.
 * Every read goes through here so no caller has to know which era a row is
 * from, and so a property saved years apart renders the same either way.
 */

export const EMPTY_RTC_RECORD: RtcRecord = {
  surveyNumber: "",
  document: "",
  hobli: "",
  taluk: "",
  district: "",
  mutationReference: "",
  rtcValidFrom: "",
  landRevenueRupees: "",
  ownerOnRecord: "",
};

export function makeRtcRecord(partial: Partial<RtcRecord> = {}): RtcRecord {
  return { ...EMPTY_RTC_RECORD, ...partial };
}

/** True when nothing was actually entered — used to drop blank trailing cards. */
export function isBlankRtcRecord(record: RtcRecord): boolean {
  return Object.values(record).every((value) => !String(value ?? "").trim());
}

/**
 * The RTCs on a property, newest shape first, falling back to the legacy flat
 * fields. Returns `[]` rather than a blank record when a property genuinely has
 * no RTC recorded, so callers can distinguish "none" from "one empty one".
 */
export function rtcRecordsOf(legal: Partial<LegalStatus> | null | undefined): RtcRecord[] {
  if (!legal) return [];

  const records = Array.isArray(legal.rtcRecords) ? legal.rtcRecords : [];
  const usable = records.map(makeRtcRecord).filter((record) => !isBlankRtcRecord(record));
  if (usable.length > 0) return usable;

  const legacy = makeRtcRecord({
    surveyNumber: legal.surveyNumber ?? "",
    document: legal.rtcDocument ?? "",
    hobli: legal.hobli ?? "",
    taluk: legal.taluk ?? "",
    district: legal.district ?? "",
    mutationReference: legal.mutationReference ?? "",
    rtcValidFrom: legal.rtcValidFrom ?? "",
    landRevenueRupees: legal.landRevenueRupees ?? "",
    ownerOnRecord: legal.ownerOnRecord ?? "",
  });

  return isBlankRtcRecord(legacy) ? [] : [legacy];
}

/** Survey numbers, in entry order, blanks dropped. Safe for public surfaces. */
export function surveyNumbersOf(legal: Partial<LegalStatus> | null | undefined): string[] {
  return rtcRecordsOf(legal)
    .map((record) => record.surveyNumber.trim())
    .filter(Boolean);
}

/**
 * Survey numbers as one line, e.g. "44/2, 44/3, 45/1".
 * `fallback` is what to show when a property has none recorded yet.
 */
export function formatSurveyNumbers(
  legal: Partial<LegalStatus> | null | undefined,
  fallback = "Not provided"
): string {
  const numbers = surveyNumbersOf(legal);
  return numbers.length > 0 ? numbers.join(", ") : fallback;
}

/** Stored RTC scans, blanks dropped. Admin-only — these name the owner. */
export function rtcDocumentsOf(legal: Partial<LegalStatus> | null | undefined): string[] {
  return rtcRecordsOf(legal)
    .map((record) => record.document.trim())
    .filter(Boolean);
}

/**
 * Mirrors record[0] back onto the flat legacy fields on write.
 *
 * Nothing in the app should read these any more, but a saved row is also read
 * by SQL consoles, exports and the Supabase table view, and leaving them frozen
 * at a stale first RTC would be worse than keeping them in step.
 */
export function withLegacyRtcFields<T extends { rtcRecords: RtcRecord[] }>(legal: T): T & Partial<LegalStatus> {
  const [first] = legal.rtcRecords;
  if (!first) return legal;

  return {
    ...legal,
    surveyNumber: first.surveyNumber,
    rtcDocument: first.document,
    hobli: first.hobli,
    taluk: first.taluk,
    district: first.district,
    mutationReference: first.mutationReference,
    rtcValidFrom: first.rtcValidFrom,
    landRevenueRupees: first.landRevenueRupees,
    ownerOnRecord: first.ownerOnRecord,
  };
}
