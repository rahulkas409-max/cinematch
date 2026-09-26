"use client";

import { motion } from "framer-motion";
import { Bookmark, Lock } from "lucide-react";
import { useEffect, useState } from "react";
import type { Movie } from "@/data/movies";
import { useApp } from "./AppProvider";
import { MovieCard } from "./MovieCard";

interface Playlist {
  id: string;
  title: string;
  emoji: string;
  blurb?: string;
  movies?: Movie[];
}

/** Secret playlists + watchlist. Contents are only served by the API to premium users. */
export function SecretVault({ onTrailer }: { onTrailer: (m: Movie) => void }) {
  const { me, openPaywall, watchIds } = useApp();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [watchMovies, setWatchMovies] = useState<Movie[]>([]);
  const premium = !!me?.premium;

  useEffect(() => {
    if (!me) return;
    fetch("/api/playlists")
      .then((r) => r.json())
      .then((d: { playlists: Playlist[] }) => {
        setPlaylists(d.playlists);
        setActive((a) => a ?? d.playlists[0]?.id ?? null);
      })
      .catch(() => {});
  }, [me, premium]);

  useEffect(() => {
    if (!premium) return;
    fetch("/api/watchlist")
      .then((r) => r.json())
      .then((d: { movies: Movie[] }) => setWatchMovies(d.movies))
      .catch(() => {});
  }, [premium, watchIds]);

  const current = playlists.find((p) => p.id === active);

  return (
    <section>
      <h2 className="font-display text-xl sm:text-2xl font-extrabold">🗝️ Secret playlists</h2>
      <p className="text-muted text-sm mt-1">Hand-curated by movie nerds. Premium only.</p>
      <div className="flex gap-3 overflow-x-auto mt-4 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 [scrollbar-width:none]">
        {playlists.map((p) => (
          <motion.button
            key={p.id}
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => (premium ? setActive(p.id) : openPaywall(`Unlock “${p.title}”`))}
            className={`shrink-0 w-44 rounded-2xl p-4 text-left border ${premium && active === p.id ? "border-pink bg-pink/10" : "border-line bg-surface-2"}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-3xl">{p.emoji}</span>
              {!premium && <Lock size={14} className="text-muted" />}
            </div>
            <p className="font-display font-bold mt-2 leading-tight">{p.title}</p>
          </motion.button>
        ))}
      </div>
      {premium && current?.movies && (
        <motion.div key={current.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4">
          <p className="text-sm text-cyan mb-3">{current.blurb}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {current.movies.map((m, i) => (
              <MovieCard key={m.id} movie={m} index={i} onTrailer={onTrailer} />
            ))}
          </div>
        </motion.div>
      )}

      <h2 className="font-display text-xl sm:text-2xl font-extrabold mt-12 flex items-center gap-2">
        <Bookmark className="text-lime" /> Secret watchlist
      </h2>
      {!premium ? (
        <button onClick={() => openPaywall("Save movies to your secret watchlist")} className="mt-3 text-sm text-muted hover:text-ink inline-flex items-center gap-2">
          <Lock size={14} /> Unlock to save movies and come back to them later
        </button>
      ) : watchMovies.length === 0 ? (
        <p className="text-muted text-sm mt-3">Tap the bookmark on any movie to stash it here.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-4">
          {watchMovies.map((m, i) => (
            <MovieCard key={m.id} movie={m} index={i} onTrailer={onTrailer} />
          ))}
        </div>
      )}
    </section>
  );
}
