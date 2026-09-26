"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CalendarHeart, Pencil, Phone, Plus, Trash2, UserPlus } from "lucide-react";
import { useState } from "react";
import { DEFAULT_DATES, MEMBER_TEMPLATES, PASSPORT_FIELDS, type FamilyMember, type ImportantDate } from "@data/family";
import { Modal } from "@/components/ui/Modal";
import { sfx } from "@/lib/audio";
import { possessive, useCouple } from "@/lib/couple";
import { uid, useStored } from "@/lib/storage";
import { markActive } from "@/lib/streak";
import { daysUntil, nextOccurrence, useNow } from "@/lib/time";

const KIND_STYLE: Record<ImportantDate["kind"], string> = {
  Birthday: "from-rose-soft to-white",
  Anniversary: "from-[#f7c1c9] to-white",
  Festival: "from-amber-soft to-white",
  Puja: "from-sage-soft to-white",
};
const KIND_EMOJI: Record<ImportantDate["kind"], string> = { Birthday: "🎂", Anniversary: "💍", Festival: "🪔", Puja: "🌼" };

function emptyMember(side: "A" | "B"): FamilyMember {
  return { id: uid(), name: "", relation: "", side, fields: {} };
}

export function FamilyPassport() {
  const { names } = useCouple();
  const [members, setMembers] = useStored<FamilyMember[]>("family-members", MEMBER_TEMPLATES);
  const [side, setSide] = useState<"A" | "B">("A");
  const [editing, setEditing] = useState<FamilyMember | null>(null);

  const familyName = (s: "A" | "B") => `${possessive(s === "A" ? names.a : names.b)} family`;
  const visible = members.filter((m) => m.side === side);

  const saveMember = () => {
    if (!editing || !editing.name.trim()) return;
    sfx.chime();
    markActive();
    setMembers((prev) => (prev.some((m) => m.id === editing.id) ? prev.map((m) => (m.id === editing.id ? editing : m)) : [...prev, editing]));
    setEditing(null);
  };

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex rounded-full bg-white/70 p-1">
          {(["A", "B"] as const).map((s) => (
            <button key={s} type="button" onClick={() => setSide(s)} className="relative rounded-full px-4 py-2 text-sm font-semibold">
              {side === s && <motion.span layoutId="fam-side" className="absolute inset-0 rounded-full bg-ink" />}
              <span className={`relative ${side === s ? "text-cream" : "text-ink-soft"}`}>{familyName(s)}</span>
            </button>
          ))}
        </div>
        <button type="button" className="btn-primary px-4" onClick={() => setEditing(emptyMember(side))}>
          <UserPlus className="size-4" /> <span className="hidden sm:inline">Add member</span>
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence initial={false}>
          {visible.map((m) => (
            <motion.article
              key={m.id}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="overflow-hidden rounded-[28px] bg-white shadow-soft"
            >
              <div className={`flex items-center gap-3 px-5 py-4 ${m.side === "A" ? "bg-rose" : "bg-sage"} text-white`}>
                <span className="grid size-12 place-items-center rounded-2xl bg-white/25 font-display text-xl font-semibold">{m.name.slice(0, 1).toUpperCase() || "?"}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold tracking-[0.2em] uppercase opacity-80">Family passport</p>
                  <p className="truncate font-display text-xl font-semibold">{m.name}</p>
                  <p className="text-xs opacity-90">{m.relation}</p>
                </div>
                <button type="button" aria-label="Edit" onClick={() => setEditing(m)} className="grid size-9 place-items-center rounded-full bg-white/20">
                  <Pencil className="size-4" />
                </button>
              </div>
              <dl className="grid gap-2.5 px-5 py-4">
                {PASSPORT_FIELDS.filter((f) => m.fields[f.key]).map((f) => (
                  <div key={f.key} className="flex gap-2.5">
                    <span className="text-lg leading-6">{f.emoji}</span>
                    <div>
                      <dt className="text-[10px] font-bold tracking-wider text-ink-soft uppercase">{f.label}</dt>
                      <dd className="text-sm leading-snug">{m.fields[f.key]}</dd>
                    </div>
                  </div>
                ))}
                {!PASSPORT_FIELDS.some((f) => m.fields[f.key]) && <p className="text-sm text-ink-soft">Tap ✎ to fill in their favourites.</p>}
              </dl>
            </motion.article>
          ))}
        </AnimatePresence>
        {visible.length === 0 && (
          <button type="button" onClick={() => setEditing(emptyMember(side))} className="grid min-h-48 place-items-center rounded-[28px] border-2 border-dashed border-line text-sm font-semibold text-ink-soft">
            <span className="flex flex-col items-center gap-2">
              <Plus className="size-6" /> Add the first family member
            </span>
          </button>
        )}
      </div>

      {/* Communication cheat-sheet */}
      {members.some((m) => m.fields.comms) && (
        <div className="card">
          <p className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <Phone className="size-4 text-rose" /> Communication cheat-sheet
          </p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {members
              .filter((m) => m.fields.comms)
              .map((m) => (
                <li key={m.id} className="rounded-2xl bg-white/75 px-3 py-2 text-sm">
                  <b>{m.name}</b> <span className="text-ink-soft">({possessive(m.side === "A" ? names.a : names.b)} side)</span>: {m.fields.comms}
                </li>
              ))}
          </ul>
        </div>
      )}

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing && members.some((m) => m.id === editing.id) ? "Edit passport" : "New family member"}>
        {editing && (
          <div className="grid gap-3">
            <div className="grid grid-cols-2 gap-2">
              <input className="input" placeholder="Name (e.g. Mom)" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
              <input className="input" placeholder="Relation" value={editing.relation} onChange={(e) => setEditing({ ...editing, relation: e.target.value })} />
            </div>
            {PASSPORT_FIELDS.map((f) => (
              <label key={f.key} className="text-xs font-semibold text-ink-soft">
                {f.emoji} {f.label}
                <input
                  className="input mt-1"
                  placeholder={f.placeholder}
                  value={editing.fields[f.key] ?? ""}
                  onChange={(e) => setEditing({ ...editing, fields: { ...editing.fields, [f.key]: e.target.value } })}
                />
              </label>
            ))}
            <div className="mt-2 flex gap-2">
              {members.some((m) => m.id === editing.id) && (
                <button
                  type="button"
                  className="btn-ghost text-rose"
                  onClick={() => {
                    setMembers((prev) => prev.filter((m) => m.id !== editing.id));
                    setEditing(null);
                  }}
                >
                  <Trash2 className="size-4" />
                </button>
              )}
              <button type="button" className="btn-primary flex-1" disabled={!editing.name.trim()} onClick={saveMember}>
                Save passport
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

/** Birthdays, anniversaries and festivals as visual countdown cards. */
export function ImportantDates() {
  const now = useNow();
  const [dates, setDates] = useStored<ImportantDate[]>("family-dates", DEFAULT_DATES);
  const [form, setForm] = useState<Omit<ImportantDate, "id">>({ title: "", date: "", kind: "Birthday", recurring: true });

  const upcoming = now
    ? dates
        .map((d) => {
          const days = d.recurring ? nextOccurrence(d.date, now).days : daysUntil(d.date, now);
          const on = d.recurring ? nextOccurrence(d.date, now).date : new Date(d.date + "T00:00:00");
          return { ...d, days, on };
        })
        .sort((a, b) => (a.days < 0 ? 1 : 0) - (b.days < 0 ? 1 : 0) || a.days - b.days)
    : [];

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.date) return;
    sfx.pop();
    markActive();
    setDates((prev) => [...prev, { ...form, title: form.title.trim(), id: uid() }]);
    setForm({ ...form, title: "", date: "" });
  };

  return (
    <div className="grid gap-4">
      <div className="no-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2">
        {upcoming.map((d) => (
          <motion.div
            key={d.id}
            layout
            className={`relative w-40 shrink-0 snap-start rounded-[26px] bg-gradient-to-b p-4 shadow-soft ${KIND_STYLE[d.kind]} ${d.days < 0 ? "opacity-50" : ""}`}
          >
            <button
              type="button"
              aria-label={`Remove ${d.title}`}
              onClick={() => setDates((prev) => prev.filter((x) => x.id !== d.id))}
              className="absolute top-2 right-2 grid size-7 place-items-center rounded-full text-ink-soft/50 hover:bg-white hover:text-rose"
            >
              <Trash2 className="size-3.5" />
            </button>
            <span className="text-2xl">{KIND_EMOJI[d.kind]}</span>
            <p className="headline mt-2 text-4xl leading-none">{d.days < 0 ? "✓" : d.days === 0 ? "Today" : d.days}</p>
            <p className="text-[11px] font-bold tracking-wider text-ink-soft uppercase">{d.days > 0 ? `day${d.days === 1 ? "" : "s"} to go` : d.days === 0 ? "🎉🎉🎉" : "passed"}</p>
            <p className="mt-3 truncate text-sm font-semibold">{d.title}</p>
            <p className="text-xs text-ink-soft">{d.on.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: d.recurring ? undefined : "numeric" })}</p>
          </motion.div>
        ))}
      </div>

      <form onSubmit={add} className="card grid gap-2 sm:grid-cols-[1.4fr_1fr_1fr_auto] sm:items-center">
        <input className="input" placeholder="Maa's birthday, Ganesh Chaturthi…" value={form.title} maxLength={40} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <input className="input" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} aria-label="Date" />
        <select className="input" value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value as ImportantDate["kind"] })} aria-label="Kind">
          {(Object.keys(KIND_EMOJI) as ImportantDate["kind"][]).map((k) => (
            <option key={k} value={k}>
              {KIND_EMOJI[k]} {k}
            </option>
          ))}
        </select>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 text-xs font-semibold whitespace-nowrap text-ink-soft">
            <input type="checkbox" className="size-4 accent-rose" checked={form.recurring} onChange={(e) => setForm({ ...form, recurring: e.target.checked })} />
            Yearly
          </label>
          <button type="submit" className="btn-primary px-4" disabled={!form.title.trim() || !form.date} aria-label="Add date">
            <CalendarHeart className="size-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
