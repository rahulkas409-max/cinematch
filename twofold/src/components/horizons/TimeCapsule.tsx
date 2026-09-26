"use client";

import { AnimatePresence, motion } from "framer-motion";
import { KeyRound, Lock, LockKeyhole, MailOpen, Trash2, Unlock } from "lucide-react";
import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { ShareBar } from "@/components/ui/ShareBar";
import { sfx } from "@/lib/audio";
import { celebrate } from "@/lib/confetti";
import { seal, unseal, type Sealed } from "@/lib/crypto";
import { buildLink } from "@/lib/share";
import { uid, useStored } from "@/lib/storage";
import { markActive } from "@/lib/streak";
import { formatCountdown, useNow } from "@/lib/time";

export type Capsule = { id: string; title: string; from: string; unlockAt: string; sealed: Sealed; createdAt: number };
/** Link payload for /capsule. The passphrase is never included. */
export type CapsuleShare = { t: string; f: string; u: string; s: Sealed };

export const CAPSULE_KEY = "capsules";

export function useCapsules() {
  return useStored<Capsule[]>(CAPSULE_KEY, []);
}

function unlockTime(c: Pick<Capsule, "unlockAt">) {
  return new Date(c.unlockAt + "T00:00:00").getTime();
}

function describeWait(ms: number) {
  const days = Math.floor(ms / 86_400_000);
  if (days >= 1) return `${days} day${days === 1 ? "" : "s"}`;
  return formatCountdown(ms);
}

/** Envelope card with countdown. Opens (after the date + correct passphrase) into the letter. */
export function CapsuleCard({ capsule, onDelete, shareable = true }: { capsule: Capsule; onDelete?: () => void; shareable?: boolean }) {
  const now = useNow();
  const [open, setOpen] = useState(false);
  const [pass, setPass] = useState("");
  const [letter, setLetter] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const wait = now ? unlockTime(capsule) - now : 1;
  const ready = now > 0 && wait <= 0;
  const shareUrl = now ? buildLink("/capsule", { t: capsule.title, f: capsule.from, u: capsule.unlockAt, s: capsule.sealed } satisfies CapsuleShare) : "";

  const tryOpen = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const text = await unseal(capsule.sealed, pass);
    setBusy(false);
    if (text === null) {
      sfx.boop();
      setError("That passphrase doesn't fit this lock.");
      return;
    }
    sfx.chime();
    celebrate();
    markActive();
    setLetter(text);
  };

  return (
    <>
      <motion.div layout className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-white to-rose-soft/50 p-5 shadow-soft">
        <div className="flex items-start gap-3">
          <span className={`grid size-12 shrink-0 place-items-center rounded-2xl ${ready ? "bg-sage text-white" : "bg-ink text-cream"}`}>
            {ready ? <Unlock className="size-5" /> : <LockKeyhole className="size-5" />}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-lg font-semibold">{capsule.title}</p>
            <p className="text-xs text-ink-soft">
              From {capsule.from} · opens {new Date(capsule.unlockAt + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
          {onDelete && (
            <button type="button" aria-label="Delete capsule" onClick={onDelete} className="grid size-8 place-items-center rounded-full text-ink-soft/50 hover:text-rose">
              <Trash2 className="size-4" />
            </button>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between gap-2">
          <p className="text-sm font-semibold tabular-nums">{ready ? "Ready to open 💌" : now ? `Unlocks in ${describeWait(wait)}` : "…"}</p>
          <button
            type="button"
            className={ready ? "btn-primary" : "btn-ghost"}
            disabled={!ready}
            onClick={() => {
              sfx.pop();
              setOpen(true);
            }}
          >
            {ready ? <MailOpen className="size-4" /> : <Lock className="size-4" />} {ready ? "Open" : "Sealed"}
          </button>
        </div>
        {shareable && (
          <div className="mt-3 border-t border-line pt-3">
            <ShareBar compact url={shareUrl} text={`🔒 I sealed a letter for you in our TwoFold time capsule. It unlocks on ${capsule.unlockAt}. I'll tell you the passphrase then 😉`} />
          </div>
        )}
      </motion.div>

      <Modal
        open={open}
        onClose={() => {
          setOpen(false);
          setLetter(null);
          setPass("");
          setError("");
        }}
        title={letter ? capsule.title : "Unlock the capsule"}
      >
        <AnimatePresence mode="wait">
          {letter ? (
            <motion.div key="letter" initial={{ opacity: 0, y: 30, rotateX: -30 }} animate={{ opacity: 1, y: 0, rotateX: 0 }} className="rounded-3xl bg-white p-6 shadow-soft">
              <p className="font-script text-2xl leading-relaxed whitespace-pre-wrap text-ink">{letter}</p>
              <p className="mt-4 text-right font-script text-xl text-rose">— {capsule.from}</p>
            </motion.div>
          ) : (
            <motion.form key="form" onSubmit={tryOpen} className="grid gap-3">
              <p className="text-sm text-ink-soft">Enter the passphrase {capsule.from} chose. It never leaves this device.</p>
              <input
                className="input"
                type="password"
                autoFocus
                value={pass}
                onChange={(e) => {
                  setPass(e.target.value);
                  setError("");
                }}
                placeholder="Passphrase"
              />
              {error && <p className="text-sm text-rose">{error}</p>}
              <button type="submit" className="btn-primary" disabled={!pass || busy}>
                <KeyRound className="size-4" /> {busy ? "Unlocking…" : "Unlock"}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </Modal>
    </>
  );
}

/** Write a letter, seal it with AES-GCM, and schedule when it may be opened. */
export function TimeCapsule({ defaultFrom }: { defaultFrom: string }) {
  const [capsules, setCapsules] = useCapsules();
  const [title, setTitle] = useState("For our next anniversary");
  const [from, setFrom] = useState("");
  const [body, setBody] = useState("");
  const [unlockAt, setUnlockAt] = useState("");
  const [pass, setPass] = useState("");
  const [busy, setBusy] = useState(false);

  const valid = title.trim() && body.trim() && unlockAt && pass.length >= 4;

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    setBusy(true);
    const sealed = await seal(body, pass);
    setBusy(false);
    sfx.chime();
    celebrate();
    markActive();
    setCapsules((prev) => [{ id: uid(), title: title.trim(), from: from.trim() || defaultFrom, unlockAt, sealed, createdAt: Date.now() }, ...prev]);
    setBody("");
    setPass("");
  };

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <form onSubmit={create} className="card grid gap-3">
        <input className="input font-display text-lg font-semibold" value={title} maxLength={60} onChange={(e) => setTitle(e.target.value)} aria-label="Capsule title" />
        <textarea
          className="input min-h-44 resize-none font-script text-xl leading-relaxed"
          placeholder="Dear you, by the time you read this…"
          value={body}
          maxLength={4000}
          onChange={(e) => setBody(e.target.value)}
        />
        <div className="grid grid-cols-2 gap-2">
          <label className="text-xs font-semibold text-ink-soft">
            Signed
            <input className="input mt-1" placeholder={defaultFrom} value={from} maxLength={30} onChange={(e) => setFrom(e.target.value)} />
          </label>
          <label className="text-xs font-semibold text-ink-soft">
            Unlocks on
            <input className="input mt-1" type="date" value={unlockAt} onChange={(e) => setUnlockAt(e.target.value)} />
          </label>
        </div>
        <label className="text-xs font-semibold text-ink-soft">
          Passphrase (min 4 characters, keep it secret until the day)
          <input className="input mt-1" type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="Something only you two know" />
        </label>
        <button type="submit" className="btn-dark" disabled={!valid || busy}>
          <LockKeyhole className="size-4" /> {busy ? "Sealing…" : "Seal the capsule"}
        </button>
        <p className="text-[11px] text-ink-soft">Encrypted in your browser with AES-256-GCM. Without the passphrase, not even TwoFold can read it.</p>
      </form>

      <div className="grid content-start gap-3">
        {capsules.length === 0 && (
          <div className="grid min-h-40 place-items-center rounded-[28px] border-2 border-dashed border-line p-6 text-center text-sm text-ink-soft">
            Sealed capsules will wait here, counting down to their big day ⏳
          </div>
        )}
        <AnimatePresence initial={false}>
          {capsules.map((c) => (
            <motion.div key={c.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
              <CapsuleCard capsule={c} onDelete={() => setCapsules((prev) => prev.filter((x) => x.id !== c.id))} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
