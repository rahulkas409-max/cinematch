"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { ShareBar } from "@/components/ui/ShareBar";
import { useCouple } from "@/lib/couple";
import { buildLink } from "@/lib/share";
import { useHydrated, useStored } from "@/lib/storage";
import { computeStreak, EMPTY_STREAK, lastWeek, STREAK_KEY, type StreakState } from "@/lib/streak";

export type FlameSync = { n: string; d: string[] };

/** Top-bar flame pill; opens the streak sheet with the week strip and the sync link. */
export function DailyStreak() {
  const [state] = useStored<StreakState>(STREAK_KEY, EMPTY_STREAK);
  const { couple, setCouple, names } = useCouple();
  const hydrated = useHydrated();
  const [open, setOpen] = useState(false);

  const streak = hydrated ? computeStreak(state) : { count: 0, shared: false, meToday: false, partnerToday: false };
  const week = hydrated ? lastWeek(state) : [];
  const lit = streak.count > 0;

  const syncUrl = hydrated ? buildLink("/flame", { n: names.a, d: state.myDays.slice(-60) } satisfies FlameSync) : "";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="glass flex h-11 items-center gap-1.5 rounded-full pr-4 pl-3 text-sm font-bold transition active:scale-95"
        aria-label={`Flame streak: ${streak.count} days`}
      >
        <motion.span
          animate={lit ? { scale: [1, 1.18, 1], rotate: [0, -6, 6, 0] } : { scale: 1 }}
          transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 1.2 }}
          className="grid place-items-center"
        >
          <Flame className={`size-5 ${lit ? "fill-amber text-rose" : "text-ink-soft/40"}`} />
        </motion.span>
        <span className="tabular-nums">{streak.count}</span>
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Shared Flame Streak">
        <div className="text-center">
          <div className="relative mx-auto grid size-28 place-items-center rounded-full bg-gradient-to-b from-amber-soft to-rose-soft">
            <Flame className={`size-14 ${lit ? "fill-amber text-rose" : "text-ink-soft/30"}`} />
            <span className="absolute -bottom-2 rounded-full bg-ink px-3 py-1 text-sm font-bold text-cream">
              {streak.count} day{streak.count === 1 ? "" : "s"}
            </span>
          </div>
          <p className="mt-5 text-[15px] text-ink-soft">
            {streak.shared
              ? "Counts every day you both played a card, game or tool."
              : "Solo flame for now. Send your partner the sync link below. Once they send theirs back, only days you both showed up count."}
          </p>
        </div>

        <div className="mt-5 grid grid-cols-7 gap-1.5">
          {week.map((d) => (
            <div key={d.key} className="flex flex-col items-center gap-1">
              <div
                className={`grid size-10 place-items-center rounded-2xl text-lg ${
                  d.me && d.partner ? "bg-rose text-white" : d.me || d.partner ? "bg-amber-soft" : "bg-white/70"
                }`}
              >
                {d.me && d.partner ? "🔥" : d.me || d.partner ? "✦" : ""}
              </div>
              <span className="text-[11px] font-semibold text-ink-soft">{d.label}</span>
            </div>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-2">
          <label className="text-xs font-semibold text-ink-soft">
            Your name
            <input className="input mt-1" value={couple.a} placeholder="You" onChange={(e) => setCouple({ ...couple, a: e.target.value })} />
          </label>
          <label className="text-xs font-semibold text-ink-soft">
            Partner
            <input className="input mt-1" value={couple.b} placeholder="Partner" onChange={(e) => setCouple({ ...couple, b: e.target.value })} />
          </label>
        </div>

        <div className="mt-5 rounded-3xl bg-white/70 p-4">
          <p className="text-sm font-semibold">Sync flames with {names.b}</p>
          <p className="mt-1 text-xs text-ink-soft">Your active days travel inside the link. No account, no server.</p>
          <div className="mt-3">
            <ShareBar compact url={syncUrl} text={`🔥 ${names.a} kept our TwoFold flame alive! Tap to sync our streak:`} />
          </div>
        </div>
      </Modal>
    </>
  );
}
