"use client";

import { motion } from "framer-motion";
import { Bookmark, BookmarkCheck, Clock, Play, Star } from "lucide-react";
import type { Movie } from "@/data/movies";
import type { RecMovie } from "@/lib/types";
import { useApp } from "./AppProvider";
import { PlatformBadge } from "./PlatformBadge";
import { Poster } from "./Poster";

const fmtRuntime = (m: number) => `${Math.floor(m / 60)}h ${m % 60}m`;

export function MovieCard({ movie, index = 0, onTrailer }: { movie: Movie & Partial<RecMovie>; index?: number; onTrailer: (m: Movie) => void }) {
  const { watchIds, toggleWatch } = useApp();
  const saved = watchIds.includes(movie.id);
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 24, rotate: index % 2 ? 1.5 : -1.5 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ delay: Math.min(index * 0.05, 0.5), type: "spring", damping: 20 }}
      whileHover={{ y: -6 }}
      className="group glass rounded-2xl overflow-hidden flex flex-col"
    >
      <div className="relative">
        <Poster movie={movie} showTitle={false} className="aspect-[2/3]" sizes="(max-width: 640px) 50vw, 260px" />
        {movie.match != null && (
          <span className="absolute top-2 left-2 rounded-full bg-black/70 backdrop-blur px-2 py-1 text-xs font-bold text-lime">{movie.match}% match</span>
        )}
        <button
          onClick={() => toggleWatch(movie.id)}
          className="absolute top-2 right-2 grid place-items-center size-9 rounded-full bg-black/60 backdrop-blur hover:bg-pink/80 transition"
          aria-label={saved ? "Remove from watchlist" : "Save to watchlist"}
          aria-pressed={saved}
        >
          {saved ? <BookmarkCheck size={17} className="text-lime" /> : <Bookmark size={17} />}
        </button>
        <button
          onClick={() => onTrailer(movie)}
          className="absolute inset-0 m-auto grid place-items-center size-14 rounded-full bg-pink/90 text-white opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 focus:opacity-100 focus:scale-100 transition shadow-[0_0_30px_var(--pink)]"
          aria-label={`Play ${movie.title} trailer`}
        >
          <Play size={22} className="ml-0.5" fill="currentColor" />
        </button>
      </div>
      <div className="p-3 flex flex-col gap-2 flex-1">
        <div>
          <h3 className="font-display font-semibold leading-tight line-clamp-2">{movie.title}</h3>
          <div className="flex items-center gap-3 text-xs text-muted mt-1">
            <span>{movie.year}</span>
            <span className="flex items-center gap-1"><Clock size={11} />{fmtRuntime(movie.runtime)}</span>
            <span className="flex items-center gap-1 text-amber"><Star size={11} fill="currentColor" />{movie.rating.toFixed(1)}</span>
          </div>
        </div>
        {movie.why && <p className="text-xs text-cyan/90 line-clamp-2">{movie.why}</p>}
        <div className="flex flex-wrap gap-1 mt-auto">
          {movie.platforms.length ? movie.platforms.map((p) => <PlatformBadge key={p} platform={p} />) : <span className="text-[10px] text-muted">Rent / buy</span>}
        </div>
        <button onClick={() => onTrailer(movie)} className="sm:hidden mt-1 text-xs font-semibold text-pink flex items-center gap-1">
          <Play size={12} fill="currentColor" /> Trailer
        </button>
      </div>
    </motion.article>
  );
}
