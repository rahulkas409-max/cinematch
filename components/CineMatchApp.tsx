"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { VIBES, type Movie } from "@/data/movies";
import { burst } from "@/lib/confetti";
import { play } from "@/lib/sound";
import type { QuizProfile } from "@/lib/types";
import { Header } from "./Header";
import { MoodMatch } from "./MoodMatch";
import { RecommendationGrid } from "./RecommendationGrid";
import { SecretVault } from "./SecretVault";
import { TrailerModal } from "./TrailerModal";
import { VibeQuiz } from "./VibeQuiz";

type Stage = "intro" | "quiz" | "results";
const STORAGE_KEY = "cm_profile";
const FLOATERS = ["🍿", "🎬", "👻", "🚀", "💘", "🤡", "🎞️", "🦈", "🐉", "🎹"];

export function CineMatchApp() {
  const [stage, setStage] = useState<Stage>("intro");
  const [profile, setProfile] = useState<QuizProfile | null>(null);
  const [trailer, setTrailer] = useState<Movie | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- restore last session's results
        setProfile(JSON.parse(saved));
        setStage("results");
      }
    } catch {}
  }, []);

  const complete = (p: QuizProfile) => {
    setProfile(p);
    setStage("results");
    play("unlock");
    burst({ particleCount: 140, spread: 100 });
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
    } catch {}
    // record the quiz result server-side
    void fetch("/api/recommend", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ profile: p, save: true }) });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const restart = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    setProfile(null);
    setStage("quiz");
  };

  return (
    <>
      <Header onHome={() => setStage(profile ? "results" : "intro")} />
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-8 sm:py-12">
        <AnimatePresence mode="wait">
          {stage === "intro" && (
            <motion.section key="intro" exit={{ opacity: 0, scale: 0.96 }} className="relative text-center py-10 sm:py-20">
              <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
                {FLOATERS.map((e, i) => (
                  <motion.span
                    key={i}
                    className="absolute text-3xl sm:text-5xl opacity-30"
                    style={{ left: `${(i * 97) % 92}%`, top: `${(i * 53) % 85}%` }}
                    animate={{ y: [0, -18, 0], rotate: [0, i % 2 ? 12 : -12, 0] }}
                    transition={{ repeat: Infinity, duration: 3 + (i % 4), delay: i * 0.2 }}
                  >
                    {e}
                  </motion.span>
                ))}
              </div>
              <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="relative text-xs sm:text-sm uppercase tracking-[0.35em] text-cyan">
                Your movie night, sorted in 90 seconds
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", damping: 14 }}
                className="relative font-display font-extrabold text-4xl sm:text-7xl leading-[1.05] mt-5"
              >
                Stop scrolling.
                <br />
                <span className="bg-gradient-to-r from-pink via-violet to-cyan bg-clip-text text-transparent">Start watching.</span>
              </motion.h1>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="relative text-muted text-base sm:text-lg max-w-xl mx-auto mt-6">
                Pick a vibe, swipe some posters, crack a few emoji riddles — and we&apos;ll serve picks across Hollywood, Bollywood and beyond.
              </motion.p>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }} className="relative flex flex-wrap justify-center gap-2 mt-8">
                {VIBES.map((v) => (
                  <span key={v.id} className="text-xs sm:text-sm rounded-full border border-line bg-surface/70 px-3 py-1.5">
                    {v.emoji} {v.label}
                  </span>
                ))}
              </motion.div>
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  play("pop");
                  setStage("quiz");
                }}
                className="relative mt-10 inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-pink to-violet px-8 py-4 font-display font-extrabold text-lg shadow-[0_0_40px_rgba(255,46,136,0.5)]"
              >
                Start the vibe check <ArrowRight />
              </motion.button>
              <p className="relative text-xs text-muted mt-4">Free · 3 personalised picks · full deck for ₹9</p>
            </motion.section>
          )}

          {stage === "quiz" && (
            <motion.section key="quiz" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <VibeQuiz onComplete={complete} />
            </motion.section>
          )}

          {stage === "results" && profile && (
            <motion.section key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-14">
              <div>
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-cyan">Your matches</p>
                    <h1 className="font-display text-3xl sm:text-5xl font-extrabold mt-2">Tonight&apos;s watch-deck 🍿</h1>
                    <p className="text-muted mt-2 text-sm">
                      {profile.vibes.map((id) => VIBES.find((v) => v.id === id)?.emoji).join(" ")} · {profile.liked.length} swiped right · riddle score {profile.emojiScore}/{profile.emojiTotal}
                    </p>
                  </div>
                  <button onClick={restart} className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm text-muted hover:text-ink hover:border-pink">
                    <RotateCcw size={14} /> Retake quiz
                  </button>
                </div>
                <div className="mt-6">
                  <RecommendationGrid profile={profile} onTrailer={setTrailer} />
                </div>
              </div>
              <MoodMatch onTrailer={setTrailer} />
              <SecretVault onTrailer={setTrailer} />
            </motion.section>
          )}
        </AnimatePresence>
      </main>
      <footer className="text-center text-xs text-muted py-8 px-4">
        Streaming availability and ratings are indicative and may vary. Movie data enriched by TMDB when configured.
      </footer>
      <TrailerModal movie={trailer} onClose={() => setTrailer(null)} />
    </>
  );
}
