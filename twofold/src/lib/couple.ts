"use client";

import { useStored } from "./storage";

/** The two names used across every module (ledger, holiday planner, vouchers…). */
export type Couple = { a: string; b: string };

export const COUPLE_KEY = "couple";
export const DEFAULT_COUPLE: Couple = { a: "", b: "" };

export function useCouple() {
  const [couple, setCouple] = useStored<Couple>(COUPLE_KEY, DEFAULT_COUPLE);
  const names = { a: couple.a.trim() || "You", b: couple.b.trim() || "Partner" };
  return { couple, setCouple, names };
}

/** "Meera" → "Meera's", default "You" → "Your". */
export function possessive(name: string) {
  return name === "You" ? "Your" : `${name}'s`;
}
