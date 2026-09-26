"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { BUCKET_CATEGORIES, BUCKET_SEED, type BucketCategory } from "@data/weekender";
import { ShareBar } from "@/components/ui/ShareBar";
import { sfx } from "@/lib/audio";
import { originFromEvent, sparkle } from "@/lib/confetti";
import { buildLink } from "@/lib/share";
import { uid, useHydrated, useStored } from "@/lib/storage";
import { markActive } from "@/lib/streak";

export type BucketItem = { id: string; text: string; category: BucketCategory; done: boolean };
export type BucketShare = { i: [string, BucketCategory, 0 | 1][] };

export const BUCKET_KEY = "bucket";
const SEED: BucketItem[] = BUCKET_SEED.map((s, i) => ({ id: `seed-${i}`, ...s, done: false }));

export function useBucket() {
  return useStored<BucketItem[]>(BUCKET_KEY, SEED);
}

export function BucketList() {
  const [items, setItems] = useBucket();
  const [cat, setCat] = useState<BucketCategory>("Movies");
  const [text, setText] = useState("");
  const hydrated = useHydrated();

  const visible = items.filter((i) => i.category === cat);
  const doneCount = items.filter((i) => i.done).length;
  const shareUrl = hydrated ? buildLink("/bucket", { i: items.map((x) => [x.text, x.category, x.done ? 1 : 0]) } satisfies BucketShare) : "";

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    sfx.pop();
    markActive();
    setItems((prev) => [{ id: uid(), text: text.trim(), category: cat, done: false }, ...prev]);
    setText("");
  };

  return (
    <div className="card">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex gap-1.5 rounded-full bg-white/70 p-1">
          {BUCKET_CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                sfx.pop();
                setCat(c.id);
              }}
              className="relative rounded-full px-3 py-1.5 text-[13px] font-semibold"
            >
              {cat === c.id && <motion.span layoutId="bucket-pill" className="absolute inset-0 rounded-full bg-rose" />}
              <span className={`relative ${cat === c.id ? "text-white" : "text-ink-soft"}`}>
                {c.emoji} <span className="hidden sm:inline">{c.id}</span>
              </span>
            </button>
          ))}
        </div>
        <span className="text-xs font-bold text-ink-soft tabular-nums">
          {doneCount}/{items.length} done
        </span>
      </div>

      <form onSubmit={add} className="mb-3 flex gap-2">
        <input className="input" value={text} onChange={(e) => setText(e.target.value)} placeholder={`Add to ${cat}…`} maxLength={80} />
        <button type="submit" className="btn-primary shrink-0 px-4" aria-label="Add item">
          <Plus className="size-5" />
        </button>
      </form>

      <ul className="grid gap-2">
        <AnimatePresence initial={false}>
          {visible.map((item) => (
            <motion.li
              key={item.id}
              layout
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: 40 }}
              className="flex items-center gap-3 rounded-2xl bg-white/75 px-3 py-2.5"
            >
              <button
                type="button"
                aria-label={item.done ? "Mark as not done" : "Mark as done"}
                onClick={(e) => {
                  if (!item.done) {
                    sfx.chime();
                    const o = originFromEvent(e);
                    sparkle(o.x, o.y);
                    markActive();
                  } else sfx.pop();
                  setItems((prev) => prev.map((x) => (x.id === item.id ? { ...x, done: !x.done } : x)));
                }}
                className={`grid size-8 shrink-0 place-items-center rounded-full border-2 transition ${
                  item.done ? "border-sage bg-sage text-white" : "border-line bg-white"
                }`}
              >
                <motion.span initial={false} animate={{ scale: item.done ? 1 : 0 }}>
                  <Check className="size-4" strokeWidth={3} />
                </motion.span>
              </button>
              <span className={`flex-1 text-[15px] ${item.done ? "text-ink-soft line-through decoration-rose/60" : ""}`}>{item.text}</span>
              <button
                type="button"
                aria-label="Remove"
                onClick={() => setItems((prev) => prev.filter((x) => x.id !== item.id))}
                className="grid size-9 place-items-center rounded-full text-ink-soft/60 hover:bg-rose-soft/50 hover:text-rose"
              >
                <Trash2 className="size-4" />
              </button>
            </motion.li>
          ))}
        </AnimatePresence>
        {hydrated && visible.length === 0 && <li className="py-6 text-center text-sm text-ink-soft">Nothing here yet. Dream a little ✨</li>}
      </ul>

      <div className="mt-4 border-t border-line pt-4">
        <p className="mb-2 text-xs font-semibold text-ink-soft">Share the list. Your partner can merge it into theirs:</p>
        <ShareBar compact url={shareUrl} text="📝 Our TwoFold bucket list. Add it to yours:" />
      </div>
    </div>
  );
}
