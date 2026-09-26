"use client";

import { ModuleHero, Section } from "@/components/ui/Section";
import { ChoreBoard } from "./ChoreBoard";
import { ExpenseTracker } from "./ExpenseTracker";

export function NestTab() {
  return (
    <div className="grid gap-12">
      <ModuleHero
        kicker="co-living, minus the friction"
        title="A nest that feels"
        italic="fair."
        blurb="Log bills in seconds, see who owes whom, and settle up with a UPI QR. Chores become a little game instead of a fight."
      />
      <Section eyebrow="Fair Share ledger" title="Expenses & UPI settle-up">
        <ExpenseTracker />
      </Section>
      <Section eyebrow="Chore Harmony" title="Tap to claim, tap to finish">
        <ChoreBoard />
      </Section>
    </div>
  );
}
