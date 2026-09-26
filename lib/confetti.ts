"use client";
import confetti from "canvas-confetti";

const NEON = ["#ff2e88", "#22e3ff", "#a855f7", "#b6ff3b", "#ffc53d"];

export const burst = (opts: confetti.Options = {}) =>
  confetti({ particleCount: 90, spread: 75, startVelocity: 38, origin: { y: 0.7 }, colors: NEON, disableForReducedMotion: true, ...opts });

export function celebrate() {
  const end = Date.now() + 900;
  (function frame() {
    confetti({ particleCount: 5, angle: 60, spread: 60, origin: { x: 0, y: 0.8 }, colors: NEON, disableForReducedMotion: true });
    confetti({ particleCount: 5, angle: 120, spread: 60, origin: { x: 1, y: 0.8 }, colors: NEON, disableForReducedMotion: true });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}
