import type { Metadata } from "next";
import { DeckView } from "@/components/SharedViews";

export const metadata: Metadata = { title: "Shared flashcard deck", description: "A custom flip-card deck, made for you." };

export default function Page() {
  return <DeckView />;
}
