import {
  Droplets,
  Fence,
  Landmark,
  Leaf,
  Mountain,
  Route,
  Sparkles,
  Sprout,
  Sun,
  Tag as TagIcon,
  TreePine,
  Trees,
  Waves,
  Zap,
  type LucideIcon,
} from "lucide-react";

/**
 * An icon per tag, so a wall of chips scans as a list of features.
 *
 * Matched case-insensitively on substrings rather than exact names, because the
 * vocabulary is admin-editable: "Borewell" and "Borewell Tested" should get the
 * same drop, and a tag added next week should not need a code change to render.
 * Anything unmatched falls back to a generic tag mark rather than disappearing.
 */
const RULES: { match: string[]; icon: LucideIcon }[] = [
  { match: ["borewell", "water", "well", "canal", "rain"], icon: Droplets },
  { match: ["lake", "river", "stream", "pond"], icon: Waves },
  { match: ["hill", "elevated", "slope", "mountain", "valley"], icon: Mountain },
  { match: ["road", "highway", "tar", "cement", "access"], icon: Route },
  { match: ["power", "electric", "phase", "solar"], icon: Zap },
  { match: ["fenc", "boundary", "wall", "gated", "compound"], icon: Fence },
  { match: ["mango", "orchard", "coconut", "plantation", "grove"], icon: TreePine },
  { match: ["farm", "crop", "cultivat", "agri", "polyhouse"], icon: Sprout },
  { match: ["forest", "tree", "green", "scenic", "view"], icon: Trees },
  { match: ["organic", "soil", "fertile"], icon: Leaf },
  { match: ["khata", "legal", "title", "document", "rtc"], icon: Landmark },
  { match: ["weekend", "getaway", "retreat", "sun"], icon: Sun },
  { match: ["investment", "potential", "immediate", "ready"], icon: Sparkles },
];

export function iconForTag(tag: string): LucideIcon {
  const lower = tag.toLowerCase();
  return RULES.find((rule) => rule.match.some((needle) => lower.includes(needle)))?.icon ?? TagIcon;
}
