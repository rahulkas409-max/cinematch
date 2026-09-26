"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, FlaskConical, Loader2, Lock, Sparkles, X } from "lucide-react";
import { useState } from "react";
import { celebrate } from "@/lib/confetti";
import { play } from "@/lib/sound";
import { useApp } from "./AppProvider";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void; on: (e: string, cb: (r: unknown) => void) => void };
  }
}

const PERKS = [
  "Full curated watch-deck (24 personalised picks)",
  "5 secret hand-picked playlists",
  "Unlimited Mood Match searches",
  "Secret watchlist that follows you around",
];

function loadCheckout(): Promise<boolean> {
  if (window.Razorpay) return Promise.resolve(true);
  return new Promise((resolve) => {
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

type Phase = "idle" | "starting" | "sandbox-paying" | "verifying" | "done" | "error";

export function Paywall() {
  const { me, paywallOpen, closePaywall, paywallReason, refreshMe } = useApp();
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState("");

  const rupees = ((me?.pricePaise ?? 900) / 100).toFixed(0);

  const succeed = async () => {
    setPhase("done");
    play("unlock");
    celebrate();
    await refreshMe();
    setTimeout(() => {
      closePaywall();
      setPhase("idle");
    }, 1600);
  };

  const verify = async (payload: Record<string, unknown>) => {
    setPhase("verifying");
    const res = await fetch("/api/razorpay/verify-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.ok) return succeed();
    setError(data.error || "Payment could not be verified.");
    setPhase("error");
  };

  const pay = async () => {
    setError("");
    setPhase("starting");
    play("pop");
    try {
      const res = await fetch("/api/razorpay/create-order", { method: "POST" });
      const order = await res.json();
      if (!res.ok) throw new Error(order.error || "Could not create order");

      if (order.sandbox) {
        setPhase("sandbox-paying");
        await new Promise((r) => setTimeout(r, 1400));
        return verify({ sandbox: true, orderId: order.orderId });
      }

      if (!(await loadCheckout()) || !window.Razorpay) throw new Error("Could not load Razorpay Checkout. Check your connection.");
      const rzp = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.orderId,
        name: "CineMatch",
        description: `${me?.passHours ?? 24}-hour full access pass`,
        theme: { color: "#ff2e88" },
        handler: (resp: Record<string, string>) => void verify(resp),
        modal: { ondismiss: () => setPhase((p) => (p === "starting" ? "idle" : p)) },
      });
      rzp.on("payment.failed", (r) => {
        const desc = (r as { error?: { description?: string } }).error?.description;
        setError(desc || "Payment failed. No money was taken — try again?");
        setPhase("error");
      });
      rzp.open();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setPhase("error");
    }
  };

  const busy = phase === "starting" || phase === "sandbox-paying" || phase === "verifying";

  return (
    <AnimatePresence>
      {paywallOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => !busy && closePaywall()}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="paywall-title"
            className="relative w-full sm:max-w-md glass neon-ring rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 overflow-hidden"
            initial={{ y: 80, scale: 0.95, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", damping: 22, stiffness: 260 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="pointer-events-none absolute -top-24 -right-24 size-64 rounded-full bg-pink/30 blur-3xl" />
            <button
              onClick={closePaywall}
              disabled={busy}
              className="absolute top-4 right-4 p-2 rounded-full text-muted hover:text-ink hover:bg-white/5"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            {phase === "done" ? (
              <motion.div className="text-center py-8" initial={{ scale: 0.6 }} animate={{ scale: 1 }}>
                <div className="text-6xl mb-4">🍿</div>
                <h2 className="font-display text-2xl font-extrabold neon-text">You&apos;re in!</h2>
                <p className="text-muted mt-2">Full access unlocked. Grab the popcorn.</p>
              </motion.div>
            ) : (
              <>
                <motion.div
                  className="inline-flex items-center gap-2 rounded-full bg-pink/15 text-pink px-3 py-1 text-xs font-semibold"
                  animate={{ rotate: [0, -3, 3, 0] }}
                  transition={{ repeat: Infinity, duration: 2.4 }}
                >
                  <Lock size={12} /> {paywallReason || "Premium popcorn zone"}
                </motion.div>
                <h2 id="paywall-title" className="font-display text-2xl sm:text-3xl font-extrabold mt-4 leading-tight">
                  Unlock full access for just <span className="text-pink neon-text">₹{rupees}</span>
                </h2>
                <p className="text-muted mt-2 text-sm">
                  Less than a samosa. One payment, {me?.passHours ?? 24} hours of everything. No auto-renewal.
                </p>
                <ul className="mt-5 space-y-2.5">
                  {PERKS.map((p) => (
                    <li key={p} className="flex items-start gap-3 text-sm">
                      <span className="mt-0.5 grid place-items-center size-5 rounded-full bg-lime/20 text-lime shrink-0">
                        <Check size={12} strokeWidth={3} />
                      </span>
                      {p}
                    </li>
                  ))}
                </ul>

                {me?.sandbox && (
                  <div className="mt-5 flex gap-2 rounded-xl border border-amber/40 bg-amber/10 p-3 text-xs text-amber">
                    <FlaskConical size={16} className="shrink-0" />
                    Sandbox Mode: no Razorpay keys configured, so this unlock is simulated and free.
                  </div>
                )}
                {me?.razorpayTestMode && !me.sandbox && (
                  <div className="mt-5 flex gap-2 rounded-xl border border-cyan/40 bg-cyan/10 p-3 text-xs text-cyan">
                    <FlaskConical size={16} className="shrink-0" />
                    Razorpay Test Mode: use test UPI <code>success@razorpay</code> or a test card. No real money moves.
                  </div>
                )}

                {error && <p className="mt-4 text-sm text-pink" role="alert">{error}</p>}

                <motion.button
                  whileHover={{ scale: busy ? 1 : 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  disabled={busy || !me}
                  onClick={pay}
                  className="mt-6 w-full rounded-2xl bg-gradient-to-r from-pink via-violet to-cyan py-4 font-display font-extrabold text-bg text-lg disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {busy ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      {phase === "sandbox-paying" ? "Simulating payment…" : phase === "verifying" ? "Verifying…" : "Opening checkout…"}
                    </>
                  ) : (
                    <>
                      <Sparkles size={20} /> Pay ₹{rupees} &amp; unlock
                    </>
                  )}
                </motion.button>
                <p className="text-center text-[11px] text-muted mt-3">
                  {me?.sandbox ? "Simulated checkout" : "Secured by Razorpay · UPI, cards, netbanking & wallets"}
                </p>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
