"use client";

import { animate, AnimatePresence, motion, useMotionValue, useTransform, type PanInfo } from "framer-motion";
import { ArrowDown, Heart, RotateCcw, Undo2, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { QUIRKS, type Quirk } from "@data/spark";
import { ShareBar } from "@/components/ui/ShareBar";
import { sfx } from "@/lib/audio";
import { useCouple } from "@/lib/couple";
import { buildLink } from "@/lib/share";
import { useHydrated, useStored } from "@/lib/storage";
import { markActive } from "@/lib/streak";
import { fireworks } from "@/lib/confetti";

export type Verdict = "s" | "d" | "n"; // same / dealbreaker / neutral
export type QuirksShare = { n: string; r: string };

const LABEL: Record<Verdict, { text: string; color: string }> = {
  s: { text: "Same!", color: "#588157" },
  d: { text: "Dealbreaker", color: "#e06d53" },
  n: { text: "Neutral", color: "#d97706" },
};

const THRESHOLD = 110;

/** Encodes answers as one char per quirk ("s", "d", "n" or "-" for skipped). */
export const encodeVerdicts = (answers: Record<string, Verdict>) => QUIRKS.map((q) => answers[q.id] ?? "-").join("");

export function compareVerdicts(mine: Record<string, Verdict>, theirs: string) {
  let both = 0;
  let same = 0;
  const shared: Quirk[] = [];
  QUIRKS.forEach((q, i) => {
    const a = mine[q.id];
    const b = theirs[i] as Verdict | "-";
    if (!a || !b || b === "-") return;
    both++;
    if (a === b) {
      same++;
      if (a === "s") shared.push(q);
    }
  });
  return { score: both ? Math.round((same / both) * 100) : 0, shared };
}

type Props = { compareWith?: QuirksShare };

/** "Quirks & Green Flags": right = Same!, left = Dealbreaker, down = Neutral. */
export function SwipeDeck({ compareWith }: Props) {
  const storeKey = compareWith ? "quirks-compare" : "quirks";
  const [answers, setAnswers] = useStored<Record<string, Verdict>>(storeKey, {});
  const [history, setHistory] = useState<string[]>([]);
  const flingTop = useRef<((v: Verdict) => void) | null>(null);
  const { names } = useCouple();
  const hydrated = useHydrated();

  const remaining = QUIRKS.filter((q) => !answers[q.id]);
  const done = hydrated && remaining.length === 0;

  const decide = (q: Quirk, v: Verdict) => {
    sfx.swipe();
    markActive();
    setHistory((h) => [...h, q.id]);
    setAnswers((a) => {
      const next = { ...a, [q.id]: v };
      if (compareWith && QUIRKS.every((x) => next[x.id])) setTimeout(() => fireworks(1200), 250);
      return next;
    });
  };

  const press = (v: Verdict) => {
    if (flingTop.current) flingTop.current(v);
    else if (remaining[0]) decide(remaining[0], v);
  };

  const undo = () => {
    const last = history[history.length - 1];
    if (!last) return;
    sfx.pop();
    setHistory((h) => h.slice(0, -1));
    setAnswers((a) => {
      const next = { ...a };
      delete next[last];
      return next;
    });
  };

  const counts = Object.values(answers).reduce((acc, v) => ({ ...acc, [v]: (acc[v] ?? 0) + 1 }), {} as Record<Verdict, number>);
  const shareUrl = hydrated ? buildLink("/quirks", { n: names.a, r: encodeVerdicts(answers) } satisfies QuirksShare) : "";
  const comparison = compareWith && done ? compareVerdicts(answers, compareWith.r) : null;

  return (
    <div className="card">
      <div className="mb-3 flex items-center justify-between text-xs font-semibold text-ink-soft">
        <span>
          {hydrated ? QUIRKS.length - remaining.length : 0} / {QUIRKS.length} swiped
        </span>
        <span className="flex gap-3">
          <span className="text-sage">✓ {counts.s ?? 0}</span>
          <span className="text-amber">~ {counts.n ?? 0}</span>
          <span className="text-rose">✕ {counts.d ?? 0}</span>
        </span>
      </div>

      <div className="relative mx-auto h-[23rem] w-full max-w-sm">
        {!hydrated ? null : done ? (
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex h-full flex-col items-center justify-center text-center">
            {comparison ? (
              <>
                <p className="font-script text-2xl text-rose">You & {compareWith!.n}</p>
                <p className="headline text-7xl text-rose">{comparison.score}%</p>
                <p className="mt-1 text-sm text-ink-soft">quirk compatibility</p>
                {comparison.shared.length > 0 && (
                  <div className="mt-4 flex max-w-xs flex-wrap justify-center gap-1.5">
                    {comparison.shared.slice(0, 6).map((q) => (
                      <span key={q.id} className="chip border-sage/30 bg-sage-soft text-sage">
                        {q.emoji} {q.text.length > 26 ? q.text.slice(0, 24) + "…" : q.text}
                      </span>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <>
                <p className="text-5xl">🎉</p>
                <p className="headline mt-2 text-2xl">Deck complete!</p>
                <p className="mt-1 max-w-xs text-sm text-ink-soft">Send your answers. When they swipe too, you&apos;ll both see your compatibility score.</p>
                <div className="mt-4">
                  <ShareBar compact url={shareUrl} text={`I just swiped through ${QUIRKS.length} quirks on TwoFold. Can you match my green flags? 🚩💚`} />
                </div>
              </>
            )}
            <button
              type="button"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft"
              onClick={() => {
                setAnswers({});
                setHistory([]);
              }}
            >
              <RotateCcw className="size-4" /> Start over
            </button>
          </motion.div>
        ) : (
          <AnimatePresence>
            {remaining
              .slice(0, 3)
              .reverse()
              .map((q, i, arr) => (
                <SwipeCard
                  key={q.id}
                  quirk={q}
                  depth={arr.length - 1 - i}
                  onDecide={(v) => decide(q, v)}
                  register={(fn) => (flingTop.current = fn)}
                />
              ))}
          </AnimatePresence>
        )}
      </div>

      {!done && hydrated && (
        <div className="mt-5 flex items-center justify-center gap-3">
          <RoundBtn label="Dealbreaker" onClick={() => press("d")} className="text-rose">
            <X className="size-6" strokeWidth={3} />
          </RoundBtn>
          <RoundBtn label="Neutral" onClick={() => press("n")} className="size-12 text-amber">
            <ArrowDown className="size-5" strokeWidth={3} />
          </RoundBtn>
          <RoundBtn label="Same!" onClick={() => press("s")} className="text-sage">
            <Heart className="size-6 fill-current" />
          </RoundBtn>
          <RoundBtn label="Undo" onClick={undo} className="size-10 text-ink-soft" disabled={!history.length}>
            <Undo2 className="size-4" />
          </RoundBtn>
        </div>
      )}
      {compareWith && !done && (
        <p className="mt-4 text-center text-sm text-ink-soft">
          Comparing with <b>{compareWith.n}</b>&apos;s answers once you finish ✨
        </p>
      )}
      {compareWith && done && (
        <p className="mt-4 text-center">
          <Link href="/" className="text-sm font-semibold text-rose">
            Explore more of TwoFold →
          </Link>
        </p>
      )}
    </div>
  );
}

function RoundBtn({
  children,
  label,
  onClick,
  className = "",
  disabled,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={`grid size-14 place-items-center rounded-full bg-white shadow-soft transition active:scale-90 disabled:opacity-40 ${className}`}
    >
      {children}
    </button>
  );
}

type CardProps = {
  quirk: Quirk;
  depth: number;
  onDecide: (v: Verdict) => void;
  /** The top card hands its fling function to the deck so the buttons animate it too. */
  register?: (fling: ((v: Verdict) => void) | null) => void;
};

function SwipeCard({ quirk, depth, onDecide, register }: CardProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-220, 220], [-18, 18]);
  const sameOpacity = useTransform(x, [30, THRESHOLD], [0, 1]);
  const dealOpacity = useTransform(x, [-THRESHOLD, -30], [1, 0]);
  const neutralOpacity = useTransform(y, [30, THRESHOLD], [0, 1]);
  const [gone, setGone] = useState(false);
  const isTop = depth === 0;

  const fling = (v: Verdict) => {
    if (gone) return;
    setGone(true);
    const w = typeof window === "undefined" ? 600 : window.innerWidth;
    const out = { duration: 0.36, ease: [0.2, 0.7, 0.35, 1] } as const;
    if (v === "n") {
      animate(y, 700, { ...out, onComplete: () => onDecide(v) });
    } else {
      animate(y, 60, out);
      animate(x, v === "s" ? w : -w, { ...out, onComplete: () => onDecide(v) });
    }
  };

  useEffect(() => {
    if (!isTop || !register) return;
    register(fling);
    return () => register(null);
  });

  const onDragEnd = (_: unknown, info: PanInfo) => {
    const { offset, velocity } = info;
    if (offset.x > THRESHOLD || velocity.x > 700) return fling("s");
    if (offset.x < -THRESHOLD || velocity.x < -700) return fling("d");
    if (offset.y > THRESHOLD || velocity.y > 700) return fling("n");
    // Not far enough: rubber-band back to the centre.
    animate(x, 0, { type: "spring", stiffness: 420, damping: 24 });
    animate(y, 0, { type: "spring", stiffness: 420, damping: 24 });
  };

  return (
    // Outer layer: position in the stack. Inner layer: the draggable card itself.
    <motion.div
      className="absolute inset-0"
      style={{ zIndex: 10 - depth }}
      initial={{ scale: 0.9, y: 30, opacity: 0 }}
      animate={{ scale: 1 - depth * 0.05, y: depth * 14, opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.15 } }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
    >
      <motion.div
        className="absolute inset-0 touch-none"
        style={{ x, y, rotate }}
        drag={isTop && !gone}
        dragElastic={0.65}
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        dragMomentum={false}
        whileDrag={{ scale: 1.03, cursor: "grabbing" }}
        onDragEnd={onDragEnd}
      >
        <div className="relative flex h-full cursor-grab flex-col justify-between overflow-hidden rounded-[30px] border border-white bg-gradient-to-br from-white to-cream-deep p-6 shadow-lift">
          <div className="flex items-center justify-between">
            <span className="chip border-line bg-white/80 text-ink-soft">{quirk.tag}</span>
            <span className="text-xs font-semibold text-ink-soft/70">swipe →  ←  ↓</span>
          </div>
          <div className="text-center">
            <div className="text-7xl">{quirk.emoji}</div>
            <p className="headline mt-5 text-[26px] leading-tight">{quirk.text}</p>
          </div>
          <div className="grid grid-cols-3 text-center text-[11px] font-bold tracking-wider text-ink-soft/70 uppercase">
            <span>← Dealbreaker</span>
            <span>↓ Neutral</span>
            <span>Same! →</span>
          </div>

          <Stamp label="s" style={{ opacity: sameOpacity }} className="top-8 left-6 -rotate-12" />
          <Stamp label="d" style={{ opacity: dealOpacity }} className="top-8 right-6 rotate-12" />
          <Stamp label="n" style={{ opacity: neutralOpacity }} className="bottom-16 left-1/2 -translate-x-1/2" />
        </div>
      </motion.div>
    </motion.div>
  );
}

function Stamp({ label, style, className }: { label: Verdict; style: { opacity: import("framer-motion").MotionValue<number> }; className: string }) {
  const { text, color } = LABEL[label];
  return (
    <motion.span
      style={{ ...style, color, borderColor: color }}
      className={`pointer-events-none absolute rounded-xl border-4 bg-white/80 px-3 py-1 font-display text-2xl font-bold tracking-wide uppercase ${className}`}
    >
      {text}
    </motion.span>
  );
}
