"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Tiny localStorage layer built on useSyncExternalStore so every component
 * reading the same key stays in sync (same tab via our own event bus, other
 * tabs via the native "storage" event) and SSR hydration never mismatches.
 */

const PREFIX = "twofold:";
const listeners = new Set<() => void>();
const parsedCache = new Map<string, { raw: string | null; value: unknown }>();
const initialCache = new Map<string, unknown>();

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

function safeGet(key: string): string | null {
  try {
    return window.localStorage.getItem(PREFIX + key);
  } catch {
    return null;
  }
}

export function readStored<T>(key: string, initial: T): T {
  if (typeof window === "undefined") return initial;
  const raw = safeGet(key);
  if (raw === null) return initial;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return initial;
  }
}

export function writeStored<T>(key: string, value: T) {
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // Private mode / quota: keep the app usable, just without persistence.
  }
  emit();
}

export type Setter<T> = (next: T | ((prev: T) => T)) => void;

export function useStored<T>(key: string, initial: T): [T, Setter<T>] {
  if (!initialCache.has(key)) initialCache.set(key, initial);
  const stableInitial = initialCache.get(key) as T;

  const getSnapshot = useCallback((): T => {
    const raw = safeGet(key);
    const cached = parsedCache.get(key);
    if (cached && cached.raw === raw) return cached.value as T;
    let value: T = stableInitial;
    if (raw !== null) {
      try {
        value = JSON.parse(raw) as T;
      } catch {
        value = stableInitial;
      }
    }
    parsedCache.set(key, { raw, value });
    return value;
  }, [key, stableInitial]);

  const getServerSnapshot = useCallback(() => stableInitial, [stableInitial]);

  const value = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const set: Setter<T> = useCallback(
    (next) => {
      const prev = readStored<T>(key, stableInitial);
      const resolved = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
      writeStored(key, resolved);
    },
    [key, stableInitial],
  );

  return [value, set];
}

/** True after hydration. Handy for rendering time/locale dependent UI. */
const noopSubscribe = () => () => {};
export function useHydrated() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

/** Reads the URL hash reactively (without the leading "#"). */
function subscribeHash(cb: () => void) {
  window.addEventListener("hashchange", cb);
  return () => window.removeEventListener("hashchange", cb);
}
export function useHash() {
  return useSyncExternalStore(
    subscribeHash,
    () => window.location.hash.replace(/^#/, ""),
    () => "",
  );
}

export function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}
