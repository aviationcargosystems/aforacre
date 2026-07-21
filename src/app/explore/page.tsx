import type { JourneyId } from "@/lib/types";
import { getAllProperties, allTags } from "@/lib/store/properties";
import { journeys } from "@/data/journeys";
import { ExploreView } from "@/components/explore-view";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Explore Land - A for Acre",
  description: "Browse and filter farmland, farmhouse, and getaway plots across South Bangalore on an interactive map.",
};

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ journey?: string }>;
}) {
  const { journey } = await searchParams;
  const initialJourney = journeys.some((journeyItem) => journeyItem.id === journey) ? (journey as JourneyId) : null;
  const [properties, tags] = await Promise.all([getAllProperties(), allTags()]);

  return <ExploreView properties={properties} allTags={tags} initialJourney={initialJourney} />;
}
