"use client";

// Tiny synthesized sound effects via WebAudio — no audio files needed.
let ctx: AudioContext | null = null;
let enabled = false;

export const setSoundEnabled = (on: boolean) => {
  enabled = on;
};

function tone(freq: number, start: number, dur: number, type: OscillatorType = "sine", gain = 0.08) {
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
  g.gain.setValueAtTime(0, ctx.currentTime + start);
  g.gain.linearRampToValueAtTime(gain, ctx.currentTime + start + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + dur);
  osc.connect(g).connect(ctx.destination);
  osc.start(ctx.currentTime + start);
  osc.stop(ctx.currentTime + start + dur + 0.02);
}

const SOUNDS = {
  pop: () => tone(660, 0, 0.08, "triangle"),
  swipeRight: () => { tone(520, 0, 0.1, "triangle"); tone(780, 0.07, 0.12, "triangle"); },
  swipeLeft: () => { tone(300, 0, 0.12, "sawtooth", 0.04); tone(220, 0.06, 0.14, "sawtooth", 0.04); },
  correct: () => [523, 659, 784].forEach((f, i) => tone(f, i * 0.07, 0.18, "square", 0.05)),
  wrong: () => tone(160, 0, 0.3, "sawtooth", 0.05),
  unlock: () => [392, 523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.08, 0.3, "triangle", 0.07)),
};

export function play(name: keyof typeof SOUNDS) {
  if (!enabled || typeof window === "undefined") return;
  try {
    ctx ??= new AudioContext();
    if (ctx.state === "suspended") void ctx.resume();
    SOUNDS[name]();
  } catch {
    /* audio unavailable */
  }
}
