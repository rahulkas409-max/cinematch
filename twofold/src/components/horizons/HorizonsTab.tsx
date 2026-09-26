"use client";

import { ModuleHero, Section } from "@/components/ui/Section";
import { useCouple } from "@/lib/couple";
import { AgingTimeline } from "./AgingTimeline";
import { ParentingQuiz } from "./ParentingQuiz";
import { TimeCapsule } from "./TimeCapsule";

export function HorizonsTab() {
  const { names } = useCouple();
  return (
    <div className="grid gap-12">
      <ModuleHero
        kicker="the long, lovely road"
        title="Dream it"
        italic="together."
        blurb="Line up your parenting values, map out your golden years, and seal letters that only open on the day you choose."
      />
      <Section eyebrow="Parenting roadmap" title="Parenting Alignment Matrix" description="Each of you places yourself on the scale. Big gaps come with a gentle discussion cue.">
        <ParentingQuiz />
      </Section>
      <Section eyebrow="Golden years blueprint" title="Our timeline to 80">
        <AgingTimeline />
      </Section>
      <Section eyebrow="Encrypted lockbox" title="Anniversary Time Capsule">
        <TimeCapsule defaultFrom={names.a} />
      </Section>
    </div>
  );
}
