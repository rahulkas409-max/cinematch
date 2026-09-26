"use client";

import { animate, motion, useMotionValue, useMotionValueEvent, useAnimationControls } from "framer-motion";
import { Dices } from "lucide-react";
import { useRef, useState } from "react";
import { ROULETTE_FILTERS, ROULETTE_IDEAS, type RouletteFilter } from "@data/weekender";
import { sfx } from "@/lib/audio";
import { celebrate } from "@/lib/confetti";
import { markActive } from "@/lib/streak";

const COLORS = ["#e06d53", "#fbe3bf", "#588157", "#f6d3c8", "#d97706", "#dbe7d6", "#c4533b", "#fdf1e6"];
const DARK = new Set(["#e06d53", "#588157", "#d97706", "#c4533b"]);
const R = 150;

function slicePath(i: number, n: number) {
  const a0 = (i / n) * Math.PI * 2 - Math.PI / 2;
  const a1 = ((i + 1) / n) * Math.PI * 2 - Math.PI / 2;
  const x0 = R + R * Math.cos(a0);
  const y0 = R + R * Math.sin(a0);
  const x1 = R + R * Math.cos(a1);
  const y1 = R + R * Math.sin(a1);
  return `M${R},${R} L${x0},${y0} A${R},${R} 0 0 1 ${x1},${y1} Z`;
}

/** Spinning date wheel with deceleration easing and per-peg ticks. */
export function RouletteWheel() {
  const [filter, setFilter] = useState<RouletteFilter>("cozy");
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const rotation = useMotionValue(0);
  const pointer = useAnimationControls();
  const lastSeg = useRef(-1);

  const ideas = ROULETTE_IDEAS[filter];
  const n = ideas.length;
  const seg = 360 / n;

  useMotionValueEvent(rotation, "change", (r) => {
    const s = Math.floor((((360 - (r % 360)) % 360) + 360) % 360 / seg);
    if (s !== lastSeg.current) {
      lastSeg.current = s;
      if (spinning) {
        sfx.tick();
        void pointer.start({ rotate: [0, -18, 0], transition: { duration: 0.12 } });
      }
    }
  });

  const spin = () => {
    if (spinning) return;
    setResult(null);
    setSpinning(true);
    markActive();
    const winner = Math.floor(Math.random() * n);
    const current = rotation.get();
    const jitter = (Math.random() - 0.5) * seg * 0.6;
    const landing = (360 - (winner + 0.5) * seg + jitter + 360) % 360;
    const base = current - (current % 360);
    const target = base + 360 * (5 + Math.floor(Math.random() * 3)) + landing;
    animate(rotation, target, {
      duration: 4.8,
      ease: [0.12, 0.72, 0.14, 1],
      onComplete: () => {
        setSpinning(false);
        setResult(ideas[winner]);
        sfx.chime();
        celebrate();
      },
    });
  };

  return (
    <div className="card">
      <div className="no-scrollbar -mx-1 mb-5 flex gap-2 overflow-x-auto px-1">
        {ROULETTE_FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            disabled={spinning}
            onClick={() => {
              sfx.pop();
              setFilter(f.id);
              setResult(null);
            }}
            className={`chip shrink-0 ${filter === f.id ? "border-ink bg-ink text-cream" : "border-line bg-white/70 text-ink-soft"}`}
          >
            {f.emoji} {f.label}
          </button>
        ))}
      </div>

      <div className="relative mx-auto aspect-square w-full max-w-[20rem]">
        <motion.div animate={pointer} style={{ originX: 0.5, originY: 0.15 }} className="absolute -top-3 left-1/2 z-10 -ml-4">
          <svg width="32" height="40" viewBox="0 0 32 40" aria-hidden>
            <path d="M16 40 L2 10 A14 14 0 1 1 30 10 Z" fill="#1e293b" />
            <circle cx="16" cy="13" r="5" fill="#faf7f5" />
          </svg>
        </motion.div>

        <div className="absolute inset-0 rounded-full bg-white p-2 shadow-lift">
          <motion.svg viewBox={`0 0 ${R * 2} ${R * 2}`} className="h-full w-full" style={{ rotate: rotation }}>
            {ideas.map((idea, i) => {
              const mid = ((i + 0.5) / n) * 360;
              const fill = COLORS[i % COLORS.length];
              return (
                <g key={idea}>
                  <path d={slicePath(i, n)} fill={fill} stroke="#fff" strokeWidth={2} />
                  <text
                    x={R}
                    y={R - R * 0.62}
                    transform={`rotate(${mid} ${R} ${R})`}
                    textAnchor="middle"
                    className="font-sans"
                    fontSize={11}
                    fontWeight={700}
                    fill={DARK.has(fill) ? "#fff" : "#1e293b"}
                  >
                    {idea.length > 16 ? idea.slice(0, 15) + "…" : idea}
                  </text>
                </g>
              );
            })}
            {ideas.map((_, i) => {
              const a = (i / n) * Math.PI * 2 - Math.PI / 2;
              return <circle key={i} cx={R + (R - 7) * Math.cos(a)} cy={R + (R - 7) * Math.sin(a)} r={3} fill="#fff" />;
            })}
          </motion.svg>
        </div>

        <button
          type="button"
          onClick={spin}
          disabled={spinning}
          className="absolute top-1/2 left-1/2 grid size-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-ink text-sm font-bold text-cream shadow-lift ring-4 ring-white transition active:scale-90 disabled:opacity-90"
        >
          {spinning ? "…" : "SPIN"}
        </button>
      </div>

      <div className="mt-6 min-h-20 text-center">
        {result ? (
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 300, damping: 16 }}>
            <p className="font-script text-2xl text-rose">This weekend, you&apos;re doing…</p>
            <p className="headline text-3xl">{result}</p>
          </motion.div>
        ) : (
          <button type="button" onClick={spin} disabled={spinning} className="btn-primary">
            <Dices className="size-4" /> {spinning ? "Spinning…" : "Spin for a date"}
          </button>
        )}
      </div>
    </div>
  );
}
