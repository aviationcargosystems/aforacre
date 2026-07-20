// Karnataka land-buying reference content — plain-language explainers used on
// property pages and the explore FAQ. Indicative only, not legal advice.

export interface LegalTerm {
  term: string;
  explanation: string;
}

export const karnatakaLegalTerms: LegalTerm[] = [
  {
    term: "Khata A vs Khata B",
    explanation:
      "Khata A properties are fully compliant and eligible for building licences and bank loans. Khata B properties have some regularity gap (e.g. property tax paid but not yet upgraded) and typically can't get construction approval until upgraded to Khata A.",
  },
  {
    term: "DC Conversion",
    explanation:
      "Agricultural land must be converted from agricultural to non-agricultural use by the Deputy Commissioner's office before you can legally build a residence or farmhouse structure on it. Land already growing crops can be bought and farmed without conversion.",
  },
  {
    term: "RTC (Record of Rights, Tenancy & Crops)",
    explanation:
      "The primary ownership document for agricultural land in Karnataka, maintained by the revenue department. Always verify the seller's name matches the latest RTC (also called Pahani) before proceeding.",
  },
  {
    term: "Guidance Value",
    explanation:
      "The government-notified minimum value per acre/sqft used to compute stamp duty and registration fee. Actual sale price can be higher, but stamp duty is always charged on whichever is higher — sale price or guidance value.",
  },
  {
    term: "Encumbrance Certificate (EC)",
    explanation:
      "Confirms the land is free of registered loans, mortgages, or legal disputes for a chosen period, typically the last 13-30 years. Always pull a fresh EC before final payment.",
  },
  {
    term: "Land Ceiling Act",
    explanation:
      "The Karnataka Land Reforms Act caps how much agricultural land a family unit can hold. Non-agriculturists and NRIs face additional restrictions on directly purchasing agricultural land — verify eligibility before committing.",
  },
];

export const karnatakaTaxFaqs: { question: string; answer: string }[] = [
  {
    question: "How is stamp duty calculated in Karnataka?",
    answer:
      "Stamp duty is 5% of the higher of the sale price or the government guidance value, plus a 10% surcharge and 3% cess on that duty (together ~5.6% effective). Registration fee is an additional 1%.",
  },
  {
    question: "Do I need to pay DC conversion charges?",
    answer:
      "Only if the land isn't already converted for non-agricultural use and you plan to build. Pure farming use on agricultural land doesn't require conversion. Indicative conversion cost is ~₹15,000 per acre, varies by zone.",
  },
  {
    question: "Can I get a loan against agricultural land?",
    answer:
      "Most banks don't offer home loans for pure agricultural land. Farm-development loans or gold/other collateral loans are more common routes. DC-converted land with Khata A status has better financing options.",
  },
];
