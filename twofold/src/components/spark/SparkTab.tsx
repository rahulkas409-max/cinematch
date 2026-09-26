"use client";

import { ModuleHero, Section } from "@/components/ui/Section";
import { BlindMatcher } from "./BlindMatcher";
import { DateVoucher } from "./DateVoucher";
import { SwipeDeck } from "./SwipeDeck";
import { TelepathyGame } from "./TelepathyGame";

export function SparkTab() {
  return (
    <div className="grid gap-12">
      <ModuleHero
        kicker="icebreakers & butterflies"
        title="Find the"
        italic="spark."
        blurb="Swipe on quirks, test your telepathy, and match on date ideas without giving away your picks."
      />
      <div className="grid gap-10 lg:grid-cols-2">
        <Section eyebrow="Swipe deck" title="Quirks & Green Flags" description="Right for Same!, left for Dealbreaker, down for Neutral.">
          <SwipeDeck />
        </Section>
        <Section eyebrow="5 rounds · 10 seconds" title="Crush Telepathy" description="Set your answers, send the link, and see how well they know you.">
          <TelepathyGame />
        </Section>
      </div>
      <Section eyebrow="Mutual only" title="The Blind Date Matcher" description="You each secretly pick 3 of 12 ideas. Only the ones you both chose get revealed.">
        <BlindMatcher />
      </Section>
      <Section eyebrow="Downloadable pass" title="Chai & Date Voucher" description="A pretty little pass with your names and compatibility score.">
        <DateVoucher />
      </Section>
    </div>
  );
}
