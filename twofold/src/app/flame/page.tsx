import type { Metadata } from "next";
import { FlameView } from "@/components/SharedViews";

export const metadata: Metadata = { title: "Sync our flame 🔥", description: "Merge streaks so your flame counts the days you both showed up." };

export default function Page() {
  return <FlameView />;
}
