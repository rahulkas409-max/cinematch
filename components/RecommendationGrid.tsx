"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { GENRES, type Genre, type Movie } from "@/data/movies";
import { play } from "@/lib/sound";
import type { QuizProfile, RecommendResponse } from "@/lib/types";
import { useApp } from "./AppProvider";
import { MovieCard } from "./MovieCard";

const GENRE_EMOJI: Record<Genre, string> = {
  "Sci-Fi": "🛸", Horror: "🩸", Romance: "💘", Thriller: "🔪", Comedy: "🤡", Action: "💥", Indie: "🎞️", Animation: "🎨", Drama: "🎭",
};

export function RecommendationGrid({ profile, onTrailer }: { profile: QuizProfile; onTrailer: (m: Movie) => void }) {
  const { me, openPaywall } = useApp();
  const [genre, setGenre] = useState<Genre | null>(null);
  const [data, setData] = useState<RecommendResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const premium = !!me?.premium;

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loading flag for the fetch below
    setLoading(true);
    fetch("/api/recommend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profile, genre }),
    })
      .then((r) => r.json())
      .then((d: RecommendResponse) => !cancelled && setData(d))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
    // Re-fetch when premium flips so the full deck appears right after unlocking.
  }, [profile, genre, premium]);

  const chips: (Genre | null)[] = [null, ...GENRES];

  return (
    <section>
      <div className="flex gap-2 overflow-x-auto pb-3 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap [scrollbar-width:none]">
        {chips.map((g) => {
          const on = genre === g;
          return (
            <motion.button
              key={g ?? "all"}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                play("pop");
                setGenre(g);
              }}
              aria-pressed={on}
              className={`relative shrink-0 rounded-full px-4 py-2 text-sm font-semibold border transition-colors ${on ? "border-transparent text-bg" : "border-line text-muted hover:text-ink hover:border-cyan"}`}
            >
              {on && <motion.span layoutId="chip" className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan to-lime" transition={{ type: "spring", damping: 22, stiffness: 300 }} />}
              <span className="relative">{g ? `${GENRE_EMOJI[g]} ${g}` : "✨ All"}</span>
            </motion.button>
          );
        })}
      </div>

      <div className="relative mt-4 min-h-64">
        {loading && !data && (
          <div className="absolute inset-0 grid place-items-center text-muted">
            <Loader2 className="animate-spin" />
          </div>
        )}
        {data && (
          <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 transition-opacity ${loading ? "opacity-50" : ""}`}>
            <AnimatePresence mode="popLayout">
              {data.movies.map((m, i) => (
                <MovieCard key={m.id} movie={m} index={i} onTrailer={onTrailer} />
              ))}
              {!data.premium && data.lockedCount > 0 && (
                <PaywallCard key="paywall" count={data.lockedCount} onUnlock={() => openPaywall("Your full watch-deck is ready")} />
              )}
            </AnimatePresence>
            {data.movies.length === 0 && <p className="col-span-full text-center text-muted py-10">No matches in this genre — try another chip!</p>}
          </div>
        )}
      </div>
    </section>
  );
}

function PaywallCard({ count, onUnlock }: { count: number; onUnlock: () => void }) {
  return (
    <motion.button
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.03, rotate: -1 }}
      whileTap={{ scale: 0.97 }}
      onClick={onUnlock}
      className="relative rounded-2xl p-5 text-left flex flex-col justify-between overflow-hidden neon-ring aspect-[2/3] bg-[linear-gradient(160deg,#2a0f3d,#0b0718)]"
    >
      <motion.div className="absolute -top-10 -right-10 size-40 rounded-full bg-pink/40 blur-2xl" animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 3 }} />
      <div className="relative">
        <motion.div className="text-5xl" animate={{ rotate: [0, -10, 10, 0] }} transition={{ repeat: Infinity, duration: 2, repeatDelay: 1 }}>
          🔐
        </motion.div>
        <p className="font-display font-extrabold text-xl mt-3 leading-tight">+{count} more matches waiting</p>
        <p className="text-sm text-muted mt-2">Plus secret playlists, unlimited Mood Match and your own watchlist.</p>
      </div>
      <span className="relative inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink to-violet py-3 font-display font-bold">
        <Sparkles size={16} /> Unlock for ₹9
      </span>
    </motion.button>
  );
}
