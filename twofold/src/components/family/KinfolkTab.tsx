"use client";

import { BOUNDARY_GUIDES } from "@data/family";
import { DECKS, deckCards } from "@data/flashcards";
import { DeckViewer } from "@/components/flashcards/DeckViewer";
import { ModuleHero, Section } from "@/components/ui/Section";
import { FamilyPassport, ImportantDates } from "./FamilyPassport";
import { HolidayPlanner } from "./HolidayPlanner";

export function KinfolkTab() {
  const familyDeck = DECKS.find((d) => d.id === "family")!;
  return (
    <div className="grid gap-12">
      <ModuleHero
        kicker="two families, one heart"
        title="Love that includes"
        italic="everyone."
        blurb="Remember Maa's chai order, never miss a puja, share festivals fairly, and talk through tricky family moments with respect."
      />

      <Section eyebrow="Meet my family" title="Family Passports" description="Favourite teas and snacks, dietary needs, routines and how each person likes to be reached.">
        <FamilyPassport />
      </Section>

      <Section eyebrow="Never forget" title="Important dates">
        <ImportantDates />
      </Section>

      <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr]">
        <Section eyebrow="Equal love, equal time" title="Festival & Holiday Balance">
          <HolidayPlanner />
        </Section>
        <Section eyebrow="Front: scenario · Back: talking points" title="In-Law Respect Flashcards">
          <DeckViewer cards={deckCards("family")} accent={familyDeck.accent} deckLabel="Family scenario" frontHint="Tap for ideas" backTitle="Respectful boundary ideas" />
        </Section>
      </div>

      <Section eyebrow="Boundary guide" title="Four golden rules">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {BOUNDARY_GUIDES.map((g) => (
            <div key={g.id} className="card">
              <span className="text-3xl">{g.emoji}</span>
              <p className="headline mt-2 text-lg leading-snug">{g.title}</p>
              <ul className="mt-2 grid gap-1.5 text-sm text-ink-soft">
                {g.points.map((p) => (
                  <li key={p}>· {p}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
