"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { DECKS, deckCards, type DeckId } from "@data/flashcards";
import { ModuleHero, Section } from "@/components/ui/Section";
import { sfx } from "@/lib/audio";
import { CardStudio } from "./CardStudio";
import { DeckViewer } from "./DeckViewer";

type HubTab = DeckId | "studio";

export function FlashcardHub() {
  const [tab, setTab] = useState<HubTab>("intimacy");
  const deck = DECKS.find((d) => d.id === tab);

  return (
    <div className="grid gap-10">
      <ModuleHero
        kicker="talk deeper"
        title="Cards that open"
        italic="hearts."
        blurb="Tap a card to flip it, swipe to move on. Each one has a question on the front and gentle conversation prompts on the back."
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {[...DECKS.map((d) => ({ id: d.id as HubTab, title: d.title, emoji: d.emoji, sub: `${deckCards(d.id).length} cards`, accent: d.accent })), { id: "studio" as HubTab, title: "Custom Card Studio", emoji: "✍️", sub: "Write your own", accent: "#588157" }].map((d) => (
          <motion.button
            key={d.id}
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              sfx.pop();
              setTab(d.id);
            }}
            className={`relative flex flex-col items-start gap-1 overflow-hidden rounded-3xl border-2 p-4 text-left transition ${
              tab === d.id ? "bg-white shadow-lift" : "border-transparent bg-white/55"
            } ${d.id === "studio" ? "col-span-2 sm:col-span-1" : ""}`}
            style={{ borderColor: tab === d.id ? d.accent : undefined }}
          >
            <span className="text-3xl">{d.emoji}</span>
            <span className="font-display text-[15px] leading-tight font-semibold">{d.title}</span>
            <span className="text-xs text-ink-soft">{d.sub}</span>
          </motion.button>
        ))}
      </div>

      {deck ? (
        <Section eyebrow={deck.subtitle} title={deck.title}>
          <DeckViewer key={deck.id} cards={deckCards(deck.id)} accent={deck.accent} deckLabel={deck.title} />
        </Section>
      ) : (
        <Section eyebrow="Make it yours" title="Custom Card Studio" description="Inside jokes, memory triggers, pop quizzes. Write them, flip them, share the deck as a link.">
          <CardStudio />
        </Section>
      )}
    </div>
  );
}
