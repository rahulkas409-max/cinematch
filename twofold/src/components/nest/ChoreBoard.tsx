"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, RotateCcw, X } from "lucide-react";
import { CHORES } from "@data/weekender";
import { sfx } from "@/lib/audio";
import { originFromEvent, sparkle } from "@/lib/confetti";
import { useCouple } from "@/lib/couple";
import { useStored } from "@/lib/storage";
import { markActive } from "@/lib/streak";

type Who = "a" | "b";
type Board = { me: Who; claims: Record<string, Who | undefined>; points: Record<Who, number> };

const INITIAL: Board = { me: "a", claims: {}, points: { a: 0, b: 0 } };

/** Tap to claim, tap again to finish. Finishing a chore earns a heart point. */
export function ChoreBoard() {
  const { names } = useCouple();
  const [board, setBoard] = useStored<Board>("chores", INITIAL);
  const nm = (w: Who) => (w === "a" ? names.a : names.b);
  const total = board.points.a + board.points.b;
  const shareA = total ? Math.round((board.points.a / total) * 100) : 50;

  const tap = (id: string, e: React.MouseEvent) => {
    const owner = board.claims[id];
    if (!owner) {
      sfx.pop();
      setBoard({ ...board, claims: { ...board.claims, [id]: board.me } });
      return;
    }
    sfx.chime();
    markActive();
    const o = originFromEvent(e);
    sparkle(o.x, o.y);
    setBoard({ ...board, claims: { ...board.claims, [id]: undefined }, points: { ...board.points, [owner]: board.points[owner] + 1 } });
  };

  const release = (id: string) => {
    sfx.boop();
    setBoard({ ...board, claims: { ...board.claims, [id]: undefined } });
  };

  return (
    <div className="card">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <span className="text-ink-soft">I am</span>
          <div className="flex rounded-full bg-white/70 p-1">
            {(["a", "b"] as Who[]).map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => setBoard({ ...board, me: w })}
                className="relative rounded-full px-3 py-1.5 text-[13px]"
              >
                {board.me === w && <motion.span layoutId="chore-me" className="absolute inset-0 rounded-full bg-sage" />}
                <span className={`relative ${board.me === w ? "text-white" : "text-ink-soft"}`}>{nm(w)}</span>
              </button>
            ))}
          </div>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-1 text-xs font-semibold text-ink-soft"
          onClick={() => setBoard({ ...INITIAL, me: board.me })}
        >
          <RotateCcw className="size-3.5" /> New week
        </button>
      </div>

      {/* Harmony meter */}
      <div className="mb-5">
        <div className="mb-1.5 flex justify-between text-xs font-semibold">
          <span>
            {nm("a")} · {board.points.a} ♥
          </span>
          <span className="text-ink-soft">{Math.abs(shareA - 50) <= 10 ? "Beautiful balance 🌿" : "Tip the scales?"}</span>
          <span>
            {board.points.b} ♥ · {nm("b")}
          </span>
        </div>
        <div className="flex h-3 overflow-hidden rounded-full bg-white/80">
          <motion.div className="h-full bg-rose" animate={{ width: `${shareA}%` }} transition={{ type: "spring", stiffness: 120, damping: 20 }} />
          <div className="h-full flex-1 bg-sage" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {CHORES.map((c) => {
          const owner = board.claims[c.id];
          return (
            <motion.div key={c.id} layout className="relative">
              <motion.button
                type="button"
                whileTap={{ scale: 0.94 }}
                onClick={(e) => tap(c.id, e)}
                className={`flex aspect-[1/1.05] w-full flex-col items-center justify-center gap-1.5 rounded-3xl border-2 p-3 transition-colors ${
                  owner === "a" ? "border-rose bg-rose-soft/60" : owner === "b" ? "border-sage bg-sage-soft" : "border-white bg-white/75 shadow-soft"
                }`}
              >
                <motion.span className="text-4xl" animate={owner ? { rotate: [0, -8, 8, 0] } : { rotate: 0 }} transition={{ duration: 0.5 }}>
                  {c.emoji}
                </motion.span>
                <span className="text-sm font-semibold">{c.title}</span>
                <AnimatePresence mode="wait">
                  {owner ? (
                    <motion.span key="own" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-1 text-[11px] font-bold text-ink">
                      <Check className="size-3" /> {nm(owner)} · tap when done
                    </motion.span>
                  ) : (
                    <motion.span key="free" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-[11px] font-semibold text-ink-soft">
                      Tap to claim
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
              {owner && (
                <button
                  type="button"
                  aria-label={`Release ${c.title}`}
                  onClick={() => release(c.id)}
                  className="absolute -top-1.5 -right-1.5 grid size-7 place-items-center rounded-full bg-white text-ink-soft shadow"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
