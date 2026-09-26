"use client";

import { AnimatePresence, motion } from "framer-motion";
import { MessageCircleHeart, RotateCcw } from "lucide-react";
import { ALIGNMENT } from "@data/horizons";
import { sfx } from "@/lib/audio";
import { useCouple } from "@/lib/couple";
import { useStored } from "@/lib/storage";
import { markActive } from "@/lib/streak";

type Answers = Record<string, { a?: number; b?: number }>;

function Scale({ value, onChange, color, label }: { value?: number; onChange: (v: number) => void; color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-16 shrink-0 truncate text-xs font-bold" style={{ color }}>
        {label}
      </span>
      <div role="radiogroup" aria-label={label} className="flex flex-1 justify-between gap-1">
        {[1, 2, 3, 4, 5].map((v) => {
          const on = value === v;
          return (
            <motion.button
              key={v}
              type="button"
              role="radio"
              aria-checked={on}
              aria-label={`${label}: ${v} of 5`}
              whileTap={{ scale: 0.85 }}
              onClick={() => onChange(v)}
              className="grid size-9 place-items-center rounded-full border-2 transition sm:size-10"
              style={{ borderColor: on ? color : "#eadfd6", background: on ? color : "rgba(255,255,255,0.8)" }}
            >
              <span className={`size-2 rounded-full ${on ? "bg-white" : "bg-ink/15"}`} />
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

/** Parenting Alignment Matrix: both partners place themselves on each spectrum, side by side. */
export function ParentingQuiz() {
  const { names } = useCouple();
  const [answers, setAnswers] = useStored<Answers>("alignment", {});

  const set = (id: string, who: "a" | "b", v: number) => {
    sfx.pop();
    markActive();
    setAnswers((prev) => ({ ...prev, [id]: { ...prev[id], [who]: v } }));
  };

  const complete = ALIGNMENT.filter((q) => answers[q.id]?.a && answers[q.id]?.b);
  const avgGap = complete.length ? complete.reduce((s, q) => s + Math.abs(answers[q.id].a! - answers[q.id].b!), 0) / complete.length : 0;
  const alignment = complete.length ? Math.round(100 - (avgGap / 4) * 100) : null;

  return (
    <div className="grid gap-4">
      <div className="card flex flex-wrap items-center justify-between gap-4 bg-gradient-to-br from-white/80 to-sage-soft/60">
        <div>
          <p className="text-sm text-ink-soft">Values alignment</p>
          <p className="headline text-5xl text-sage">{alignment === null ? "—" : `${alignment}%`}</p>
          <p className="text-xs text-ink-soft">
            {complete.length}/{ALIGNMENT.length} topics answered by both
          </p>
        </div>
        <button type="button" className="btn-ghost" onClick={() => setAnswers({})}>
          <RotateCcw className="size-4" /> Reset
        </button>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {ALIGNMENT.map((q) => {
          const ans = answers[q.id] ?? {};
          const both = ans.a && ans.b;
          const gap = both ? Math.abs(ans.a! - ans.b!) : 0;
          return (
            <div key={q.id} className="card">
              <p className="headline text-lg">{q.topic}</p>
              <div className="mt-1 mb-3 flex justify-between text-[11px] font-semibold text-ink-soft">
                <span>← {q.left}</span>
                <span>{q.right} →</span>
              </div>
              <div className="grid gap-2">
                <Scale label={names.a} color="#e06d53" value={ans.a} onChange={(v) => set(q.id, "a", v)} />
                <Scale label={names.b} color="#588157" value={ans.b} onChange={(v) => set(q.id, "b", v)} />
              </div>
              <AnimatePresence>
                {both && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <p
                      className={`mt-3 flex gap-2 rounded-2xl px-3 py-2.5 text-sm ${gap >= 2 ? "bg-amber-soft/70" : "bg-sage-soft/70"}`}
                    >
                      <MessageCircleHeart className={`mt-0.5 size-4 shrink-0 ${gap >= 2 ? "text-amber" : "text-sage"}`} />
                      {gap === 0 ? "Totally in sync. Talk about why this matters to you both." : gap === 1 ? "Close enough. Small tweaks, same direction." : q.cue}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
