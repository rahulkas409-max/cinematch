import type { Metadata } from "next";
import { TelepathyView } from "@/components/SharedViews";

export const metadata: Metadata = { title: "Crush Telepathy 🧠", description: "Five fast rounds. How well do you really know them?" };

export default function Page() {
  return <TelepathyView />;
}
