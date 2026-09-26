"use client";

import { useSyncExternalStore } from "react";

/** A shared 1s clock so countdowns re-render together without each owning an interval. */
const subs = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | null = null;
let now = 0;

function subscribe(cb: () => void) {
  subs.add(cb);
  if (!timer) {
    now = Date.now();
    timer = setInterval(() => {
      now = Date.now();
      subs.forEach((s) => s());
    }, 1000);
  }
  return () => {
    subs.delete(cb);
    if (subs.size === 0 && timer) {
      clearInterval(timer);
      timer = null;
    }
  };
}

/** Current time in ms, ticking every second. Returns 0 during SSR. */
export function useNow() {
  return useSyncExternalStore(
    subscribe,
    () => now || (now = Date.now()),
    () => 0,
  );
}

export function formatCountdown(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return [h, m, sec].map((n) => String(n).padStart(2, "0")).join(":");
}

export function daysUntil(dateISO: string, from: number) {
  const target = new Date(dateISO + "T00:00:00");
  const start = new Date(from);
  start.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - start.getTime()) / 86_400_000);
}

/** Next yearly occurrence of a month/day (for birthdays, anniversaries). */
export function nextOccurrence(dateISO: string, from: number) {
  const [, m, d] = dateISO.split("-").map(Number);
  const today = new Date(from);
  today.setHours(0, 0, 0, 0);
  let next = new Date(today.getFullYear(), m - 1, d);
  if (next < today) next = new Date(today.getFullYear() + 1, m - 1, d);
  return {
    date: next,
    days: Math.round((next.getTime() - today.getTime()) / 86_400_000),
  };
}

export const inr = (n: number) =>
  "₹" + Math.round(n).toLocaleString("en-IN");
