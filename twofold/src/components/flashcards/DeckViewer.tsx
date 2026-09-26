"use client";

import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import { ChevronLeft, ChevronRight, Shuffle } from "lucide-react";
import { useRef, useState } from "react";
import { sfx } from "@/lib/audio";
import { FlipCard } from "./FlipCard";

export type ViewerCard = { id: string; front: string; back: string[] | string };

type Props = {
  cards: ViewerCard[];
  accent: string;
  deckLabel: string;
  frontHint?: string;
  backTitle?: string;
};

/**
 * One card at a time: tap to flip, swipe sideways (or use the arrows) to move
 * through the deck. Leaving a card resets it to its front.
 */
export function DeckViewer({ cards, accent, deckLabel, frontHint = "Tap to flip", backTitle = "Talk about it" }: Props) {
  const [order, setOrder] = useState<number[] | null>(null);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [dir, setDir] = useState(1);
  const dragged = useRef(false);

  const seq = order && order.length === cards.length ? order : cards.map((_, i) => i);
  const safeIndex = Math.min(index, Math.max(cards.length - 1, 0));
  const card = cards[seq[safeIndex]];

  if (!card) {
    return <div className="grid h-[26rem] place-items-center rounded-[30px] border-2 border-dashed border-line text-sm text-ink-soft">No cards yet</div>;
  }

  const go = (delta: number) => {
    sfx.swipe();
    setDir(delta);
    setFlipped(false);
    setIndex((i) => (Math.min(i, cards.length - 1) + delta + cards.length) % cards.length);
  };

  const shuffle = () => {
    sfx.pop();
    const next = cards.map((_, i) => i);
    for (let i = next.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [next[i], next[j]] = [next[j], next[i]];
    }
    setOrder(next);
    setIndex(0);
    setFlipped(false);
  };

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (Math.abs(info.offset.x) > 70 || Math.abs(info.velocity.x) > 500) go(info.offset.x < 0 ? 1 : -1);
    setTimeout(() => (dragged.current = false), 50);
  };

  const back = Array.isArray(card.back) ? card.back : [card.back];

  return (
    <div className="mx-auto w-full max-w-sm">
      <div className="relative h-[26rem]">
        {/* Stack edges behind the active card */}
        <div className="absolute inset-x-6 top-4 bottom-0 rotate-2 rounded-[30px] bg-white/50 shadow-soft" />
        <div className="absolute inset-x-3 top-2 bottom-0 -rotate-1 rounded-[30px] bg-white/70 shadow-soft" />

        <AnimatePresence mode="popLayout" initial={false} custom={dir}>
          <motion.div
            key={card.id + safeIndex}
            custom={dir}
            className="absolute inset-0 touch-pan-y"
            initial={{ x: dir * 260, opacity: 0, rotate: dir * 8 }}
            animate={{ x: 0, opacity: 1, rotate: 0 }}
            exit={{ x: dir * -260, opacity: 0, rotate: dir * -8 }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.5}
            onDragStart={() => (dragged.current = true)}
            onDragEnd={onDragEnd}
          >
            <FlipCard
              className="h-full"
              flipped={flipped}
              onFlip={setFlipped}
              accent={accent}
              shouldFlip={() => !dragged.current}
              front={
                <>
                  <span className="text-[11px] font-bold tracking-[0.18em] uppercase" style={{ color: accent }}>
                    {deckLabel}
                  </span>
                  <p className="headline my-auto text-[26px] leading-snug">{card.front}</p>
                  <span className="flex items-center justify-between text-xs font-semibold text-ink-soft">
                    <span>
                      {safeIndex + 1} / {cards.length}
                    </span>
                    <span>{frontHint} ↻</span>
                  </span>
                </>
              }
              back={
                <>
                  <span className="text-[11px] font-bold tracking-[0.18em] text-cream/70 uppercase">{backTitle}</span>
                  <ul className="my-auto grid gap-3">
                    {back.map((b) => (
                      <li key={b} className="flex gap-2.5 text-[17px] leading-snug">
                        <span className="mt-2 size-1.5 shrink-0 rounded-full bg-cream/80" />
                        {b}
                      </li>
                    ))}
                  </ul>
                  <span className="font-script text-xl text-cream/80">take turns answering ♡</span>
                </>
              }
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-5 flex items-center justify-between">
        <button type="button" onClick={() => go(-1)} className="glass grid size-12 place-items-center rounded-full active:scale-90" aria-label="Previous card">
          <ChevronLeft className="size-5" />
        </button>
        <div className="flex items-center gap-1">
          {cards.length <= 20 ? (
            seq.map((_, i) => (
              <span key={i} className="h-1.5 rounded-full transition-all" style={{ width: i === safeIndex ? 18 : 6, background: i === safeIndex ? accent : "#e5d9cf" }} />
            ))
          ) : (
            <span className="text-xs font-bold text-ink-soft tabular-nums">
              {safeIndex + 1} / {cards.length}
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={shuffle} className="glass grid size-12 place-items-center rounded-full active:scale-90" aria-label="Shuffle deck">
            <Shuffle className="size-4" />
          </button>
          <button type="button" onClick={() => go(1)} className="glass grid size-12 place-items-center rounded-full active:scale-90" aria-label="Next card">
            <ChevronRight className="size-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
