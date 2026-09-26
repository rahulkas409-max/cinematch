"use client";

import { MEALS } from "@data/dateask";
import { ModuleHero, Section } from "@/components/ui/Section";
import { ConfirmedTicket } from "./ConfirmedTicket";
import { InviteCreator } from "./InviteCreator";

const STEPS = [
  { n: "01", title: "Write the invite", text: "Your names and a sweet one-liner. Everything lives in the link itself." },
  { n: "02", title: "They pick the plan", text: "Meal, vibe and timing, chosen with big tappable cards." },
  { n: "03", title: "The big question", text: "A pulsing YES, and a “No” button that runs away." },
  { n: "04", title: "Date ticket", text: "A boarding pass they can send straight back on WhatsApp." },
];

export function DateAskTab() {
  return (
    <div className="grid gap-10">
      <ModuleHero
        kicker="shoot your shot"
        title="Ask them out,"
        italic="beautifully."
        blurb="Make a tiny interactive invitation. They open it, pick the food and the vibe, and meet a “No” button that really doesn't want to be clicked."
      />

      <div className="grid gap-6 lg:grid-cols-[1.15fr_1fr]">
        <Section eyebrow="Step 1" title="Create the invitation link">
          <InviteCreator />
        </Section>

        <Section eyebrow="How it works" title="Four tiny, sweet steps">
          <ol className="grid gap-3">
            {STEPS.map((s) => (
              <li key={s.n} className="glass flex gap-4 rounded-3xl p-4">
                <span className="font-display text-2xl font-semibold text-rose italic">{s.n}</span>
                <span>
                  <span className="block font-semibold">{s.title}</span>
                  <span className="text-sm text-ink-soft">{s.text}</span>
                </span>
              </li>
            ))}
          </ol>
        </Section>
      </div>

      <Section eyebrow="The receipt" title="What the confirmed ticket looks like" description="Every “yes” ends with this boarding pass, ready to share.">
        <ConfirmedTicket showShare={false} ticket={{ f: "Aarav", t: "Meera", m: MEALS[1].id, v: "scenic", w: "weekend", n: "Overdue for good food and better company." }} />
      </Section>
    </div>
  );
}
