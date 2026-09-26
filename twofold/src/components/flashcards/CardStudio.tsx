"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { ShareBar } from "@/components/ui/ShareBar";
import { sfx } from "@/lib/audio";
import { buildLink } from "@/lib/share";
import { uid, useHydrated, useStored } from "@/lib/storage";
import { markActive } from "@/lib/streak";
import { DeckViewer } from "./DeckViewer";
import { FlipCard } from "./FlipCard";

export type CustomCard = { id: string; front: string; back: string };
/** Link payload for /deck: title + [front, back] pairs. */
export type DeckShare = { t: string; c: [string, string][] };

export const STUDIO_KEY = "studio";

export function useStudio() {
  return useStored<CustomCard[]>(STUDIO_KEY, []);
}

/** Write your own flip cards, preview them live, and share the whole deck as a link. */
export function CardStudio() {
  const [cards, setCards] = useStudio();
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [previewFlipped, setPreviewFlipped] = useState(false);
  const [title, setTitle] = useStored("studio-title", "Our little deck");
  const hydrated = useHydrated();

  const shareUrl = hydrated && cards.length ? buildLink("/deck", { t: title, c: cards.map((c) => [c.front, c.back]) } satisfies DeckShare) : "";

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!front.trim() || !back.trim()) return;
    sfx.chime();
    markActive();
    if (editing) {
      setCards((prev) => prev.map((c) => (c.id === editing ? { ...c, front: front.trim(), back: back.trim() } : c)));
    } else {
      setCards((prev) => [...prev, { id: uid(), front: front.trim(), back: back.trim() }]);
    }
    setFront("");
    setBack("");
    setEditing(null);
    setPreviewFlipped(false);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="card">
        <form onSubmit={save} className="grid gap-3">
          <label className="text-sm font-semibold">
            Front: question or memory trigger
            <textarea className="input mt-1.5 min-h-20 resize-none" maxLength={160} value={front} onChange={(e) => setFront(e.target.value)} placeholder="What song reminds you of our first trip?" />
          </label>
          <label className="text-sm font-semibold">
            Back: answer, hint or prompt
            <textarea className="input mt-1.5 min-h-20 resize-none" maxLength={220} value={back} onChange={(e) => setBack(e.target.value)} placeholder="Hint: it was playing in the cab to the airport 🎶" />
          </label>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary flex-1" disabled={!front.trim() || !back.trim()}>
              {editing ? <Pencil className="size-4" /> : <Plus className="size-4" />} {editing ? "Update card" : "Add to deck"}
            </button>
            {editing && (
              <button
                type="button"
                className="btn-ghost"
                onClick={() => {
                  setEditing(null);
                  setFront("");
                  setBack("");
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="mt-5">
          <p className="mb-2 text-xs font-bold tracking-wider text-ink-soft uppercase">Live preview</p>
          <FlipCard
            className="mx-auto h-56 max-w-sm"
            flipped={previewFlipped}
            onFlip={setPreviewFlipped}
            accent="#588157"
            front={<p className="headline my-auto text-center text-xl">{front || "Your question appears here"}</p>}
            back={<p className="my-auto text-center text-lg">{back || "…and the back of the card here"}</p>}
          />
        </div>
      </div>

      <div className="grid content-start gap-5">
        <div className="card">
          <div className="mb-3 flex items-center gap-2">
            <input className="input font-display text-lg font-semibold" value={title} maxLength={40} onChange={(e) => setTitle(e.target.value)} aria-label="Deck title" />
            <span className="shrink-0 text-xs font-bold text-ink-soft">{cards.length} cards</span>
          </div>
          <ul className="grid max-h-64 gap-2 overflow-y-auto">
            <AnimatePresence initial={false}>
              {cards.map((c) => (
                <motion.li key={c.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: 30 }} className="flex items-center gap-2 rounded-2xl bg-white/75 px-3 py-2">
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold">{c.front}</span>
                  <button
                    type="button"
                    aria-label="Edit"
                    className="grid size-9 place-items-center rounded-full text-ink-soft hover:bg-white"
                    onClick={() => {
                      setEditing(c.id);
                      setFront(c.front);
                      setBack(c.back);
                    }}
                  >
                    <Pencil className="size-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Delete"
                    className="grid size-9 place-items-center rounded-full text-ink-soft hover:bg-rose-soft/50 hover:text-rose"
                    onClick={() => setCards((prev) => prev.filter((x) => x.id !== c.id))}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
          {hydrated && !cards.length && <p className="py-4 text-center text-sm text-ink-soft">Your deck is empty. Write your first card ✍️</p>}
          {cards.length > 0 && (
            <div className="mt-4 border-t border-line pt-4">
              <ShareBar compact url={shareUrl} text={`💭 I made us a flashcard deck: “${title}”. Flip through it with me?`} />
            </div>
          )}
        </div>

        {cards.length > 0 && <DeckViewer cards={cards} accent="#588157" deckLabel={title} backTitle="The answer" />}
      </div>
    </div>
  );
}
