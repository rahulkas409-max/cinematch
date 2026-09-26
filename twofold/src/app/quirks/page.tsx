import type { Metadata } from "next";
import { QuirksView } from "@/components/SharedViews";

export const metadata: Metadata = { title: "Quirks & Green Flags", description: "Swipe on quirks and see how compatible you are." };

export default function Page() {
  return <QuirksView />;
}
