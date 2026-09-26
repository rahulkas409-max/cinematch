"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Plus, QrCode, Scale, Trash2 } from "lucide-react";
import { useState } from "react";
import { EXPENSE_CATEGORIES } from "@data/weekender";
import { sfx } from "@/lib/audio";
import { celebrate } from "@/lib/confetti";
import { useCouple } from "@/lib/couple";
import { uid, useHydrated, useStored } from "@/lib/storage";
import { markActive } from "@/lib/streak";
import { inr } from "@/lib/time";
import { UpiQrModal } from "./UpiQrModal";

type Who = "a" | "b";
export type Expense = {
  id: string;
  amount: number;
  paidBy: Who;
  category: string;
  note: string;
  /** half = split 50/50, full = paid entirely on the other's behalf, settle = a settlement transfer. */
  split: "half" | "full" | "settle";
  at: number;
};

/** Positive → B owes A. Negative → A owes B. */
export function balanceOf(expenses: Expense[]) {
  return expenses.reduce((bal, e) => {
    const share = e.split === "half" ? e.amount / 2 : e.amount;
    return bal + (e.paidBy === "a" ? share : -share);
  }, 0);
}

export function ExpenseTracker() {
  const { names } = useCouple();
  const hydrated = useHydrated();
  const [expenses, setExpenses] = useStored<Expense[]>("expenses", []);
  const [upi, setUpi] = useStored<{ a: string; b: string }>("upi", { a: "", b: "" });
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState<Who>("a");
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0].id);
  const [note, setNote] = useState("");
  const [split, setSplit] = useState<"half" | "full">("half");
  const [qrOpen, setQrOpen] = useState(false);

  const balance = hydrated ? balanceOf(expenses) : 0;
  const owed = Math.abs(Math.round(balance * 100) / 100);
  const debtor: Who = balance > 0 ? "b" : "a";
  const creditor: Who = debtor === "a" ? "b" : "a";
  const settled = owed < 1;
  const total = expenses.filter((e) => e.split !== "settle").reduce((s, e) => s + e.amount, 0);
  const nm = (w: Who) => (w === "a" ? names.a : names.b);

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) return;
    sfx.pop();
    markActive();
    setExpenses((prev) => [{ id: uid(), amount: Math.round(value * 100) / 100, paidBy, category, note: note.trim(), split, at: Date.now() }, ...prev]);
    setAmount("");
    setNote("");
  };

  const settle = () => {
    sfx.chime();
    celebrate();
    markActive();
    setExpenses((prev) => [{ id: uid(), amount: owed, paidBy: debtor, category: "settle", note: "Settled up via UPI", split: "settle", at: Date.now() }, ...prev]);
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_1.1fr]">
      {/* Balance hero */}
      <div className="card flex flex-col justify-between bg-gradient-to-br from-ink to-[#334155] text-cream">
        <div className="flex items-center gap-2 text-xs font-bold tracking-[0.18em] text-cream/60 uppercase">
          <Scale className="size-4" /> Fair Share balance
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={settled ? "even" : `${debtor}-${owed}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="my-6">
            {settled ? (
              <>
                <p className="headline text-4xl text-cream">All square ✨</p>
                <p className="mt-1 text-cream/70">Nobody owes anybody. Love that for you.</p>
              </>
            ) : (
              <>
                <p className="text-lg text-cream/80">
                  <b className="text-cream">{nm(debtor)}</b> owes <b className="text-cream">{nm(creditor)}</b>
                </p>
                <p className="headline text-6xl text-[#f8b4a2]">{inr(owed)}</p>
              </>
            )}
          </motion.div>
        </AnimatePresence>
        <div className="flex items-end justify-between gap-3">
          <p className="text-xs text-cream/60">
            Shared spend: <b className="text-cream">{inr(total)}</b>
          </p>
          <button type="button" className="btn bg-rose text-white" disabled={settled} onClick={() => setQrOpen(true)}>
            <QrCode className="size-4" /> Settle via UPI
          </button>
        </div>
      </div>

      {/* Quick entry */}
      <form onSubmit={add} className="card grid gap-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <span className="absolute top-1/2 left-4 -translate-y-1/2 font-semibold text-ink-soft">₹</span>
            <input className="input pl-8 text-lg font-semibold" inputMode="decimal" placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))} aria-label="Amount" />
          </div>
          <button type="submit" className="btn-primary shrink-0" disabled={!(Number(amount) > 0)}>
            <Plus className="size-4" /> Add
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {(["a", "b"] as Who[]).map((w) => (
            <button
              key={w}
              type="button"
              onClick={() => setPaidBy(w)}
              className={`min-h-11 rounded-2xl border-2 text-sm font-semibold transition ${paidBy === w ? "border-rose bg-rose-soft/50" : "border-transparent bg-white/70 text-ink-soft"}`}
            >
              {nm(w)} paid
            </button>
          ))}
        </div>
        <div className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1">
          {EXPENSE_CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategory(c.id)}
              className={`chip shrink-0 ${category === c.id ? "border-ink bg-ink text-cream" : "border-line bg-white/70 text-ink-soft"}`}
            >
              {c.emoji} {c.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input className="input" placeholder="Note (optional)" value={note} maxLength={60} onChange={(e) => setNote(e.target.value)} />
          <select className="input w-auto shrink-0" value={split} onChange={(e) => setSplit(e.target.value as "half" | "full")} aria-label="Split">
            <option value="half">Split 50/50</option>
            <option value="full">For {nm(paidBy === "a" ? "b" : "a")}</option>
          </select>
        </div>
      </form>

      {/* History */}
      <div className="card lg:col-span-2">
        <p className="mb-3 text-sm font-semibold">Recent</p>
        {hydrated && expenses.length === 0 && <p className="py-4 text-center text-sm text-ink-soft">No bills yet. Add your first one above.</p>}
        <ul className="grid gap-2">
          <AnimatePresence initial={false}>
            {expenses.slice(0, 30).map((e) => {
              const cat = EXPENSE_CATEGORIES.find((c) => c.id === e.category);
              return (
                <motion.li key={e.id} layout initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 30 }} className="flex items-center gap-3 rounded-2xl bg-white/75 px-3 py-2.5">
                  <span className="grid size-10 place-items-center rounded-xl bg-cream text-xl">{e.split === "settle" ? "🤝" : cat?.emoji ?? "✨"}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] font-semibold">{e.note || (e.split === "settle" ? "Settle up" : cat?.label)}</span>
                    <span className="text-xs text-ink-soft">
                      {nm(e.paidBy)} paid · {e.split === "half" ? "split 50/50" : e.split === "full" ? `for ${nm(e.paidBy === "a" ? "b" : "a")}` : "settlement"}
                    </span>
                  </span>
                  <span className="font-semibold tabular-nums">{inr(e.amount)}</span>
                  <button
                    type="button"
                    aria-label="Delete"
                    onClick={() => setExpenses((prev) => prev.filter((x) => x.id !== e.id))}
                    className="grid size-9 place-items-center rounded-full text-ink-soft/60 hover:bg-rose-soft/50 hover:text-rose"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      </div>

      <UpiQrModal
        open={qrOpen}
        onClose={() => setQrOpen(false)}
        payer={nm(debtor)}
        payee={nm(creditor)}
        amount={owed}
        vpa={upi[creditor]}
        onVpaChange={(v) => setUpi({ ...upi, [creditor]: v })}
        onSettled={settle}
      />
    </div>
  );
}
