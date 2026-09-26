"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Eye, Hourglass, Sparkles } from "lucide-react";
import { DAILY_PROMPTS, DROP_HOUR } from "@data/dailyprompts";
import { ShareBar } from "@/components/ui/ShareBar";
import { sfx } from "@/lib/audio";
import { useStored } from "@/lib/storage";
import { markActive, dayKey } from "@/lib/streak";
import { formatCountdown, useNow } from "@/lib/time";

/**
 * A new prompt drops at 9:00 AM local time. Before 9 AM you still see
 * yesterday's drop; the countdown always points at the next 9 AM.
 */
export function vibeDrop(now: number) {
  const shifted = new Date(now - DROP_HOUR * 3_600_000);
  const key = dayKey(shifted);
  const local = new Date(shifted.getFullYear(), shifted.getMonth(), shifted.getDate());
  const dayNumber = Math.floor(local.getTime() / 86_400_000 - local.getTimezoneOffset() / 1440);
  const prompt = DAILY_PROMPTS[((dayNumber % DAILY_PROMPTS.length) + DAILY_PROMPTS.length) % DAILY_PROMPTS.length];
  const next = new Date(now);
  next.setHours(DROP_HOUR, 0, 0, 0);
  if (next.getTime() <= now) next.setDate(next.getDate() + 1);
  return { key, prompt, number: dayNumber, msToNext: next.getTime() - now };
}

export function DailyVibeDrop() {
  const now = useNow();
  const [revealed, setRevealed] = useStored<string[]>("vibe-revealed", []);

  if (!now) return <div className="card h-72 animate-pulse" />;

  const drop = vibeDrop(now);
  const isRevealed = revealed.includes(drop.key);
  const dropNo = (((drop.number % 999) + 999) % 999) + 1;

  const reveal = () => {
    if (isRevealed) return;
    sfx.chime();
    markActive();
    setRevealed((r) => [...r.slice(-30), drop.key]);
  };

  return (
    <div className="card relative overflow-hidden bg-gradient-to-br from-white/80 via-amber-soft/40 to-rose-soft/50">
      <div className="flex items-center justify-between">
        <span className="chip border-amber/30 bg-white/80 text-amber">
          <Sparkles className="size-3.5" /> Drop #{dropNo}
        </span>
        <span className="flex items-center gap-1.5 text-xs font-bold text-ink-soft tabular-nums">
          <Hourglass className="size-3.5" /> Next in {formatCountdown(drop.msToNext)}
        </span>
      </div>

      <button
        type="button"
        onClick={reveal}
        className="relative mt-5 block min-h-40 w-full rounded-3xl text-left"
        aria-label={isRevealed ? "Today's prompt" : "Tap to reveal today's prompt"}
      >
        <motion.p
          initial={false}
          animate={{ filter: isRevealed ? "blur(0px)" : "blur(14px)", opacity: isRevealed ? 1 : 0.7, scale: isRevealed ? 1 : 0.97 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="headline text-[27px] leading-snug sm:text-3xl"
          aria-hidden={!isRevealed}
        >
          “{drop.prompt}”
        </motion.p>
        <AnimatePresence>
          {!isRevealed && (
            <motion.span
              exit={{ opacity: 0, scale: 1.2 }}
              className="absolute inset-0 grid place-items-center"
            >
              <motion.span
                animate={{ scale: [1, 1.06, 1] }}
                transition={{ duration: 1.6, repeat: Infinity }}
                className="btn-dark pointer-events-none"
              >
                <Eye className="size-4" /> Tap to reveal
              </motion.span>
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {isRevealed && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-5">
          <p className="mb-2 text-xs font-semibold text-ink-soft">Send it to your person and answer together tonight:</p>
          <ShareBar compact url={typeof window === "undefined" ? "" : window.location.origin} text={`☀️ Today's TwoFold Vibe Drop: “${drop.prompt}”`} />
        </motion.div>
      )}
    </div>
  );
}
