"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import type { Choice } from "@data/dateask";
import { sfx } from "@/lib/audio";

type Props = {
  choices: Choice[];
  value?: string;
  onChange: (id: string) => void;
  columns?: 1 | 2 | 3;
};

/** Big, tactile selectable picture-cards used by every step of the date flow. */
export function ChoiceGrid({ choices, value, onChange, columns = 2 }: Props) {
  const cols = columns === 3 ? "sm:grid-cols-3" : columns === 2 ? "sm:grid-cols-2" : "";
  return (
    <div role="radiogroup" className={`grid grid-cols-1 gap-3 ${cols}`}>
      {choices.map((c, i) => {
        const selected = value === c.id;
        return (
          <motion.button
            key={c.id}
            type="button"
            role="radio"
            aria-checked={selected}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0, scale: selected ? 1.02 : 1 }}
            transition={{ delay: i * 0.05, type: "spring", stiffness: 320, damping: 24 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              sfx.pop();
              onChange(c.id);
            }}
            className={`relative flex items-center gap-4 overflow-hidden rounded-[26px] border-2 bg-gradient-to-br p-4 text-left transition-colors ${c.tint} ${
              selected ? "border-rose shadow-lift" : "border-white/80 shadow-soft"
            }`}
          >
            <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-white/80 text-3xl shadow-sm">{c.emoji}</span>
            <span className="min-w-0 flex-1">
              <span className="block font-display text-lg leading-tight font-semibold text-ink">{c.title}</span>
              <span className="mt-0.5 block text-[13px] leading-snug text-ink-soft">{c.blurb}</span>
            </span>
            <span
              className={`grid size-7 shrink-0 place-items-center rounded-full border-2 transition ${
                selected ? "border-rose bg-rose text-white" : "border-ink/15 bg-white/60 text-transparent"
              }`}
            >
              <Check className="size-4" strokeWidth={3} />
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
