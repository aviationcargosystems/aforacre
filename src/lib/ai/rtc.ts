import { AI_MODEL, anthropic } from "./client";
import { acreGuntaToAcres } from "@/lib/land-units";

/**
 * Reading a Karnataka RTC (Record of Rights, Tenancy and Crops — Village
 * Account Form No. 2).
 *
 * The form is printed in Kannada, so this is a translation job as much as an
 * extraction one. Every field comes back with both the Kannada as printed and a
 * Latin transliteration: the Kannada is the evidence, the transliteration is
 * what we can put in a form field, and keeping both means a reviewer can check
 * one against the other without opening the scan again.
 *
 * Nothing extracted here is treated as fact. An RTC is a legal document and a
 * misread survey number or extent is the kind of error that survives all the way
 * to a sale deed, so every value is surfaced to the admin as a proposal they
 * confirm. `confidence` and `unreadableFields` exist to make the doubtful ones
 * obvious rather than letting them blend in with the rest.
 */

export interface RtcOwner {
  nameKannada: string;
  nameLatin: string;
  /** "D/o Krishnaiah K", "S/o ...", or "" when the form does not give one. */
  relation: string;
}

export interface RtcExtraction {
  surveyNumber: string;
  hissaNumber: string;
  villageKannada: string;
  villageLatin: string;
  hobliKannada: string;
  hobliLatin: string;
  talukKannada: string;
  talukLatin: string;
  district: string;
  owners: RtcOwner[];
  /** As printed on the form: acres and guntas are separate columns. */
  extentAcre: string;
  extentGunta: string;
  landRevenueRupees: string;
  mutationReference: string;
  /** e.g. "Khushki" (dry), "Bagayat" (garden), "Tari" (wet). */
  landClassification: string;
  validFrom: string;
  confidence: "high" | "medium" | "low";
  unreadableFields: string[];
  notes: string;
}

/** Empty string means "not present or not legible" throughout, so there is one rule for missing data. */
const STRING = { type: "string" } as const;

const RTC_SCHEMA = {
  type: "object",
  properties: {
    surveyNumber: STRING,
    hissaNumber: STRING,
    villageKannada: STRING,
    villageLatin: STRING,
    hobliKannada: STRING,
    hobliLatin: STRING,
    talukKannada: STRING,
    talukLatin: STRING,
    district: STRING,
    owners: {
      type: "array",
      items: {
        type: "object",
        properties: { nameKannada: STRING, nameLatin: STRING, relation: STRING },
        required: ["nameKannada", "nameLatin", "relation"],
        additionalProperties: false,
      },
    },
    extentAcre: STRING,
    extentGunta: STRING,
    landRevenueRupees: STRING,
    mutationReference: STRING,
    landClassification: STRING,
    validFrom: STRING,
    confidence: { type: "string", enum: ["high", "medium", "low"] },
    unreadableFields: { type: "array", items: STRING },
    notes: STRING,
  },
  required: [
    "surveyNumber",
    "hissaNumber",
    "villageKannada",
    "villageLatin",
    "hobliKannada",
    "hobliLatin",
    "talukKannada",
    "talukLatin",
    "district",
    "owners",
    "extentAcre",
    "extentGunta",
    "landRevenueRupees",
    "mutationReference",
    "landClassification",
    "validFrom",
    "confidence",
    "unreadableFields",
    "notes",
  ],
  additionalProperties: false,
} as const;

const SYSTEM = `You read Karnataka RTC documents (Record of Rights, Tenancy and Crops — Village Account Form No. 2, ಪಹಣಿ). They are printed in Kannada.

Read only what is actually printed on the document. If a column is blank, illegible, or you are unsure, return an empty string for it and name that field in unreadableFields. Never infer a value from context, never complete a partial number, and never carry a value across from a similar document you have seen before. A wrong survey number or extent on this form propagates into a sale deed, so an empty field is always better than a confident guess.

Field guide:
- Survey number (ಸರ್ವೆ ಸಂಖ್ಯೆ) and Hissa (ಹಿಸ್ಸಾ) are in the top-left block.
- Taluk (ತಾಲ್ಲೂಕು), Hobli (ಹೋಬಳಿ) and Village (ಗ್ರಾಮ) run across the header.
- Extent sits under the ಎಕರೆ / ಗುಂಟೆ (acre / gunta) headings and is usually written in a dotted group such as 0.39.00.00, which means 0 acres and 39 guntas. Return the acre part and the gunta part separately.
- Land revenue (ಭೂ ಕಂದಾಯ) is a rupee figure.
- Owner names appear in the ಕಬ್ಜೆದಾರರ ಹೆಸರು column, often with a relation such as D/o or S/o.
- Mutation reference looks like "MR H41/2025-2026".
- Land classification is a word such as ಖುಷ್ಕಿ (Khushki, dry), ಬಾಗಾಯತ್ (Bagayat, garden) or ತರಿ (Tari, wet).

Give both the Kannada as printed and a standard Latin transliteration for names and places. Set confidence to low if the scan is skewed, cropped or faint enough that you would want a human to re-check the numbers.`;

export interface RtcResult extends RtcExtraction {
  /** Extent folded into the unit the rest of the system stores, or null when the form did not give one. */
  extentAcresTotal: number | null;
}

export async function extractRtc(imageBase64: string, mediaType: string): Promise<RtcResult> {
  const supported = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  if (!supported.includes(mediaType)) {
    throw new Error(`RTC scans must be JPEG, PNG, GIF or WebP. Received ${mediaType}.`);
  }

  const response = await anthropic().messages.create({
    model: AI_MODEL,
    max_tokens: 4000,
    system: SYSTEM,
    output_config: { format: { type: "json_schema", schema: RTC_SCHEMA } },
    messages: [
      {
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: mediaType as "image/jpeg", data: imageBase64 } },
          { type: "text", text: "Extract the fields from this RTC." },
        ],
      },
    ],
  });

  const text = response.content.find((block) => block.type === "text");
  if (!text || text.type !== "text") throw new Error("The model returned no readable output for this RTC.");

  const parsed = JSON.parse(text.text) as RtcExtraction;

  const acre = Number.parseFloat(parsed.extentAcre);
  const gunta = Number.parseFloat(parsed.extentGunta);
  const hasAcre = Number.isFinite(acre);
  const hasGunta = Number.isFinite(gunta);

  return {
    ...parsed,
    extentAcresTotal:
      hasAcre || hasGunta ? acreGuntaToAcres(hasAcre ? acre : 0, hasGunta ? gunta : 0) : null,
  };
}
