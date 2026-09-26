"use client";

import { readStored, writeStored } from "./storage";

/**
 * Shared Flame Streak.
 * Each device records the days *you* interacted. Your partner's days arrive
 * through a "flame sync" link (URL encoded, no server). A streak day counts
 * only when both of you were active, falling back to a solo streak until the
 * first sync.
 */

export const STREAK_KEY = "streak";

export type StreakState = {
  myDays: string[];
  partnerDays: string[];
};

export const EMPTY_STREAK: StreakState = { myDays: [], partnerDays: [] };

export function dayKey(d = new Date()) {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

function trim(days: string[]) {
  return Array.from(new Set(days)).sort().slice(-120);
}

/** Call from any meaningful interaction (flip, swipe, spin, answer...). */
export function markActive() {
  if (typeof window === "undefined") return;
  const s = readStored<StreakState>(STREAK_KEY, EMPTY_STREAK);
  const today = dayKey();
  if (s.myDays.includes(today)) return;
  writeStored(STREAK_KEY, { ...s, myDays: trim([...s.myDays, today]) });
}

export function mergePartner(s: StreakState, days: string[]): StreakState {
  return { ...s, partnerDays: trim([...s.partnerDays, ...days]) };
}

/** Consecutive-day run ending today (or yesterday, so the flame survives until tonight). */
export function computeStreak(s: StreakState) {
  const shared = s.partnerDays.length > 0;
  const partnerSet = new Set(s.partnerDays);
  const active = new Set(shared ? s.myDays.filter((d) => partnerSet.has(d)) : s.myDays);
  const cursor = new Date();
  if (!active.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  let count = 0;
  while (active.has(dayKey(cursor))) {
    count++;
    cursor.setDate(cursor.getDate() - 1);
  }
  const today = dayKey();
  return {
    count,
    shared,
    meToday: s.myDays.includes(today),
    partnerToday: s.partnerDays.includes(today),
  };
}

/** Last 7 days for the flame calendar strip. */
export function lastWeek(s: StreakState) {
  const partnerSet = new Set(s.partnerDays);
  const mySet = new Set(s.myDays);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const k = dayKey(d);
    return { key: k, label: d.toLocaleDateString("en-IN", { weekday: "narrow" }), me: mySet.has(k), partner: partnerSet.has(k) };
  });
}
