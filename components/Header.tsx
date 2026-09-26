"use client";

import { motion } from "framer-motion";
import { Crown, FlaskConical, Volume2, VolumeX } from "lucide-react";
import { useApp } from "./AppProvider";

export function Header({ onHome }: { onHome: () => void }) {
  const { me, sound, toggleSound, openPaywall } = useApp();
  return (
    <>
      {me?.sandbox && (
        <div className="bg-amber text-bg text-xs sm:text-sm font-semibold text-center px-4 py-2 flex items-center justify-center gap-2">
          <FlaskConical size={14} className="shrink-0" />
          <span>
            Test / Sandbox Mode — no Razorpay keys found, so the ₹9 unlock is simulated. Add keys to <code>.env.local</code> for real payments.
          </span>
        </div>
      )}
      <header className="sticky top-0 z-40 glass border-x-0 border-t-0">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
          <button onClick={onHome} className="font-display font-extrabold text-lg sm:text-xl tracking-tight flex items-center gap-2">
            <motion.span animate={{ rotate: [0, 12, -12, 0] }} transition={{ repeat: Infinity, duration: 4, repeatDelay: 2 }}>
              🎬
            </motion.span>
            <span>
              Cine<span className="text-pink neon-text">Match</span>
            </span>
          </button>
          <div className="flex items-center gap-2">
            <button onClick={toggleSound} className="grid place-items-center size-10 rounded-full hover:bg-white/5 text-muted hover:text-ink" aria-label={sound ? "Mute sound effects" : "Enable sound effects"} aria-pressed={sound}>
              {sound ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>
            {me?.premium ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-lime/15 text-lime px-3 py-1.5 text-xs sm:text-sm font-bold">
                <Crown size={14} /> Premium · {me.premiumHoursLeft}h left
              </span>
            ) : (
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => openPaywall()} className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-pink to-violet px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold">
                <Crown size={14} /> Unlock ₹9
              </motion.button>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
