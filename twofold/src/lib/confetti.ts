"use client";

import confetti from "canvas-confetti";

const PALETTE = ["#e06d53", "#d97706", "#588157", "#f4a98f", "#fcd9a8", "#f7c1c9"];

function reducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

let heartShape: confetti.Shape | null = null;
function heart() {
  if (!heartShape && typeof confetti.shapeFromPath === "function") {
    heartShape = confetti.shapeFromPath({
      path: "M167 72c19,-38 37,-56 75,-56 42,0 76,33 76,75 0,76 -76,151 -151,227 -76,-76 -151,-151 -151,-227 0,-42 33,-75 75,-75 38,0 57,18 76,56z",
    });
  }
  return heartShape;
}

/** Hearts + stars burst: the big "YES" moment. */
export function celebrate() {
  if (reducedMotion()) return;
  const h = heart();
  const shapes: confetti.Shape[] = h ? [h, "star", "circle"] : ["star", "circle"];
  const base = { colors: PALETTE, shapes, scalar: 1.6, ticks: 260, gravity: 0.9, zIndex: 100 };
  confetti({ ...base, particleCount: 90, spread: 100, origin: { y: 0.65 } });
  setTimeout(() => confetti({ ...base, particleCount: 50, angle: 60, spread: 70, origin: { x: 0, y: 0.75 } }), 180);
  setTimeout(() => confetti({ ...base, particleCount: 50, angle: 120, spread: 70, origin: { x: 1, y: 0.75 } }), 320);
}

/** A few rising firework bursts for mutual matches. */
export function fireworks(duration = 1600) {
  if (reducedMotion()) return;
  const end = Date.now() + duration;
  const timer = setInterval(() => {
    if (Date.now() > end) return clearInterval(timer);
    confetti({
      particleCount: 40,
      startVelocity: 28,
      spread: 360,
      ticks: 70,
      zIndex: 100,
      colors: PALETTE,
      shapes: ["star", "circle"],
      origin: { x: 0.15 + Math.random() * 0.7, y: 0.2 + Math.random() * 0.3 },
    });
  }, 260);
}

/** Small, polite puff for chores and checkboxes. */
export function sparkle(x = 0.5, y = 0.5) {
  if (reducedMotion()) return;
  confetti({ particleCount: 28, spread: 60, startVelocity: 22, ticks: 90, scalar: 0.8, zIndex: 100, colors: PALETTE, origin: { x, y } });
}

export function originFromEvent(e: { clientX: number; clientY: number }) {
  return { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight };
}
