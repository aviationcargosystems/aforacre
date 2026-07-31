import {
  CalendarCheck,
  Home,
  Mountain,
  Sprout,
  TrendingUp,
  Trees,
  Waves,
  type LucideIcon,
} from "lucide-react";

/**
 * Land described by the experience it offers rather than by its specification.
 *
 * Shared by the tile rail and the finder's chip row, which show the same seven
 * categories under slightly different names — "Plantation ready" is a picture
 * caption, "Farming" is a filter. Both live here so the two rows cannot drift
 * apart.
 *
 * The photographs are stock, from the Unsplash set this project used before the
 * catalogue was cleared. Each was opened and checked against its category
 * rather than picked by id: the forest tile is forest meeting farmland, the
 * water tile is a river through paddy, and so on. They illustrate a kind of
 * land, never a specific plot — a listing's own photos are the only thing that
 * may stand for a listing.
 *
 * Both this module and its icons are imported directly by the server page and
 * the client finder, so no component ever crosses the boundary as a prop.
 */

export interface Experience {
  /** Tile caption. */
  label: string;
  /** Tile sub-caption. */
  body: string;
  /** Chip caption in the finder, and the term handed to /explore. */
  tag: string;
  icon: LucideIcon;
  image: string;
}

const unsplash = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=600&q=70`;

export const EXPERIENCES: Experience[] = [
  {
    label: "Forest edge",
    body: "Privacy. Trees. Wildlife.",
    tag: "Forest Edge",
    icon: Trees,
    image: unsplash("1774695475379-88e1351e4922"),
  },
  {
    label: "Mountain views",
    body: "Hills. Valleys. Fresh air.",
    tag: "Mountain View",
    icon: Mountain,
    image: unsplash("1606145905507-687a265c7c58"),
  },
  {
    label: "Lake and water",
    body: "Lakes. Streams. Wells.",
    tag: "Lake / Water",
    icon: Waves,
    image: unsplash("1681226298721-88cdb4096e5f"),
  },
  {
    label: "Plantation ready",
    body: "Mango, coconut, areca and more.",
    tag: "Farming",
    icon: Sprout,
    image: unsplash("1709389137226-f94058d3cbe7"),
  },
  {
    label: "Weekend escape",
    body: "Within 60–90 minutes.",
    tag: "Weekend Escape",
    icon: CalendarCheck,
    image: unsplash("1767884163937-38bd5fa692cf"),
  },
  {
    label: "Investment corridor",
    body: "High growth potential.",
    tag: "Investment",
    icon: TrendingUp,
    image: unsplash("1736664122955-e35a73319de9"),
  },
  {
    label: "Luxury farmhouse",
    body: "Build your dream home.",
    tag: "Luxury Farmhouse",
    icon: Home,
    image: unsplash("1642227671308-31f0d6f275f1"),
  },
];
