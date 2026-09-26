"use client";

import { AnimatePresence, animate, motion, useMotionValue, useTransform } from "framer-motion";
import { Heart, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Movie } from "@/data/movies";
import { play } from "@/lib/sound";
import { Poster } from "./Poster";

type Decision = "like" | "pass";

function SwipeCard({ movie, onDecide, registerFling }: { movie: Movie; onDecide: (d: Decision) => void; registerFling: (f: (d: Decision) => void) => void }) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-220, 220], [-18, 18]);
  const likeOpacity = useTransform(x, [30, 120], [0, 1]);
  const nopeOpacity = useTransform(x, [-120, -30], [1, 0]);
  const glow = useTransform(x, [-150, 0, 150], ["0 0 40px rgba(255,46,136,0.6)", "0 20px 50px rgba(0,0,0,0.5)", "0 0 40px rgba(182,255,59,0.6)"]);
  const decided = useRef(false);

  const fling = useCallback(
    (d: Decision) => {
      if (decided.current) return;
      decided.current = true;
      play(d === "like" ? "swipeRight" : "swipeLeft");
      animate(x, d === "like" ? 650 : -650, { duration: 0.35, ease: "easeIn" }).then(() => onDecide(d));
    },
    [onDecide, x],
  );

  useEffect(() => registerFling(fling), [fling, registerFling]);

  return (
    <motion.div
      className="absolute inset-0 cursor-grab active:cursor-grabbing touch-none"
      style={{ x, rotate, boxShadow: glow, borderRadius: 24 }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      onDragEnd={(_, info) => {
        if (info.offset.x > 110 || info.velocity.x > 600) fling("like");
        else if (info.offset.x < -110 || info.velocity.x < -600) fling("pass");
      }}
      initial={{ scale: 0.92, y: 16, opacity: 0 }}
      animate={{ scale: 1, y: 0, opacity: 1 }}
      transition={{ type: "spring", damping: 18, stiffness: 220 }}
    >
      <Poster movie={movie} showTitle={false} className="size-full rounded-3xl" sizes="340px" priority />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 rounded-b-3xl bg-gradient-to-t from-black/95 via-black/70 to-transparent p-5 pt-16">
        <p className="font-display text-xl font-extrabold leading-tight">{movie.title}</p>
        <p className="text-sm text-white/70 mt-1">
          {movie.year} · {movie.genres.join(" / ")} · {movie.runtime} min
        </p>
        <p className="text-sm text-white/85 italic mt-2 line-clamp-2">“{movie.tagline}”</p>
      </div>
      <motion.div style={{ opacity: likeOpacity }} className="pointer-events-none absolute top-6 left-5 -rotate-12 rounded-xl border-4 border-lime px-3 py-1 font-display text-2xl font-extrabold text-lime">
        WATCH!
      </motion.div>
      <motion.div style={{ opacity: nopeOpacity }} className="pointer-events-none absolute top-6 right-5 rotate-12 rounded-xl border-4 border-pink px-3 py-1 font-display text-2xl font-extrabold text-pink">
        NOPE
      </motion.div>
    </motion.div>
  );
}

export function SwipeDeck({ movies, onDone }: { movies: Movie[]; onDone: (liked: string[], passed: string[]) => void }) {
  const [index, setIndex] = useState(0);
  const [liked, setLiked] = useState<string[]>([]);
  const [passed, setPassed] = useState<string[]>([]);
  const flingRef = useRef<((d: Decision) => void) | null>(null);
  const registerFling = useCallback((f: (d: Decision) => void) => (flingRef.current = f), []);

  const current = movies[index];

  const decide = useCallback(
    (d: Decision) => {
      const id = movies[index].id;
      const nextLiked = d === "like" ? [...liked, id] : liked;
      const nextPassed = d === "pass" ? [...passed, id] : passed;
      setLiked(nextLiked);
      setPassed(nextPassed);
      if (index + 1 >= movies.length) onDone(nextLiked, nextPassed);
      else setIndex(index + 1);
    },
    [index, liked, movies, onDone, passed],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") flingRef.current?.("like");
      if (e.key === "ArrowLeft") flingRef.current?.("pass");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-[min(78vw,320px)] aspect-[2/3]">
        {movies.slice(index + 1, index + 3).reverse().map((m, i, arr) => (
          <div
            key={m.id}
            className="absolute inset-0 rounded-3xl overflow-hidden opacity-60"
            style={{ transform: `translateY(${(arr.length - i) * 10}px) scale(${1 - (arr.length - i) * 0.04})` }}
          >
            <Poster movie={m} showTitle={false} className="size-full" sizes="320px" />
          </div>
        ))}
        <AnimatePresence>{current && <SwipeCard key={current.id} movie={current} onDecide={decide} registerFling={registerFling} />}</AnimatePresence>
      </div>

      <div className="flex items-center gap-6 mt-10">
        <motion.button
          whileTap={{ scale: 0.85 }}
          whileHover={{ scale: 1.08, rotate: -8 }}
          onClick={() => flingRef.current?.("pass")}
          className="grid place-items-center size-16 rounded-full border-2 border-pink text-pink bg-pink/10 shadow-[0_0_24px_rgba(255,46,136,0.35)]"
          aria-label="Not tonight"
        >
          <X size={30} strokeWidth={3} />
        </motion.button>
        <span className="text-sm text-muted tabular-nums">
          {Math.min(index + 1, movies.length)} / {movies.length}
        </span>
        <motion.button
          whileTap={{ scale: 0.85 }}
          whileHover={{ scale: 1.08, rotate: 8 }}
          onClick={() => flingRef.current?.("like")}
          className="grid place-items-center size-16 rounded-full border-2 border-lime text-lime bg-lime/10 shadow-[0_0_24px_rgba(182,255,59,0.35)]"
          aria-label="I'd watch this"
        >
          <Heart size={28} strokeWidth={3} />
        </motion.button>
      </div>
      <p className="text-xs text-muted mt-4 hidden sm:block">Tip: use ← / → arrow keys</p>
    </div>
  );
}
