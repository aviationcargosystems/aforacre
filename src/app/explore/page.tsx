import { getAllProperties, allTags } from "@/lib/store/properties";
import { getAllTags } from "@/lib/store/tags";
import { ExploreView } from "@/components/explore-view";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Explore Land - A for Acre",
  description: "Browse and filter farmland, farmhouse, and getaway plots across South Bangalore on an interactive map.",
};

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const [properties, vocabulary, inUse] = await Promise.all([
    getAllProperties(),
    getAllTags(),
    allTags(),
  ]);

  // The filter list is the tag vocabulary, not just the tags that happen to be
  // on a listing today. `allTags()` derives from the catalogue, so with one
  // property it offered that property's nine tags and silently hid every other
  // tag an admin had created — which reads as "the tags I added are missing".
  //
  // `inUse` is still merged in so a tag written straight onto a property,
  // without being added to the vocabulary first, does not vanish from the
  // filters either.
  const tags = Array.from(new Set([...vocabulary, ...inUse])).sort();

  return <ExploreView properties={properties} allTags={tags} initialQuery={q ?? ""} />;
}
