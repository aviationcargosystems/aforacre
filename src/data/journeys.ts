import type { Journey } from "@/lib/types";

export const journeys: Journey[] = [
  {
    id: "polyhouse",
    title: "Build a Polyhouse Farm",
    shortTitle: "Polyhouse Farming",
    tagline: "Controlled-climate farming, minutes from the ring road",
    description:
      "Land suited for polyhouse and shade-net cultivation — flat terrain, dependable borewell water, three-phase power, and road access wide enough for material trucks. Popular for capsicum, exotic vegetables, and cut-flower exports out of South Bangalore's Kanakapura and Anekal belts.",
    heroImage: "/journeys/polyhouse.jpg",
    whatToLookFor: [
      "Level or gently sloping land — grading costs rise fast on uneven plots",
      "A tested, high-yield borewell (polyhouse drip systems are water-hungry)",
      "Three-phase electricity connection or feasible transformer distance",
      "All-weather road access wide enough for construction and harvest trucks",
      "DC-converted or convertible land if any packhouse structure is planned",
    ],
    recommendedFilters: { maxDistanceKm: 55, tags: ["Ready for Polyhouse", "Borewell Tested"] },
    faqs: [
      {
        question: "Are there government subsidies for polyhouse construction in Karnataka?",
        answer:
          "Yes — the National Horticulture Mission (NHM) and Karnataka's RKVY schemes typically subsidize 50% of polyhouse structure cost for eligible farmers, capped per unit area. Subsidy eligibility depends on land ownership records (RTC) being in the applicant's name, so having clean title matters more than usual.",
      },
      {
        question: "How much water does a 1-acre polyhouse need?",
        answer:
          "Roughly 15,000–20,000 litres/day for drip-irrigated capsicum or exotic vegetables in peak season. A single well-yielding borewell (2,000+ litres/hour) comfortably covers 1–1.5 acres; larger setups need a second bore or a sump/storage tank buffer.",
      },
      {
        question: "How long before a polyhouse plot starts producing income?",
        answer:
          "Structure erection takes 6–10 weeks once land and power are ready. First harvest for capsicum/exotic vegetables is typically 90–110 days after transplanting, so most growers see first revenue within 5–6 months of breaking ground.",
      },
    ],
    accentTag: "Polyhouse Ready",
  },
  {
    id: "commercial-farming",
    title: "Start Commercial Farming",
    shortTitle: "Commercial Farming",
    tagline: "Open-field acreage built for scale, near mandis and cold chains",
    description:
      "Larger open parcels for row crops, orchards, or contract farming — think ragi, maize, mulberry, or mixed horticulture. These plots prioritize extent and soil quality over proximity to the city, with good access to APMC mandis and existing farming communities for labour and equipment sharing.",
    heroImage: "/journeys/commercial-farming.jpg",
    whatToLookFor: [
      "Minimum 3+ acres for viable mechanization and crop rotation",
      "Established farming neighborhood — easier access to labour, equipment rental, and buyers",
      "Multiple water sources ideally (borewell + open well or rain-fed tank)",
      "Distance to nearest APMC mandi or aggregator collection point",
      "Soil test data — red loamy vs black cotton soil changes what you can grow",
    ],
    recommendedFilters: { minAcres: 3, tags: ["Open Farmland", "Multi-Crop Suitable"] },
    faqs: [
      {
        question: "What crops work best in South Bangalore's soil and climate?",
        answer:
          "The Kanakapura–Harohalli–Malavalli corridor's red loamy soil suits ragi, maize, groundnut, mulberry (for sericulture), and mixed vegetable rotation. Areas nearer Jigani/Anekal with better water availability support banana and coconut plantations too.",
      },
      {
        question: "Can I lease out farming operations instead of managing it myself?",
        answer:
          "Yes — contract farming is common in this belt: a local operator handles sowing, irrigation, labour, and harvest for a share of output or a fixed annual fee, letting absentee owners hold farmland as an asset.",
      },
      {
        question: "Is commercial agricultural land eligible for crop loans?",
        answer:
          "Land with clean RTC records and Aadhaar-linked farmer registration is generally eligible for Kisan Credit Card and seasonal crop loans through nationalized and cooperative banks with a local branch presence.",
      },
    ],
    accentTag: "Scale Farming",
  },
  {
    id: "retirement",
    title: "Retire on the Land",
    shortTitle: "Retirement Living",
    tagline: "A quiet farmhouse plot, close enough for weekly city trips",
    description:
      "Smaller, livable parcels within a comfortable drive of the city — for a farmhouse, an orchard garden, and a slower pace. Prioritizes proximity to hospitals, markets, and the highway, gated-community security, and land that's easy to maintain without full-time farm labour.",
    heroImage: "/journeys/retirement.jpg",
    whatToLookFor: [
      "Under 45km from the city for easy hospital and market access",
      "Gated farm community or nearby settled neighbours for security",
      "Existing structure or approved plan for farmhouse construction (Khata A, DC-converted)",
      "Low-maintenance land — orchard or ornamental planting over intensive row cropping",
      "Reliable electricity and mobile network coverage",
    ],
    recommendedFilters: { maxAcres: 3, maxDistanceKm: 45, tags: ["Gated Farm Community", "Farmhouse Ready"] },
    faqs: [
      {
        question: "Do I need DC conversion to build a farmhouse?",
        answer:
          "Yes, if any part of the structure is a permanent residence rather than a farm shed. Look for plots already DC-converted or in a layout where conversion is straightforward — this can save 6–12 months of paperwork.",
      },
      {
        question: "What's a gated farm community and is it worth the premium?",
        answer:
          "A cluster of farm plots (often 20–100) with a shared compound wall, security, internal roads, and sometimes a clubhouse. They cost 15–30% more per acre than standalone land but are the most common choice for retirement buyers prioritizing safety and low-hassle upkeep.",
      },
      {
        question: "How far is 'too far' for a retirement farmhouse near Bangalore?",
        answer:
          "Most retirees settle within 35–45km (roughly 60–75 minutes) of their preferred hospital network. Kanakapura Road and Bannerghatta Road corridors are popular for this exact reason — good highway access plus established hospitals along the route.",
      },
    ],
    accentTag: "Retirement Ready",
  },
  {
    id: "getaway",
    title: "Get Away for the Weekend",
    shortTitle: "Weekend Getaway",
    tagline: "A patch of green under 2 hours from the city, for weekends and holidays",
    description:
      "Compact, scenic plots for a weekend home or farm-stay investment — valued for views, water bodies, and a genuine escape feel rather than farming yield. Many owners build a small cottage and rent it out as a farm-stay when they're not using it.",
    heroImage: "/journeys/getaway.jpg",
    whatToLookFor: [
      "Under 2 hours drive, ideally with a scenic route (hills, lake, or forest edge)",
      "Natural features — a pond, stream, or elevation with a view",
      "Existing tree cover for shade and an established, lived-in feel",
      "Simple road access — doesn't need to support heavy farm equipment",
      "Potential for a small guest cottage or farm-stay rental income",
    ],
    recommendedFilters: { maxAcres: 2, tags: ["Weekend Escape", "Scenic Views"] },
    faqs: [
      {
        question: "Can I legally rent out a farm-stay cottage on agricultural land?",
        answer:
          "Karnataka permits small-scale agri-tourism/farm-stay structures on agricultural land under specific area limits without full DC conversion, but rules vary by taluk — verify with the local taluk office before building.",
      },
      {
        question: "What upkeep does a weekend property need when I'm away?",
        answer:
          "Most owners hire a local caretaker for watering, security checks, and basic landscaping — typically ₹4,000–8,000/month depending on plot size and scope.",
      },
      {
        question: "Which corridors are best for a scenic weekend plot near Bangalore?",
        answer:
          "The Kanakapura Road stretch past Sangama, and areas near Bannerghatta National Park's buffer zone, are popular for hill views and tree cover while staying within a 2-hour drive.",
      },
    ],
    accentTag: "Weekend Escape",
  },
];

export function getJourney(id: string) {
  return journeys.find((j) => j.id === id);
}
