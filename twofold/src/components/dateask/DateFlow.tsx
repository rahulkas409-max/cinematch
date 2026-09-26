"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Heart, Mail } from "lucide-react";
import { useRef, useState } from "react";
import { DODGE_CUES, NO_LABELS } from "@data/dateask";
import { sfx } from "@/lib/audio";
import { celebrate } from "@/lib/confetti";
import { markActive } from "@/lib/streak";
import { ConfirmedTicket } from "./ConfirmedTicket";
import { MealSelector } from "./MealSelector";
import type { Invite, TicketData } from "./types";
import { VibeSelector, WindowSelector } from "./VibeSelector";

type Step = "envelope" | "meal" | "vibe" | "window" | "ask" | "ticket";
const ORDER: Step[] = ["envelope", "meal", "vibe", "window", "ask", "ticket"];

/** The walkthrough your crush sees when they open the invite link. */
export function DateFlow({ invite }: { invite: Invite }) {
  const [step, setStep] = useState<Step>("envelope");
  const [dir, setDir] = useState(1);
  const [meal, setMeal] = useState<string>();
  const [vibe, setVibe] = useState<string>();
  const [when, setWhen] = useState<string>();

  const idx = ORDER.indexOf(step);
  const go = (to: Step) => {
    setDir(ORDER.indexOf(to) > idx ? 1 : -1);
    setStep(to);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const ticket: TicketData = { ...invite, m: meal ?? "", v: vibe ?? "", w: when ?? "" };
  const progress = Math.min(idx, 4) / 4;

  return (
    <div className="mx-auto w-full max-w-xl">
      {step !== "envelope" && step !== "ticket" && (
        <div className="mb-6 flex items-center gap-3">
          <button
            type="button"
            onClick={() => go(ORDER[idx - 1])}
            className="glass grid size-10 shrink-0 place-items-center rounded-full"
            aria-label="Back"
          >
            <ArrowLeft className="size-4" />
          </button>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/70">
            <motion.div className="h-full rounded-full bg-gradient-to-r from-rose to-amber" animate={{ width: `${progress * 100}%` }} />
          </div>
          <span className="text-xs font-bold text-ink-soft tabular-nums">{idx}/4</span>
        </div>
      )}

      <AnimatePresence mode="wait" custom={dir}>
        <motion.div
          key={step}
          custom={dir}
          initial={{ opacity: 0, x: dir * 40, filter: "blur(6px)" }}
          animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, x: dir * -40, filter: "blur(6px)" }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        >
          {step === "envelope" && <Envelope invite={invite} onOpen={() => go("meal")} />}

          {step === "meal" && (
            <StepShell kicker="Question 1" title="First off, what's our culinary mission?" canNext={!!meal} onNext={() => go("vibe")}>
              <MealSelector value={meal} onChange={setMeal} />
            </StepShell>
          )}

          {step === "vibe" && (
            <StepShell kicker="Question 2" title="Pick our soundtrack & vibe:" canNext={!!vibe} onNext={() => go("window")}>
              <VibeSelector value={vibe} onChange={setVibe} />
            </StepShell>
          )}

          {step === "window" && (
            <StepShell kicker="Question 3" title="Pick your preferred window:" canNext={!!when} onNext={() => go("ask")}>
              <WindowSelector value={when} onChange={setWhen} />
            </StepShell>
          )}

          {step === "ask" && (
            <BigQuestion
              invite={invite}
              onYes={() => {
                markActive();
                sfx.chime();
                celebrate();
                setTimeout(() => go("ticket"), 1100);
              }}
            />
          )}

          {step === "ticket" && (
            <div>
              <div className="mb-6 text-center">
                <p className="font-script text-3xl text-rose">It&apos;s a date!</p>
                <h2 className="headline text-3xl">Your official ticket 🎟️</h2>
                <p className="mt-2 text-sm text-ink-soft">Send it back to {invite.f} so they know it&apos;s confirmed.</p>
              </div>
              <ConfirmedTicket ticket={ticket} />
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function StepShell({
  kicker,
  title,
  children,
  canNext,
  onNext,
}: {
  kicker: string;
  title: string;
  children: React.ReactNode;
  canNext: boolean;
  onNext: () => void;
}) {
  return (
    <div>
      <p className="font-script text-2xl text-rose">{kicker}</p>
      <h2 className="headline mb-5 text-[30px] leading-tight sm:text-4xl">{title}</h2>
      {children}
      <div className="sticky bottom-4 mt-6 flex justify-end">
        <button type="button" className="btn-primary px-7" disabled={!canNext} onClick={onNext}>
          Next <ArrowRight className="size-4" />
        </button>
      </div>
    </div>
  );
}

function Envelope({ invite, onOpen }: { invite: Invite; onOpen: () => void }) {
  const [opening, setOpening] = useState(false);
  return (
    <div className="flex flex-col items-center pt-4 text-center">
      <p className="font-script text-3xl text-rose">Psst, {invite.t}…</p>
      <h1 className="headline mt-1 text-4xl leading-tight sm:text-5xl">
        {invite.f} sent you <em className="text-rose italic">something</em>
      </h1>

      <motion.button
        type="button"
        onClick={() => {
          if (opening) return;
          sfx.flip();
          setOpening(true);
          setTimeout(onOpen, 900);
        }}
        whileHover={{ rotate: -2, scale: 1.02 }}
        whileTap={{ scale: 0.96 }}
        animate={opening ? { y: -30, scale: 1.08, rotate: 0 } : { y: [0, -8, 0] }}
        transition={opening ? { type: "spring", stiffness: 200, damping: 14 } : { duration: 2.4, repeat: Infinity }}
        className="perspective relative mt-10 h-52 w-72"
        aria-label="Open the invitation"
      >
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-rose-soft to-amber-soft shadow-lift" />
        <motion.div
          className="absolute inset-x-0 top-0 h-28 origin-top rounded-t-3xl bg-gradient-to-b from-[#f2b5a4] to-rose-soft"
          style={{ clipPath: "polygon(0 0, 100% 0, 50% 100%)" }}
          animate={{ rotateX: opening ? 180 : 0 }}
          transition={{ duration: 0.6 }}
        />
        <div className="absolute inset-0 grid place-items-center">
          <span className="grid size-16 place-items-center rounded-full bg-rose text-white shadow-lg">
            <Heart className="size-7 fill-white" />
          </span>
        </div>
      </motion.button>

      {invite.n && <p className="mt-10 max-w-sm font-script text-2xl leading-snug text-ink">“{invite.n}”</p>}

      <button type="button" className="btn-primary mt-8 px-8" onClick={onOpen}>
        <Mail className="size-4" /> Open invitation
      </button>
    </div>
  );
}

function BigQuestion({ invite, onYes }: { invite: Invite; onYes: () => void }) {
  const arena = useRef<HTMLDivElement>(null);
  const [dodges, setDodges] = useState(0);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [cue, setCue] = useState<string | null>(null);
  const [said, setSaid] = useState(false);

  const dodge = () => {
    const box = arena.current?.getBoundingClientRect();
    const maxX = box ? box.width / 2 - 70 : 110;
    const maxY = 70;
    let x = (Math.random() * 2 - 1) * maxX;
    const y = (Math.random() * 2 - 1) * maxY;
    // Always jump a noticeable distance away from the current spot.
    if (Math.abs(x - pos.x) < 60) x = x > 0 ? x - maxX * 0.8 : x + maxX * 0.8;
    sfx.boop();
    setPos({ x, y });
    setDodges((d) => d + 1);
    setCue(DODGE_CUES[dodges % DODGE_CUES.length]);
  };

  const yesScale = Math.min(1 + dodges * 0.07, 1.45);

  return (
    <div className="text-center">
      <p className="font-script text-3xl text-rose">The big question</p>
      <h2 className="headline text-[42px] leading-tight sm:text-6xl">
        So… is it a <em className="text-rose italic">date</em>?
      </h2>
      <p className="mt-2 text-ink-soft">
        {invite.f} is nervously refreshing their phone. No pressure, {invite.t} 😌
      </p>

      <div ref={arena} className="relative mt-8 flex h-72 flex-col items-center justify-center gap-10">
        <motion.button
          type="button"
          onClick={() => {
            if (said) return;
            setSaid(true);
            onYes();
          }}
          animate={{ scale: said ? [yesScale, yesScale * 1.25, yesScale] : yesScale }}
          whileHover={{ scale: yesScale * 1.05 }}
          whileTap={{ scale: yesScale * 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
          className="relative z-10 animate-pulse-ring rounded-full bg-gradient-to-r from-rose to-[#ef8a5f] px-10 py-5 text-xl font-bold text-white shadow-lift"
        >
          YES! Absolutely 💖
        </motion.button>

        <motion.button
          type="button"
          onPointerEnter={(e) => e.pointerType === "mouse" && dodge()}
          onClick={dodge}
          animate={{ x: pos.x, y: pos.y, rotate: pos.x / 12 }}
          transition={{ type: "spring", stiffness: 500, damping: 18 }}
          className="btn-ghost relative z-0 text-ink-soft"
        >
          {NO_LABELS[dodges % NO_LABELS.length]}
        </motion.button>
      </div>

      <div className="h-12">
        <AnimatePresence mode="wait">
          {cue && (
            <motion.p
              key={cue + dodges}
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8 }}
              className="mx-auto inline-block rounded-full bg-ink px-4 py-2 text-sm font-semibold text-cream"
            >
              {cue}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
