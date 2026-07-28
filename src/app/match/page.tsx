import { getAllProperties } from "@/lib/store/properties";
import { MatchQuiz } from "@/components/match-quiz";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Find Your Match — A for Acre",
  description: "Answer a few questions and we'll match you to land across South Bangalore — not just by budget.",
};

export default async function MatchPage() {
  const properties = await getAllProperties();
  return <MatchQuiz properties={properties} />;
}
