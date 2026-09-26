"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { useState } from "react";
import { VIBES, type Movie, type VibeId } from "@/data/movies";
import { play } from "@/lib/sound";
import type { QuizProfile } from "@/lib/types";
import { EmojiRiddle, type Riddle } from "./EmojiRiddle";
import { SwipeDeck } from "./SwipeDeck";

const STEPS = [
  { id: "vibes", title: "Pick your vibe", sub: "Choose up to 3 moods for tonight" },
  { id: "dials", title: "Tune the dials", sub: "Era and runtime — slide to taste" },
  { id: "swipe", title: "Would you watch this right now?", sub: "Swipe right to watch, left to skip" },
  { id: "emoji", title: "Emoji riddles", sub: "3 emojis, 1 movie. Prove your cinephile cred" },
] as const;

const eraLabel = (v: number) => (v < 20 ? "📼 Deep retro (70s–80s)" : v < 45 ? "📺 90s nostalgia" : v < 70 ? "💿 2000s sweet spot" : "📱 Fresh & modern (2010+)");
const runtimeLabel = (v: number) => (v < 25 ? "🍿 Snack-size (< 90 min)" : v < 55 ? "🥪 Regular meal (~2 h)" : v < 80 ? "🍛 Full thali (2–2.5 h)" : "🏰 Epic saga (> 2.5 h)");

export function VibeQuiz({ onComplete }: { onComplete: (p: QuizProfile) => void }) {
  const [step, setStep] = useState(0);
  const [vibes, setVibes] = useState<VibeId[]>([]);
  const [era, setEra] = useState(60);
  const [runtime, setRuntime] = useState(45);
  const [liked, setLiked] = useState<string[]>([]);
  const [passed, setPassed] = useState<string[]>([]);
  const [deck, setDeck] = useState<{ swipe: Movie[]; riddles: Riddle[] } | null>(null);
  const [loadingDeck, setLoadingDeck] = useState(false);

  const toggleVibe = (id: VibeId) => {
    play("pop");
    setVibes((v) => (v.includes(id) ? v.filter((x) => x !== id) : v.length >= 3 ? [...v.slice(1), id] : [...v, id]));
  };

  const goToSwipe = async () => {
    setLoadingDeck(true);
    try {
      const res = await fetch("/api/deck", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ vibes }) });
      setDeck(await res.json());
      setStep(2);
    } finally {
      setLoadingDeck(false);
    }
  };

  const s = STEPS[step];

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* progress */}
      <div className="flex gap-2 mb-6" aria-label={`Step ${step + 1} of ${STEPS.length}`}>
        {STEPS.map((x, i) => (
          <div key={x.id} className="h-1.5 flex-1 rounded-full bg-line overflow-hidden">
            <motion.div className="h-full bg-gradient-to-r from-pink to-cyan" initial={false} animate={{ width: i <= step ? "100%" : "0%" }} transition={{ duration: 0.5 }} />
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={s.id} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }} transition={{ duration: 0.3 }}>
          <div className="text-center mb-8">
            <p className="text-xs uppercase tracking-[0.3em] text-cyan">Step {step + 1}</p>
            <h2 className="font-display text-2xl sm:text-4xl font-extrabold mt-2">{s.title}</h2>
            <p className="text-muted mt-2">{s.sub}</p>
          </div>

          {s.id === "vibes" && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {VIBES.map((v, i) => {
                  const on = vibes.includes(v.id);
                  return (
                    <motion.button
                      key={v.id}
                      onClick={() => toggleVibe(v.id)}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: on ? 1.04 : 1 }}
                      transition={{ delay: i * 0.04, type: "spring", stiffness: 300, damping: 18 }}
                      whileHover={{ y: -4, rotate: i % 2 ? 2 : -2 }}
                      whileTap={{ scale: 0.94 }}
                      aria-pressed={on}
                      className={`relative rounded-2xl p-4 text-left overflow-hidden border-2 min-h-32 ${on ? "border-white" : "border-transparent"}`}
                      style={{ background: `linear-gradient(145deg, ${v.from}, ${v.to})`, boxShadow: on ? `0 0 28px ${v.from}` : undefined }}
                    >
                      <span className="absolute inset-0 bg-black/35" />
                      <motion.span className="relative block text-4xl" animate={on ? { rotate: [0, -15, 15, 0], scale: [1, 1.3, 1] } : {}} transition={{ duration: 0.5 }}>
                        {v.emoji}
                      </motion.span>
                      <span className="relative block font-display font-bold mt-2 leading-tight">{v.label}</span>
                      <span className="relative block text-xs text-white/80 mt-1">{v.blurb}</span>
                      {on && <span className="absolute top-2 right-2 grid place-items-center size-6 rounded-full bg-white text-bg text-xs font-bold">{vibes.indexOf(v.id) + 1}</span>}
                    </motion.button>
                  );
                })}
              </div>
              <Nav canNext={vibes.length > 0} onNext={() => { play("pop"); setStep(1); }} nextLabel={vibes.length ? "Lock in my vibe" : "Pick at least one"} />
            </>
          )}

          {s.id === "dials" && (
            <>
              <div className="glass rounded-3xl p-6 sm:p-8 space-y-10">
                <Dial label="Era" left="📼 Retro" right="📱 Modern" value={era} onChange={setEra} readout={eraLabel(era)} />
                <Dial label="Runtime" left="🍿 Snack" right="🏰 Epic" value={runtime} onChange={setRuntime} readout={runtimeLabel(runtime)} />
              </div>
              <Nav onBack={() => setStep(0)} canNext={!loadingDeck} onNext={goToSwipe} nextLabel={loadingDeck ? "Shuffling cards…" : "Start swiping"} loading={loadingDeck} />
            </>
          )}

          {s.id === "swipe" && deck && (
            <SwipeDeck
              movies={deck.swipe}
              onDone={(l, p) => {
                setLiked(l);
                setPassed(p);
                setStep(3);
              }}
            />
          )}

          {s.id === "emoji" && deck && (
            <EmojiRiddle riddles={deck.riddles} onDone={(score, total) => onComplete({ vibes, era, runtime, liked, passed, emojiScore: score, emojiTotal: total })} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function Dial({ label, left, right, value, onChange, readout }: { label: string; left: string; right: string; value: number; onChange: (v: number) => void; readout: string }) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-4">
        <span className="font-display font-bold text-lg">{label}</span>
        <motion.span key={readout} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-sm font-semibold text-cyan">
          {readout}
        </motion.span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        onPointerUp={() => play("pop")}
        className="neon-range w-full"
        aria-label={label}
        aria-valuetext={readout}
      />
      <div className="flex justify-between text-xs text-muted mt-2">
        <span>{left}</span>
        <span>{right}</span>
      </div>
    </div>
  );
}

function Nav({ onBack, onNext, canNext, nextLabel, loading }: { onBack?: () => void; onNext: () => void; canNext: boolean; nextLabel: string; loading?: boolean }) {
  return (
    <div className="flex items-center justify-between mt-8 gap-3">
      {onBack ? (
        <button onClick={onBack} className="inline-flex items-center gap-1.5 rounded-full px-4 py-3 text-muted hover:text-ink">
          <ArrowLeft size={16} /> Back
        </button>
      ) : (
        <span />
      )}
      <motion.button
        whileHover={canNext ? { scale: 1.04 } : undefined}
        whileTap={canNext ? { scale: 0.96 } : undefined}
        disabled={!canNext}
        onClick={onNext}
        className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-pink to-violet px-6 py-3.5 font-display font-bold disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading && <Loader2 size={16} className="animate-spin" />}
        {nextLabel} {!loading && <ArrowRight size={18} />}
      </motion.button>
    </div>
  );
}
