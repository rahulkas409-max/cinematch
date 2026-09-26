"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, MapPin, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { MILESTONE_KINDS, MILESTONE_SEED, type Milestone } from "@data/horizons";
import { sfx } from "@/lib/audio";
import { originFromEvent, sparkle } from "@/lib/confetti";
import { uid, useStored } from "@/lib/storage";
import { markActive } from "@/lib/streak";

type Stored = Milestone & { done?: boolean };
const EMOJIS = ["✈️", "🏔️", "🌊", "🏡", "📚", "🎶", "🩺", "💰", "🌸", "🚐", "🍷", "🎨"];

/** "Golden Years" blueprint: an interactive vertical timeline from today to 80. */
export function AgingTimeline() {
  const [items, setItems] = useStored<Stored[]>("timeline", MILESTONE_SEED);
  const [age, setAge] = useStored<number>("timeline-age", 30);
  const [filter, setFilter] = useState<Milestone["kind"] | "all">("all");
  const [form, setForm] = useState({ title: "", age: 50, emoji: EMOJIS[0], kind: "travel" as Milestone["kind"] });

  const sorted = [...items].sort((a, b) => a.age - b.age).filter((m) => filter === "all" || m.kind === filter);
  const color = (k: Milestone["kind"]) => MILESTONE_KINDS.find((x) => x.id === k)?.color ?? "#e06d53";

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    sfx.chime();
    markActive();
    setItems((prev) => [...prev, { id: uid(), age: form.age, title: form.title.trim(), emoji: form.emoji, kind: form.kind }]);
    setForm({ ...form, title: "" });
  };

  // Insert the "you are here" marker at the right spot in the list.
  const hereIndex = sorted.findIndex((m) => m.age > age);

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_1.2fr]">
      <div className="grid content-start gap-4">
        <div className="card">
          <label className="text-sm font-semibold">
            Our age today: <span className="text-rose">{age}</span>
            <input type="range" min={18} max={80} value={age} onChange={(e) => setAge(Number(e.target.value))} className="mt-2 w-full accent-rose" />
          </label>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <button type="button" onClick={() => setFilter("all")} className={`chip ${filter === "all" ? "border-ink bg-ink text-cream" : "border-line bg-white/70 text-ink-soft"}`}>
              All
            </button>
            {MILESTONE_KINDS.map((k) => (
              <button
                key={k.id}
                type="button"
                onClick={() => setFilter(k.id)}
                className={`chip ${filter === k.id ? "text-white" : "border-line bg-white/70 text-ink-soft"}`}
                style={filter === k.id ? { background: k.color, borderColor: k.color } : undefined}
              >
                {k.label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={add} className="card grid gap-3">
          <p className="text-sm font-semibold">Add a shared dream</p>
          <input className="input" placeholder="Road trip across Ladakh" value={form.title} maxLength={60} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <div className="grid grid-cols-2 gap-2">
            <label className="text-xs font-semibold text-ink-soft">
              At age
              <input className="input mt-1" type="number" min={18} max={100} value={form.age} onChange={(e) => setForm({ ...form, age: Number(e.target.value) || 50 })} />
            </label>
            <label className="text-xs font-semibold text-ink-soft">
              Type
              <select className="input mt-1" value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value as Milestone["kind"] })}>
                {MILESTONE_KINDS.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {EMOJIS.map((em) => (
              <button
                key={em}
                type="button"
                onClick={() => setForm({ ...form, emoji: em })}
                className={`grid size-10 place-items-center rounded-xl text-xl transition ${form.emoji === em ? "bg-rose-soft ring-2 ring-rose" : "bg-white/70"}`}
              >
                {em}
              </button>
            ))}
          </div>
          <button type="submit" className="btn-primary" disabled={!form.title.trim()}>
            <Plus className="size-4" /> Pin to our timeline
          </button>
        </form>
      </div>

      <div className="card">
        <ol className="relative ml-4 border-l-2 border-dashed border-rose/30 pl-6">
          <AnimatePresence initial={false}>
            {sorted.map((m, i) => (
              <motion.li key={m.id} layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="relative pb-5 last:pb-0">
                {i === hereIndex && <HereMarker age={age} />}
                <span
                  className="absolute top-1 -left-[2.35rem] grid size-8 place-items-center rounded-full text-base text-white shadow-soft ring-4 ring-cream"
                  style={{ background: m.done ? "#588157" : color(m.kind) }}
                >
                  {m.done ? <Check className="size-4" strokeWidth={3} /> : m.emoji}
                </span>
                <div className={`flex items-start gap-3 rounded-2xl bg-white/75 px-4 py-3 ${m.age < age && !m.done ? "opacity-60" : ""}`}>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-bold tracking-wider uppercase" style={{ color: color(m.kind) }}>
                      Age {m.age} · {m.age - age > 0 ? `in ${m.age - age} yrs` : m.age === age ? "this year" : "past"}
                    </p>
                    <p className={`font-semibold ${m.done ? "text-ink-soft line-through" : ""}`}>{m.title}</p>
                  </div>
                  <button
                    type="button"
                    aria-label={m.done ? "Mark not done" : "Mark done"}
                    onClick={(e) => {
                      if (!m.done) {
                        sfx.chime();
                        const o = originFromEvent(e);
                        sparkle(o.x, o.y);
                      }
                      setItems((prev) => prev.map((x) => (x.id === m.id ? { ...x, done: !x.done } : x)));
                    }}
                    className={`grid size-9 shrink-0 place-items-center rounded-full border-2 ${m.done ? "border-sage bg-sage text-white" : "border-line"}`}
                  >
                    <Check className="size-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Remove"
                    onClick={() => setItems((prev) => prev.filter((x) => x.id !== m.id))}
                    className="grid size-9 shrink-0 place-items-center rounded-full text-ink-soft/50 hover:text-rose"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
          {hereIndex === -1 && (
            <li className="relative pt-2">
              <HereMarker age={age} />
            </li>
          )}
        </ol>
      </div>
    </div>
  );
}

function HereMarker({ age }: { age: number }) {
  return (
    <motion.div layout className="relative mb-5 flex items-center gap-2">
      <span className="absolute -left-[2.2rem] grid size-7 place-items-center rounded-full bg-ink text-cream ring-4 ring-cream">
        <MapPin className="size-3.5" />
      </span>
      <span className="rounded-full bg-ink px-3 py-1 text-xs font-bold text-cream">You are here · {age}</span>
    </motion.div>
  );
}
