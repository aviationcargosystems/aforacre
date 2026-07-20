import type { Vendor } from "@/lib/types";

// Seed records only — vendors get a marketplace surface (listing tools, order
// management) in a later phase. Kept here so the schema and a few real-shaped
// examples exist ahead of that build.
export const vendors: Vendor[] = [
  {
    slug: "kaveri-agri-inputs",
    name: "Kaveri Agri Inputs",
    category: "Seeds, fertilizer & farm inputs",
    description: "Wholesale supplier of seeds, organic fertilizer, and polyhouse consumables serving the Kanakapura Road belt.",
    serviceAreas: ["Kanakapura Road", "Harohalli", "Anekal"],
  },
  {
    slug: "southern-farm-equipment",
    name: "Southern Farm Equipment Rentals",
    category: "Equipment rental",
    description: "Tractor, tiller, and harvester rental by the day or season for smallholder and commercial farms.",
    serviceAreas: ["Anekal", "Jigani", "Chandapura", "Malavalli"],
  },
  {
    slug: "greenbuild-farmhouse-contractors",
    name: "GreenBuild Farmhouse Contractors",
    category: "Farmhouse & structure construction",
    description: "Design-build contractor for farmhouses, caretaker cottages, and packhouse structures on converted land.",
    serviceAreas: ["Bannerghatta Road", "Kanakapura Road", "Tataguni"],
  },
];
