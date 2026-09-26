"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import type { ReactNode } from "react";
import { sfx } from "@/lib/audio";
import { markActive } from "@/lib/streak";

type Props = {
  flipped: boolean;
  onFlip: (next: boolean) => void;
  front: ReactNode;
  back: ReactNode;
  accent?: string;
  label?: string;
  className?: string;
  /** Return false to swallow a tap (e.g. right after a swipe gesture). */
  shouldFlip?: () => boolean;
};

/**
 * Physical 3D flip card: spring-driven rotateY with preserve-3d, a slight
 * tilt that follows the finger/cursor, and a moving sheen on the face.
 */
export function FlipCard({ flipped, onFlip, front, back, accent = "#e06d53", label = "Tap to flip", className = "", shouldFlip }: Props) {
  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const rx = useSpring(tiltX, { stiffness: 220, damping: 20 });
  const ry = useSpring(tiltY, { stiffness: 220, damping: 20 });
  const sheen = useTransform(ry, [-10, 10], ["20%", "80%"]);
  const sheenBg = useTransform(sheen, (x) => `radial-gradient(120% 80% at ${x} 0%, rgb(255 255 255 / 0.55), transparent 55%)`);

  const handleMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "touch" && e.buttons === 0) return;
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    tiltY.set(px * 14);
    tiltX.set(-py * 10);
  };
  const reset = () => {
    tiltX.set(0);
    tiltY.set(0);
  };

  const flip = () => {
    if (shouldFlip && !shouldFlip()) return;
    sfx.flip();
    markActive();
    onFlip(!flipped);
  };

  return (
    <div className={`perspective select-none ${className}`}>
      <motion.div
        role="button"
        tabIndex={0}
        aria-pressed={flipped}
        aria-label={flipped ? "Show question" : label}
        onClick={flip}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            flip();
          }
        }}
        onPointerMove={handleMove}
        onPointerLeave={reset}
        onPointerUp={reset}
        style={{ rotateX: rx, rotateY: ry }}
        whileTap={{ scale: 0.975 }}
        className="preserve-3d relative h-full w-full cursor-pointer touch-manipulation outline-none focus-visible:ring-4 focus-visible:ring-rose/30 rounded-[30px]"
      >
        <motion.div
          className="preserve-3d relative h-full w-full"
          initial={false}
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 170, damping: 19, mass: 0.9 }}
        >
          {/* Front */}
          <div
            className="backface-hidden absolute inset-0 flex flex-col overflow-hidden rounded-[30px] border border-white/80 bg-white p-6 shadow-lift"
            style={{ backgroundImage: `linear-gradient(160deg, ${accent}14, transparent 45%)` }}
          >
            <motion.div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: sheenBg }} />
            <div className="relative flex h-full flex-col">{front}</div>
          </div>
          {/* Back */}
          <div
            className="backface-hidden absolute inset-0 flex flex-col overflow-hidden rounded-[30px] p-6 text-cream shadow-lift"
            style={{ transform: "rotateY(180deg)", background: `linear-gradient(155deg, ${accent}, #1e293b 135%)` }}
          >
            <div className="relative flex h-full flex-col">{back}</div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
