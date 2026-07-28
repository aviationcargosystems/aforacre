import { getAllProperties, allTags } from "@/lib/store/properties";
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
  const [properties, tags] = await Promise.all([getAllProperties(), allTags()]);

  return <ExploreView properties={properties} allTags={tags} initialQuery={q ?? ""} />;
}
