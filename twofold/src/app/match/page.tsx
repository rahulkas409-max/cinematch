import type { Metadata } from "next";
import { MatchView } from "@/components/SharedViews";

export const metadata: Metadata = { title: "Blind Date Matcher", description: "Pick 3 date ideas. Only mutual matches are revealed." };

export default function Page() {
  return <MatchView />;
}
