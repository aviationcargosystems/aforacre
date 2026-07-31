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

/**
 * w=900 for a tile that is 190 CSS pixels wide.
 *
 * The tile is a 3:4 portrait crop of a 3:2 landscape source, so `object-cover`
 * throws away most of the width — and on a 3x phone the visible strip still
 * needs about 570 real pixels. The first set was requested at w=600 and looked
 * soft for exactly that reason. q=80 rather than 70 for the same reason: at
 * this crop, compression artefacts in foliage are the thing that reads as
 * "blurry".
 */
const unsplash = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=900&q=80`;

export const EXPERIENCES: Experience[] = [
  {
    label: "Forest edge",
    body: "Privacy. Trees. Wildlife.",
    tag: "Forest Edge",
    icon: Trees,
    image: unsplash("1778343284768-b5ca177511a0"),
  },
  {
    label: "Mountain views",
    body: "Hills. Valleys. Fresh air.",
    tag: "Mountain View",
    icon: Mountain,
    image: unsplash("1593285942976-70dbd769a590"),
  },
  {
    label: "Lake and water",
    body: "Lakes. Streams. Wells.",
    tag: "Lake / Water",
    icon: Waves,
    image: unsplash("1654099602420-c90791787b79"),
  },
  {
    label: "Plantation ready",
    body: "Mango, coconut, areca and more.",
    tag: "Farming",
    icon: Sprout,
    image: unsplash("1783112054020-68aaa816ac54"),
  },
  {
    label: "Weekend escape",
    body: "Within 60–90 minutes.",
    tag: "Weekend Escape",
    icon: CalendarCheck,
    image: unsplash("1694011772133-dc4b3ff3f24f"),
  },
  {
    label: "Investment corridor",
    body: "High growth potential.",
    tag: "Investment",
    icon: TrendingUp,
    image: unsplash("1514864151880-d1bef4892f29"),
  },
  {
    label: "Luxury farmhouse",
    body: "Build your dream home.",
    tag: "Luxury Farmhouse",
    icon: Home,
    image: unsplash("1688653802629-5360086bf632"),
  },
];
