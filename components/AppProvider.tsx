"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { MeResponse } from "@/lib/types";
import { setSoundEnabled } from "@/lib/sound";
import { Paywall } from "./Paywall";

interface AppState {
  me: MeResponse | null;
  refreshMe: () => Promise<MeResponse | null>;
  sound: boolean;
  toggleSound: () => void;
  paywallOpen: boolean;
  openPaywall: (reason?: string) => void;
  closePaywall: () => void;
  paywallReason: string;
  watchIds: string[];
  toggleWatch: (movieId: string) => Promise<void>;
}

const Ctx = createContext<AppState | null>(null);

export const useApp = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useApp must be used inside <AppProvider>");
  return c;
};

const readSoundPref = () => {
  try {
    return localStorage.getItem("cm_sound") === "1";
  } catch {
    return false;
  }
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [me, setMe] = useState<MeResponse | null>(null);
  const [sound, setSound] = useState(false);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [paywallReason, setPaywallReason] = useState("");
  const [watchIds, setWatchIds] = useState<string[]>([]);

  const refreshMe = useCallback(async () => {
    try {
      const res = await fetch("/api/me", { cache: "no-store" });
      const data: MeResponse = await res.json();
      setMe(data);
      return data;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate client-only preference
    setSound(readSoundPref());
    void refreshMe();
  }, [refreshMe]);

  useEffect(() => setSoundEnabled(sound), [sound]);

  useEffect(() => {
    if (!me?.premium) return;
    fetch("/api/watchlist")
      .then((r) => (r.ok ? r.json() : { movies: [] }))
      .then((d: { movies: { id: string }[] }) => setWatchIds(d.movies.map((m) => m.id)))
      .catch(() => {});
  }, [me?.premium]);

  const toggleSound = () =>
    setSound((s) => {
      try {
        localStorage.setItem("cm_sound", s ? "0" : "1");
      } catch {}
      return !s;
    });

  const paywall = !!me?.paywall;
  const openPaywall = useCallback((reason = "") => {
    if (!paywall) return;
    setPaywallReason(reason);
    setPaywallOpen(true);
  }, [paywall]);

  const toggleWatch = async (movieId: string) => {
    if (!me?.premium) return openPaywall("Save movies to your secret watchlist");
    const action = watchIds.includes(movieId) ? "remove" : "add";
    setWatchIds((ids) => (action === "add" ? [movieId, ...ids] : ids.filter((i) => i !== movieId)));
    const res = await fetch("/api/watchlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ movieId, action }),
    });
    if (res.ok) setWatchIds((await res.json()).ids);
  };

  return (
    <Ctx.Provider
      value={{
        me,
        refreshMe,
        sound,
        toggleSound,
        paywallOpen,
        openPaywall,
        closePaywall: () => setPaywallOpen(false),
        paywallReason,
        watchIds,
        toggleWatch,
      }}
    >
      {children}
      <Paywall />
    </Ctx.Provider>
  );
}
