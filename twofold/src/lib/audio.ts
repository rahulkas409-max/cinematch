"use client";

import { readStored, writeStored } from "./storage";

/**
 * Web Audio micro-feedback. Every sound is synthesised on the fly: no audio
 * files, no network. The context is created lazily on the first user gesture
 * (browsers block audio before that anyway).
 */

export const MUTE_KEY = "muted";

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (readStored<boolean>(MUTE_KEY, false)) return null;
  if (!ctx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function tone(
  c: AudioContext,
  { freq, to, start = 0, dur = 0.12, type = "sine", gain = 0.12 }: {
    freq: number;
    to?: number;
    start?: number;
    dur?: number;
    type?: OscillatorType;
    gain?: number;
  },
) {
  const t0 = c.currentTime + start;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (to) osc.frequency.exponentialRampToValueAtTime(to, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

function noiseSweep(c: AudioContext, dur = 0.22, from = 900, to = 3200, gain = 0.09) {
  const len = Math.floor(c.sampleRate * dur);
  const buf = c.createBuffer(1, len, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = c.createBufferSource();
  src.buffer = buf;
  const filter = c.createBiquadFilter();
  filter.type = "bandpass";
  filter.Q.value = 1.4;
  const t0 = c.currentTime;
  filter.frequency.setValueAtTime(from, t0);
  filter.frequency.exponentialRampToValueAtTime(to, t0 + dur);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + dur * 0.3);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(filter).connect(g).connect(c.destination);
  src.start(t0);
}

export const sfx = {
  /** Soft bubble pop for taps and selections. */
  pop() {
    const c = getCtx();
    if (c) tone(c, { freq: 520, to: 880, dur: 0.09, gain: 0.1 });
  },
  /** Airy whoosh for card flips. */
  flip() {
    const c = getCtx();
    if (c) noiseSweep(c, 0.2, 700, 2600, 0.08);
  },
  /** Short woody tick for roulette pegs. */
  tick() {
    const c = getCtx();
    if (c) tone(c, { freq: 1500, to: 900, dur: 0.035, type: "triangle", gain: 0.07 });
  },
  /** Card flung away. */
  swipe() {
    const c = getCtx();
    if (c) noiseSweep(c, 0.18, 2400, 600, 0.07);
  },
  /** Gentle "nope" for dodges and errors. */
  boop() {
    const c = getCtx();
    if (c) tone(c, { freq: 330, to: 220, dur: 0.14, type: "triangle", gain: 0.08 });
  },
  /** Bright arpeggio for wins, matches and yeses. */
  chime() {
    const c = getCtx();
    if (!c) return;
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) =>
      tone(c, { freq: f, start: i * 0.09, dur: 0.45, type: "sine", gain: 0.09 }),
    );
    tone(c, { freq: 1567.98, start: 0.36, dur: 0.6, type: "triangle", gain: 0.04 });
  },
};

export function setMuted(muted: boolean) {
  writeStored(MUTE_KEY, muted);
  if (muted && ctx) {
    void ctx.close();
    ctx = null;
  }
}
