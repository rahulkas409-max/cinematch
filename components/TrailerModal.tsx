"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink, X } from "lucide-react";
import type { Movie } from "@/data/movies";

export function TrailerModal({ movie, onClose }: { movie: Movie | null; onClose: () => void }) {
  const search = movie ? `https://www.youtube.com/results?search_query=${encodeURIComponent(`${movie.title} ${movie.year} official trailer`)}` : "";
  return (
    <AnimatePresence>
      {movie && (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-center bg-black/80 backdrop-blur p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`${movie.title} trailer`}
            className="w-full max-w-3xl glass rounded-2xl overflow-hidden"
            initial={{ scale: 0.9, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-line">
              <p className="font-display font-semibold truncate">
                {movie.title} <span className="text-muted font-normal">({movie.year})</span>
              </p>
              <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/10" aria-label="Close trailer">
                <X size={18} />
              </button>
            </div>
            {movie.trailerKey ? (
              <div className="aspect-video bg-black">
                <iframe
                  className="size-full"
                  src={`https://www.youtube-nocookie.com/embed/${movie.trailerKey}?autoplay=1&rel=0`}
                  title={`${movie.title} trailer`}
                  allow="autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="aspect-video grid place-items-center text-center p-6" style={{ background: `linear-gradient(135deg, ${movie.palette[0]}, ${movie.palette[1]})` }}>
                <div>
                  <div className="text-6xl mb-4">{movie.emoji}</div>
                  <p className="text-white/80 text-sm max-w-sm mx-auto mb-5">
                    Embedded trailers appear when a TMDB key is configured. Meanwhile, catch it on YouTube:
                  </p>
                  <a href={search} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[#ff0033] px-5 py-2.5 font-semibold text-white">
                    Watch trailer on YouTube <ExternalLink size={16} />
                  </a>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
