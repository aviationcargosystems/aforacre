import type { Broker } from "@/lib/types";

// Seed records only — broker profiles, listings, and lead routing arrive with
// the marketplace phase. Schema exists now so property/broker linking is easy
// to wire up later without a data-model change.
export const brokers: Broker[] = [
  {
    slug: "south-bangalore-land-co",
    name: "Suresh Gowda",
    agency: "South Bangalore Land Co.",
    serviceAreas: ["Kanakapura Road", "Harohalli", "Sangama"],
    listingsCount: 34,
    phone: "+91 98450 40123",
  },
  {
    slug: "anekal-farmland-advisors",
    name: "Lakshmi Narayan",
    agency: "Anekal Farmland Advisors",
    serviceAreas: ["Anekal", "Jigani", "Hulimangala"],
    listingsCount: 21,
    phone: "+91 99001 50234",
  },
  {
    slug: "bannerghatta-estates",
    name: "Priya Menon",
    agency: "Bannerghatta Estates",
    serviceAreas: ["Bannerghatta Road", "Tataguni", "Kaggalipura"],
    listingsCount: 18,
    phone: "+91 97400 60345",
  },
];
