"use client";

import { AnimatePresence, motion } from "framer-motion";
import { EyeOff, RotateCcw, Smartphone } from "lucide-react";
import { useState } from "react";
import { DATE_IDEAS } from "@data/spark";
import { ShareBar } from "@/components/ui/ShareBar";
import { sfx } from "@/lib/audio";
import { fireworks } from "@/lib/confetti";
import { useCouple } from "@/lib/couple";
import { buildLink } from "@/lib/share";
import { useHydrated } from "@/lib/storage";
import { markActive } from "@/lib/streak";

/** Link payload: first player's name and their 3 secret picks (indices into DATE_IDEAS). */
export type MatchShare = { n: string; p: number[] };

const PICKS = 3;

function TileGrid({ picks, onToggle, disabled }: { picks: number[]; onToggle: (i: number) => void; disabled?: boolean }) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
      {DATE_IDEAS.map((d, i) => {
        const on = picks.includes(i);
        return (
          <motion.button
            key={d.id}
            type="button"
            disabled={disabled}
            whileTap={{ scale: 0.93 }}
            animate={{ scale: on ? 1.04 : 1, rotate: on ? (i % 2 ? 2 : -2) : 0 }}
            onClick={() => onToggle(i)}
            className={`flex aspect-square flex-col items-center justify-center gap-1 rounded-3xl border-2 p-2 text-center transition-colors ${
              on ? "border-rose bg-rose-soft/70 shadow-lift" : "border-white bg-white/75 shadow-soft"
            }`}
          >
            <span className="text-3xl">{d.emoji}</span>
            <span className="text-[12px] leading-tight font-semibold">{d.title}</span>
          </motion.button>
        );
      })}
    </div>
  );
}

function usePicker() {
  const [picks, setPicks] = useState<number[]>([]);
  const toggle = (i: number) => {
    setPicks((p) => {
      if (p.includes(i)) {
        sfx.pop();
        return p.filter((x) => x !== i);
      }
      if (p.length >= PICKS) {
        sfx.boop();
        return p;
      }
      sfx.pop();
      return [...p, i];
    });
  };
  return { picks, toggle, reset: () => setPicks([]) };
}

function Reveal({ a, b, nameA, nameB, onReset }: { a: number[]; b: number[]; nameA: string; nameB: string; onReset?: () => void }) {
  const mutual = a.filter((i) => b.includes(i));
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
      <p className="font-script text-2xl text-rose">{mutual.length ? "It's a match!" : "No overlap… yet"}</p>
      <h3 className="headline text-3xl">
        {mutual.length} mutual pick{mutual.length === 1 ? "" : "s"}
      </h3>
      <div className="mt-5 grid grid-cols-3 gap-2">
        {DATE_IDEAS.map((d, i) => {
          const isMutual = mutual.includes(i);
          return (
            <motion.div
              key={d.id}
              initial={{ rotateY: 180, opacity: 0 }}
              animate={{ rotateY: 0, opacity: isMutual ? 1 : 0.28 }}
              transition={{ delay: 0.1 + i * 0.05, type: "spring", stiffness: 200, damping: 18 }}
              className={`flex aspect-square flex-col items-center justify-center gap-1 rounded-3xl p-2 ${
                isMutual ? "bg-gradient-to-br from-rose to-amber text-white shadow-lift" : "bg-white/60"
              }`}
            >
              <span className="text-3xl">{d.emoji}</span>
              <span className="text-[12px] leading-tight font-semibold">{d.title}</span>
            </motion.div>
          );
        })}
      </div>
      {!mutual.length && (
        <p className="mt-4 text-sm text-ink-soft">
          {nameA} and {nameB} want different adventures. Pick one each and take turns!
        </p>
      )}
      {onReset && (
        <button type="button" onClick={onReset} className="btn-ghost mt-5">
          <RotateCcw className="size-4" /> Play again
        </button>
      )}
    </motion.div>
  );
}

/** Tab mode: pass-the-phone on one device, or send player 1's secret picks as a link. */
export function BlindMatcher() {
  const { names } = useCouple();
  const hydrated = useHydrated();
  const p1 = usePicker();
  const p2 = usePicker();
  const [stage, setStage] = useState<"p1" | "handoff" | "p2" | "reveal">("p1");

  const url = hydrated && p1.picks.length === PICKS ? buildLink("/match", { n: names.a, p: p1.picks } satisfies MatchShare) : "";

  const reset = () => {
    p1.reset();
    p2.reset();
    setStage("p1");
  };

  return (
    <div className="card">
      <AnimatePresence mode="wait">
        <motion.div key={stage} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
          {stage === "p1" && (
            <>
              <p className="mb-3 text-sm font-semibold">
                {names.a}, secretly pick <b className="text-rose">{PICKS - p1.picks.length}</b> more date idea{PICKS - p1.picks.length === 1 ? "" : "s"}
              </p>
              <TileGrid picks={p1.picks} onToggle={p1.toggle} />
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <button type="button" className="btn-dark" disabled={p1.picks.length !== PICKS} onClick={() => setStage("handoff")}>
                  <Smartphone className="size-4" /> Pass the phone
                </button>
                <div className={p1.picks.length === PICKS ? "" : "pointer-events-none opacity-40"}>
                  <ShareBar compact url={url} text={`🙈 Blind Date Matcher: I secretly picked 3 date ideas. Pick yours and see where we match!`} />
                </div>
              </div>
            </>
          )}

          {stage === "handoff" && (
            <div className="py-8 text-center">
              <EyeOff className="mx-auto size-12 text-rose" />
              <h3 className="headline mt-3 text-2xl">Picks locked 🔒</h3>
              <p className="mt-1 text-ink-soft">Hand the phone to {names.b}. No peeking!</p>
              <button type="button" className="btn-primary mt-6" onClick={() => setStage("p2")}>
                I&apos;m {names.b}, let me pick
              </button>
            </div>
          )}

          {stage === "p2" && (
            <>
              <p className="mb-3 text-sm font-semibold">
                {names.b}, pick <b className="text-rose">{PICKS - p2.picks.length}</b> more
              </p>
              <TileGrid picks={p2.picks} onToggle={p2.toggle} />
              <button
                type="button"
                className="btn-primary mt-5 w-full"
                disabled={p2.picks.length !== PICKS}
                onClick={() => {
                  markActive();
                  setStage("reveal");
                  if (p1.picks.some((i) => p2.picks.includes(i))) {
                    sfx.chime();
                    fireworks();
                  } else sfx.boop();
                }}
              >
                Reveal our matches ✨
              </button>
            </>
          )}

          {stage === "reveal" && <Reveal a={p1.picks} b={p2.picks} nameA={names.a} nameB={names.b} onReset={reset} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/** Link mode: the partner opening /match picks their 3, then sees the mutual reveal. */
export function BlindMatchPlay({ data }: { data: MatchShare }) {
  const me = usePicker();
  const [revealed, setRevealed] = useState(false);
  return (
    <div className="card">
      {revealed ? (
        <Reveal a={data.p} b={me.picks} nameA={data.n} nameB="you" />
      ) : (
        <>
          <p className="mb-3 text-sm font-semibold">
            {data.n} already locked in 3 secret picks. Choose <b className="text-rose">{PICKS - me.picks.length}</b> of yours:
          </p>
          <TileGrid picks={me.picks} onToggle={me.toggle} />
          <button
            type="button"
            className="btn-primary mt-5 w-full"
            disabled={me.picks.length !== PICKS}
            onClick={() => {
              markActive();
              setRevealed(true);
              if (data.p.some((i) => me.picks.includes(i))) {
                sfx.chime();
                fireworks();
              } else sfx.boop();
            }}
          >
            Reveal our matches ✨
          </button>
        </>
      )}
    </div>
  );
}
