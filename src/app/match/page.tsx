import { getMatchablePlots } from "@/lib/store/plots";
import { MatchFlow } from "@/components/match/match-flow";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Find your match - A for Acre",
  description:
    "Seven questions, then the farmland in South Bangalore that actually fits how you will use it, and why.",
};

export default async function MatchPage() {
  // Scoring runs in the browser so answers feel instant, but the plots come
  // from the server: sending the whole inventory once is cheap at this size and
  // avoids a round trip per question.
  const plots = await getMatchablePlots();
  return <MatchFlow plots={plots} />;
}
