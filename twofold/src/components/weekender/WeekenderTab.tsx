"use client";

import { ModuleHero, Section } from "@/components/ui/Section";
import { BucketList } from "./BucketList";
import { DailyVibeDrop } from "./DailyVibeDrop";
import { RouletteWheel } from "./RouletteWheel";

export function WeekenderTab() {
  return (
    <div className="grid gap-12">
      <ModuleHero
        kicker="plans, sorted"
        title="Make the weekend"
        italic="yours."
        blurb="Spin for a date, keep a bucket list together, and unlock a fresh question every morning at 9."
      />
      <Section eyebrow="Unlocks daily · 9:00 AM" title="The Daily Vibe Drop">
        <DailyVibeDrop />
      </Section>
      <div className="grid gap-10 lg:grid-cols-2">
        <Section eyebrow="Can't decide?" title="Date Roulette">
          <RouletteWheel />
        </Section>
        <Section eyebrow="Someday, together" title="Shared Bucket List">
          <BucketList />
        </Section>
      </div>
    </div>
  );
}
