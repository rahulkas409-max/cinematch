"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Trophy } from "lucide-react";
import { useState } from "react";
import { burst } from "@/lib/confetti";
import { play } from "@/lib/sound";

export interface Riddle {
  emoji: string;
  answerId: string;
  options: { id: string; title: string; year: number }[];
}

const splitEmoji = (s: string) => {
  const Seg = (Intl as unknown as { Segmenter?: new (l?: string, o?: { granularity: string }) => { segment: (s: string) => Iterable<{ segment: string }> } }).Segmenter;
  return Seg ? Array.from(new Seg(undefined, { granularity: "grapheme" }).segment(s), (x) => x.segment) : Array.from(s);
};

export function EmojiRiddle({ riddles, onDone }: { riddles: Riddle[]; onDone: (score: number, total: number) => void }) {
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);
  const r = riddles[i];

  const pick = (id: string) => {
    if (picked) return;
    setPicked(id);
    const correct = id === r.answerId;
    if (correct) {
      setScore((s) => s + 1);
      play("correct");
      burst({ particleCount: 40, spread: 55, origin: { y: 0.45 } });
    } else play("wrong");
  };

  const next = () => {
    if (i + 1 >= riddles.length) setFinished(true);
    else {
      setI(i + 1);
      setPicked(null);
    }
  };

  if (finished) {
    const pct = score / riddles.length;
    const title = pct === 1 ? "Certified Cinephile 🏆" : pct >= 0.6 ? "Film Buff 🎬" : pct >= 0.4 ? "Weekend Watcher 🍿" : "Fresh Popcorn 🌱";
    return (
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
        <Trophy size={52} className="mx-auto text-amber drop-shadow-[0_0_20px_var(--amber)]" />
        <p className="font-display text-5xl font-extrabold mt-4 neon-text">
          {score}/{riddles.length}
        </p>
        <p className="font-display text-xl mt-2">{title}</p>
        <p className="text-muted text-sm mt-2 max-w-xs mx-auto">
          {pct >= 0.6 ? "High scorers get a few deeper cuts mixed into their picks." : "We'll keep your picks crowd-pleasing and easy to love."}
        </p>
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => onDone(score, riddles.length)}
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-pink to-violet px-7 py-3.5 font-display font-bold"
        >
          Reveal my matches <ArrowRight size={18} />
        </motion.button>
      </motion.div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex items-center justify-between text-sm text-muted mb-4">
        <span>
          Riddle {i + 1} of {riddles.length}
        </span>
        <motion.span key={score} initial={{ scale: 1.6, color: "#b6ff3b" }} animate={{ scale: 1, color: "#a39fbd" }} className="font-bold tabular-nums">
          Score {score}
        </motion.span>
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={i} initial={{ x: 60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -60, opacity: 0 }}>
          <div className="glass rounded-3xl py-8 flex justify-center gap-3 sm:gap-5 text-6xl sm:text-7xl">
            {splitEmoji(r.emoji).map((e, k) => (
              <motion.span key={k} initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.15 + k * 0.18, type: "spring", stiffness: 300 }}>
                {e}
              </motion.span>
            ))}
          </div>
          <div className="grid gap-2.5 mt-5">
            {r.options.map((o) => {
              const isAnswer = o.id === r.answerId;
              const state = !picked ? "idle" : isAnswer ? "right" : o.id === picked ? "wrong" : "dim";
              return (
                <motion.button
                  key={o.id}
                  onClick={() => pick(o.id)}
                  disabled={!!picked}
                  whileHover={!picked ? { scale: 1.02, x: 4 } : undefined}
                  whileTap={!picked ? { scale: 0.98 } : undefined}
                  animate={state === "wrong" ? { x: [0, -10, 10, -6, 6, 0] } : state === "right" ? { scale: [1, 1.05, 1] } : {}}
                  className={`text-left rounded-2xl px-4 py-3 border transition-colors ${
                    state === "right"
                      ? "border-lime bg-lime/15 text-lime"
                      : state === "wrong"
                        ? "border-pink bg-pink/15 text-pink"
                        : state === "dim"
                          ? "border-line opacity-50"
                          : "border-line bg-surface-2 hover:border-cyan"
                  }`}
                >
                  <span className="font-semibold">{o.title}</span> <span className="text-xs opacity-70">({o.year})</span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>
      <div className="h-16 flex items-center justify-center">
        {picked && (
          <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} onClick={next} className="inline-flex items-center gap-2 rounded-full bg-surface-2 border border-line px-5 py-2.5 font-semibold hover:border-pink">
            {picked === r.answerId ? "Nailed it! Next" : "Next riddle"} <ArrowRight size={16} />
          </motion.button>
        )}
      </div>
    </div>
  );
}
