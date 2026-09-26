"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Repeat } from "lucide-react";
import { useState } from "react";
import { rotation } from "@data/family";
import { sfx } from "@/lib/audio";
import { possessive, useCouple } from "@/lib/couple";
import { useHydrated, useStored } from "@/lib/storage";
import { markActive } from "@/lib/streak";

type Plan = { startWith: "A" | "B"; overrides: Record<string, "A" | "B" | "both"> };

/**
 * Festival & Holiday Balance Planner. The base schedule alternates every
 * occasion year over year; couples can override any slot (including "both"
 * for split days), and the balance meter keeps it honest.
 */
export function HolidayPlanner() {
  const { names } = useCouple();
  const hydrated = useHydrated();
  const [plan, setPlan] = useStored<Plan>("holiday-plan", { startWith: "A", overrides: {} });
  const [year, setYear] = useState(() => new Date().getFullYear());

  const base = rotation(year, plan.startWith);
  const slots = base.map((o) => {
    const key = `${year}:${o.id}`;
    return { ...o, key, host: plan.overrides[key] ?? o.host, overridden: key in plan.overrides };
  });
  const score = slots.reduce(
    (acc, s) => {
      if (s.host === "both") {
        acc.A += 0.5;
        acc.B += 0.5;
      } else acc[s.host] += 1;
      return acc;
    },
    { A: 0, B: 0 },
  );
  const pctA = Math.round((score.A / slots.length) * 100);

  const fam = (h: "A" | "B" | "both") => (h === "both" ? "Both (split day)" : h === "A" ? `${possessive(names.a)} parents` : `${possessive(names.b)} parents`);

  const cycle = (key: string, current: "A" | "B" | "both", baseHost: "A" | "B") => {
    sfx.pop();
    markActive();
    const next = current === "A" ? "B" : current === "B" ? "both" : "A";
    const overrides = { ...plan.overrides };
    if (next === baseHost) delete overrides[key];
    else overrides[key] = next;
    setPlan({ ...plan, overrides });
  };

  return (
    <div className="card">
      <div className="mb-4 flex items-center justify-between">
        <button type="button" className="glass grid size-10 place-items-center rounded-full" aria-label="Previous year" onClick={() => setYear((y) => y - 1)}>
          <ChevronLeft className="size-4" />
        </button>
        <AnimatePresence mode="wait">
          <motion.p key={year} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="headline text-3xl">
            {hydrated ? year : ""}
          </motion.p>
        </AnimatePresence>
        <button type="button" className="glass grid size-10 place-items-center rounded-full" aria-label="Next year" onClick={() => setYear((y) => y + 1)}>
          <ChevronRight className="size-4" />
        </button>
      </div>

      <div className="mb-5">
        <div className="mb-1.5 flex justify-between text-xs font-semibold">
          <span className="text-rose">
            {possessive(names.a)} side · {score.A}
          </span>
          <span className="text-ink-soft">{Math.abs(pctA - 50) <= 6 ? "Perfectly balanced ⚖️" : "Slightly uneven"}</span>
          <span className="text-sage">
            {score.B} · {possessive(names.b)} side
          </span>
        </div>
        <div className="flex h-3 overflow-hidden rounded-full bg-white">
          <motion.div className="h-full bg-rose" animate={{ width: `${pctA}%` }} transition={{ type: "spring", stiffness: 120, damping: 20 }} />
          <div className="h-full flex-1 bg-sage" />
        </div>
      </div>

      <ul className="grid gap-2 sm:grid-cols-2">
        {slots.map((s) => (
          <li key={s.key}>
            <button
              type="button"
              onClick={() => cycle(s.key, s.host, base.find((b) => b.id === s.id)!.host)}
              className="flex w-full items-center gap-3 rounded-2xl bg-white/75 px-3 py-2.5 text-left transition active:scale-[0.98]"
            >
              <span className="text-2xl">{s.emoji}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-semibold">{s.name}</span>
                <span className="text-xs text-ink-soft">
                  {fam(s.host)}
                  {s.overridden && " · custom"}
                </span>
              </span>
              <motion.span
                key={s.host}
                initial={{ scale: 0.6 }}
                animate={{ scale: 1 }}
                className={`size-4 shrink-0 rounded-full ${s.host === "A" ? "bg-rose" : s.host === "B" ? "bg-sage" : "bg-gradient-to-r from-rose to-sage"}`}
              />
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-ink-soft">
        <span>Tap an occasion to swap hosts or split the day.</span>
        <button
          type="button"
          className="inline-flex items-center gap-1 font-semibold text-ink"
          onClick={() => {
            sfx.pop();
            setPlan({ startWith: plan.startWith === "A" ? "B" : "A", overrides: {} });
          }}
        >
          <Repeat className="size-3.5" /> Flip starting family & reset
        </button>
      </div>
    </div>
  );
}
