"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Wand2 } from "lucide-react";
import { useState } from "react";
import type { Movie } from "@/data/movies";
import { play } from "@/lib/sound";
import type { RecMovie } from "@/lib/types";
import { useApp } from "./AppProvider";
import { MovieCard } from "./MovieCard";

const SUGGESTIONS = ["rainy sunday, want a good cry", "hyped with friends, desi action", "something short and cozy", "mind-bending sci-fi, not too old"];

export function MoodMatch({ onTrailer }: { onTrailer: (m: Movie) => void }) {
  const { me, openPaywall, refreshMe } = useApp();
  const [text, setText] = useState("");
  const [results, setResults] = useState<RecMovie[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const run = async (q = text) => {
    if (!q.trim()) return;
    setText(q);
    setError("");
    setLoading(true);
    play("pop");
    try {
      const res = await fetch("/api/mood-match", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: q }) });
      const data = await res.json();
      if (res.status === 402) {
        openPaywall("You've used today's free Mood Matches");
        return;
      }
      if (!res.ok) throw new Error(data.error);
      setResults(data.movies);
      void refreshMe();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const left = me?.moodMatchesLeft;

  return (
    <section className="glass rounded-3xl p-5 sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-xl sm:text-2xl font-extrabold flex items-center gap-2">
          <Wand2 className="text-violet" /> Mood Match
        </h2>
        {me?.paywall && (
          <span className="text-xs rounded-full border border-line px-3 py-1 text-muted">
            {me.premium ? "∞ unlimited" : left != null ? `${left} free left today` : ""}
          </span>
        )}
      </div>
      <p className="text-muted text-sm mt-1">Describe your mood in plain words and we&apos;ll match it to movies.</p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void run();
        }}
        className="mt-4 flex gap-2"
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={300}
          placeholder="e.g. tired after work, want something funny"
          className="flex-1 min-w-0 rounded-xl bg-surface-2 border border-line px-4 py-3 text-sm placeholder:text-muted/70 focus:border-violet outline-none"
          aria-label="Describe your mood"
        />
        <button disabled={loading || !text.trim()} className="rounded-xl bg-violet px-4 sm:px-5 font-bold disabled:opacity-40 flex items-center gap-2">
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />} <span className="hidden sm:inline">Match</span>
        </button>
      </form>
      <div className="flex flex-wrap gap-2 mt-3">
        {SUGGESTIONS.map((s) => (
          <button key={s} onClick={() => run(s)} className="text-xs rounded-full bg-surface-2 border border-line px-3 py-1.5 text-muted hover:text-ink hover:border-violet">
            {s}
          </button>
        ))}
      </div>
      {error && <p className="text-pink text-sm mt-3">{error}</p>}
      <AnimatePresence>
        {results && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-5">
            {results.map((m, i) => (
              <MovieCard key={m.id} movie={m} index={i} onTrailer={onTrailer} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
