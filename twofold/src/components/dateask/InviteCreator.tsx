"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Eye, Sparkles, Wand2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { SAMPLE_NOTES } from "@data/dateask";
import { ShareBar } from "@/components/ui/ShareBar";
import { sfx } from "@/lib/audio";
import { buildLink } from "@/lib/share";
import { useStored } from "@/lib/storage";
import { markActive } from "@/lib/streak";
import type { Invite } from "./types";

/** Step 1: the creator writes names + a sweet note and gets a hash-encoded invite link. */
export function InviteCreator() {
  const [draft, setDraft] = useStored<Invite>("invite-draft", { f: "", t: "", n: "" });
  const [link, setLink] = useState("");

  const valid = draft.f.trim() && draft.t.trim();

  const generate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    const payload: Invite = { f: draft.f.trim(), t: draft.t.trim(), ...(draft.n?.trim() ? { n: draft.n.trim() } : {}) };
    setLink(buildLink("/invite", payload));
    markActive();
    sfx.chime();
  };

  return (
    <div className="card">
      <form onSubmit={generate} className="grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-semibold">
            Your name
            <input
              className="input mt-1.5"
              value={draft.f}
              maxLength={40}
              placeholder="Aarav"
              onChange={(e) => {
                setLink("");
                setDraft({ ...draft, f: e.target.value });
              }}
            />
          </label>
          <label className="text-sm font-semibold">
            Their name
            <input
              className="input mt-1.5"
              value={draft.t}
              maxLength={40}
              placeholder="Meera"
              onChange={(e) => {
                setLink("");
                setDraft({ ...draft, t: e.target.value });
              }}
            />
          </label>
        </div>
        <label className="text-sm font-semibold">
          A sweet one-liner <span className="font-normal text-ink-soft">(optional)</span>
          <textarea
            className="input mt-1.5 min-h-20 resize-none"
            value={draft.n}
            maxLength={140}
            placeholder={SAMPLE_NOTES[0]}
            onChange={(e) => {
              setLink("");
              setDraft({ ...draft, n: e.target.value });
            }}
          />
        </label>
        <div className="-mt-1 flex flex-wrap gap-2">
          {SAMPLE_NOTES.map((n) => (
            <button
              key={n}
              type="button"
              className="chip border-line bg-white/70 text-ink-soft hover:text-ink"
              onClick={() => {
                sfx.pop();
                setLink("");
                setDraft({ ...draft, n });
              }}
            >
              <Sparkles className="size-3.5 text-amber" /> {n.length > 34 ? n.slice(0, 32) + "…" : n}
            </button>
          ))}
        </div>
        <button type="submit" className="btn-primary mt-1 w-full py-3.5 text-base" disabled={!valid}>
          <Wand2 className="size-5" /> Create my invite link
        </button>
      </form>

      <AnimatePresence>
        {link && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-5 rounded-3xl border border-dashed border-rose/40 bg-rose-soft/40 p-4">
              <p className="text-sm font-semibold">Your invite is ready 💌</p>
              <p className="mt-1 truncate font-mono text-xs text-ink-soft">{link}</p>
              <div className="mt-3">
                <ShareBar
                  compact
                  url={link}
                  title={`A little something for ${draft.t}`}
                  text={`Hey ${draft.t.trim()} 👀 I made you something. Open it?`}
                />
              </div>
              <Link href={link.slice(link.indexOf("/invite"))} className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-rose">
                <Eye className="size-4" /> Preview what {draft.t.trim()} will see
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
