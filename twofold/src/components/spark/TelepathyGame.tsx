"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Brain, Check, RotateCcw, Shuffle, X } from "lucide-react";
import { useState } from "react";
import { TELEPATHY, type TelepathyQuestion } from "@data/spark";
import { ShareBar } from "@/components/ui/ShareBar";
import { sfx } from "@/lib/audio";
import { celebrate } from "@/lib/confetti";
import { useCouple } from "@/lib/couple";
import { buildLink } from "@/lib/share";
import { useHydrated } from "@/lib/storage";
import { markActive } from "@/lib/streak";

/** Link payload: creator name, 5 question ids, and the creator's true answers. */
export type TelepathyShare = { n: string; q: string[]; a: number[] };

const ROUNDS = 5;
const ROUND_SECONDS = 10;

function pickFive(offset: number) {
  return Array.from({ length: ROUNDS }, (_, i) => TELEPATHY[(offset + i * 3) % TELEPATHY.length]);
}

/** Creator mode: answer 5 quick questions about yourself, then send the link. */
export function TelepathyGame() {
  const { names } = useCouple();
  const hydrated = useHydrated();
  const [offset, setOffset] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const questions = pickFive(offset);
  const complete = questions.every((q) => answers[q.id] !== undefined);

  const payload: TelepathyShare = { n: names.a, q: questions.map((q) => q.id), a: questions.map((q) => answers[q.id] ?? 0) };
  const url = hydrated && complete ? buildLink("/telepathy", payload) : "";

  return (
    <div className="card">
      <div className="mb-4 flex items-center justify-between gap-2">
        <p className="text-sm text-ink-soft">Answer honestly about yourself. Your partner will have 10 seconds per round to guess.</p>
        <button
          type="button"
          className="btn-ghost shrink-0 px-3"
          aria-label="Shuffle questions"
          onClick={() => {
            sfx.pop();
            setOffset((o) => (o + 1) % TELEPATHY.length);
            setAnswers({});
          }}
        >
          <Shuffle className="size-4" />
        </button>
      </div>

      <ol className="grid gap-4">
        {questions.map((q, qi) => (
          <li key={q.id}>
            <p className="mb-2 text-[15px] font-semibold">
              <span className="mr-1.5 font-display text-rose italic">{qi + 1}.</span>
              {q.question}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {q.options.map((opt, oi) => {
                const on = answers[q.id] === oi;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      sfx.pop();
                      setAnswers({ ...answers, [q.id]: oi });
                    }}
                    className={`min-h-11 rounded-2xl border-2 px-3 py-2 text-left text-sm font-semibold transition active:scale-95 ${
                      on ? "border-rose bg-rose-soft/60 text-ink" : "border-transparent bg-white/70 text-ink-soft"
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-5 rounded-3xl bg-white/70 p-4">
        {complete ? (
          <>
            <p className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <Brain className="size-4 text-rose" /> Ready! Send this to {names.b}:
            </p>
            <ShareBar compact url={url} text={`🧠 Crush Telepathy: how well do you really know me? 5 rounds, 10 seconds each. Go!`} />
          </>
        ) : (
          <p className="text-sm text-ink-soft">
            {Object.keys(answers).length}/{ROUNDS} answered. Finish all five to get your challenge link.
          </p>
        )}
      </div>
    </div>
  );
}

/** Guesser mode: opened from the link, fast rounds with a draining timer. */
export function TelepathyPlay({ data }: { data: TelepathyShare }) {
  const questions = data.q.map((id) => TELEPATHY.find((t) => t.id === id)).filter(Boolean) as TelepathyQuestion[];
  const [round, setRound] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [timedOut, setTimedOut] = useState(false);
  const hydrated = useHydrated();

  const finished = round >= questions.length;
  const q = questions[round];
  const truth = data.a[round];
  const revealed = picked !== null || timedOut;

  const next = (finalScore: number) => {
    const nr = round + 1;
    setRound(nr);
    setPicked(null);
    setTimedOut(false);
    if (nr >= questions.length) {
      markActive();
      if (finalScore >= 3) {
        sfx.chime();
        celebrate();
      }
    }
  };

  const guess = (i: number) => {
    if (revealed) return;
    setPicked(i);
    const newScore = i === truth ? score + 1 : score;
    if (i === truth) sfx.chime();
    else sfx.boop();
    setScore(newScore);
    setTimeout(() => next(newScore), 1200);
  };

  if (finished) {
    const verdict =
      score === 5 ? "Actual mind-readers. 🔮" : score >= 3 ? "Strong telepathic link! 💞" : score >= 1 ? "Room for more late-night talks ☕" : "Time for a proper date to learn more 😄";
    const url = hydrated ? window.location.href : "";
    return (
      <div className="card text-center">
        <p className="font-script text-2xl text-rose">Telepathy score</p>
        <p className="headline text-7xl">
          {score}
          <span className="text-3xl text-ink-soft">/{questions.length}</span>
        </p>
        <p className="mt-2 text-lg font-semibold">{verdict}</p>
        <div className="mt-5">
          <ShareBar url={url} text={`I scored ${score}/${questions.length} on ${data.n}'s Crush Telepathy! 🧠💘 Can you beat me?`} />
        </div>
        <button
          type="button"
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft"
          onClick={() => {
            setRound(0);
            setScore(0);
          }}
        >
          <RotateCcw className="size-4" /> Play again
        </button>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="mb-3 flex items-center justify-between text-xs font-bold text-ink-soft">
        <span>
          Round {round + 1} / {questions.length}
        </span>
        <span>Score {score}</span>
      </div>
      <div className="mb-5 h-2 overflow-hidden rounded-full bg-white/80">
        {!revealed && (
          <motion.div
            key={round}
            className="h-full rounded-full bg-gradient-to-r from-sage via-amber to-rose"
            initial={{ width: "100%" }}
            animate={{ width: "0%" }}
            transition={{ duration: ROUND_SECONDS, ease: "linear" }}
            onAnimationComplete={() => {
              if (picked !== null) return;
              sfx.boop();
              setTimedOut(true);
              setTimeout(() => next(score), 1400);
            }}
          />
        )}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={round} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
          <p className="font-script text-xl text-rose">About {data.n}…</p>
          <h3 className="headline mb-4 text-2xl">{q.question}</h3>
          <div className="grid gap-2.5">
            {q.options.map((opt, i) => {
              const isTruth = revealed && i === truth;
              const isWrong = revealed && picked === i && i !== truth;
              return (
                <motion.button
                  key={opt}
                  type="button"
                  whileTap={{ scale: 0.97 }}
                  animate={isWrong ? { x: [0, -8, 8, -5, 5, 0] } : {}}
                  onClick={() => guess(i)}
                  className={`flex min-h-13 items-center justify-between rounded-2xl border-2 px-4 py-3 text-left font-semibold transition ${
                    isTruth ? "border-sage bg-sage-soft" : isWrong ? "border-rose bg-rose-soft/60" : "border-transparent bg-white/80"
                  }`}
                >
                  {opt}
                  {isTruth && <Check className="size-5 text-sage" />}
                  {isWrong && <X className="size-5 text-rose" />}
                </motion.button>
              );
            })}
          </div>
          {timedOut && <p className="mt-3 text-center text-sm font-semibold text-rose">⏰ Time&apos;s up!</p>}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
