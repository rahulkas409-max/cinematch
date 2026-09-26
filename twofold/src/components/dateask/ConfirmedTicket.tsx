"use client";

import { motion } from "framer-motion";
import { Heart, Plane } from "lucide-react";
import { findChoice, MEALS, VIBES, WINDOWS } from "@data/dateask";
import { ShareBar } from "@/components/ui/ShareBar";
import { buildLink } from "@/lib/share";
import { useHydrated } from "@/lib/storage";
import type { TicketData } from "./types";

function ticketCode(t: TicketData) {
  let h = 0;
  for (const ch of `${t.f}|${t.t}|${t.m}|${t.v}|${t.w}`) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h.toString(36).toUpperCase().padStart(6, "X").slice(0, 6);
}

const initials = (name: string) => (name.trim().slice(0, 3) || "???").toUpperCase();

/** Boarding-pass style "Confirmed Date Ticket". */
export function ConfirmedTicket({ ticket, showShare = true }: { ticket: TicketData; showShare?: boolean }) {
  const hydrated = useHydrated();
  const meal = findChoice(MEALS, ticket.m);
  const vibe = findChoice(VIBES, ticket.v);
  const when = findChoice(WINDOWS, ticket.w);
  const code = ticketCode(ticket);
  const url = hydrated ? buildLink("/ticket", ticket) : "";

  return (
    <div className="mx-auto w-full max-w-md">
      <motion.div
        initial={{ opacity: 0, y: 40, rotate: -3 }}
        animate={{ opacity: 1, y: 0, rotate: 0 }}
        transition={{ type: "spring", stiffness: 180, damping: 18 }}
        className="overflow-hidden rounded-[30px] bg-white shadow-lift"
      >
        <div className="relative bg-gradient-to-br from-rose to-[#ef8f6f] px-6 pt-5 pb-7 text-white">
          <div className="flex items-center justify-between text-[11px] font-bold tracking-[0.2em] uppercase opacity-90">
            <span>TwoFold Airways</span>
            <span>Confirmed ✓</span>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div>
              <p className="font-display text-4xl font-semibold">{initials(ticket.f)}</p>
              <p className="max-w-[7rem] truncate text-sm opacity-90">{ticket.f}</p>
            </div>
            <div className="flex flex-1 items-center gap-2 px-3">
              <span className="h-px flex-1 border-t-2 border-dashed border-white/60" />
              <Plane className="size-5" />
              <span className="h-px flex-1 border-t-2 border-dashed border-white/60" />
            </div>
            <div className="text-right">
              <p className="font-display text-4xl font-semibold">{initials(ticket.t)}</p>
              <p className="max-w-[7rem] truncate text-sm opacity-90">{ticket.t}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-4 px-6 pt-5 pb-4">
          <Field label="Mission" value={meal ? `${meal.emoji} ${meal.title}` : "Surprise"} wide />
          <Field label="Vibe" value={vibe ? `${vibe.emoji} ${vibe.title}` : "—"} />
          <Field label="When" value={when ? `${when.emoji} ${when.title}` : "Soon"} />
          <Field label="Seat" value="Right next to you" />
          <Field label="Gate" value="Heart ♥ 01" />
        </div>
        {ticket.n && (
          <p className="mx-6 mb-4 rounded-2xl bg-cream px-4 py-3 font-script text-xl leading-snug text-ink">“{ticket.n}”</p>
        )}

        <div className="relative h-6">
          <span className="absolute top-1/2 -left-3 size-6 -translate-y-1/2 rounded-full bg-cream" />
          <span className="absolute top-1/2 -right-3 size-6 -translate-y-1/2 rounded-full bg-cream" />
          <div className="perforation absolute inset-x-5 top-1/2 h-1 -translate-y-1/2" />
        </div>

        <div className="flex items-center justify-between px-6 pt-3 pb-6">
          <div>
            <p className="text-[10px] font-bold tracking-[0.2em] text-ink-soft uppercase">Booking ref</p>
            <p className="font-mono text-xl font-bold tracking-widest">{code}</p>
          </div>
          <Barcode seed={code} />
        </div>
      </motion.div>

      {showShare && (
        <div className="mt-5">
          <ShareBar
            url={url}
            title="Our date is confirmed!"
            text={`🎟️ It's official! ${ticket.f} × ${ticket.t}: ${meal?.title ?? "a date"}, ${vibe?.title ?? "good vibes"}, ${when?.title ?? "soon"}. Here's our TwoFold date ticket 💌`}
          />
        </div>
      )}
      <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-ink-soft">
        <Heart className="size-3.5 fill-rose text-rose" /> Screenshot it for your Instagram Story
      </p>
    </div>
  );
}

function Field({ label, value, wide }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={wide ? "col-span-2" : ""}>
      <p className="text-[10px] font-bold tracking-[0.2em] text-ink-soft uppercase">{label}</p>
      <p className="mt-0.5 text-[15px] leading-snug font-semibold text-ink">{value}</p>
    </div>
  );
}

function Barcode({ seed }: { seed: string }) {
  const bars = Array.from({ length: 26 }, (_, i) => ((seed.charCodeAt(i % seed.length) * (i + 7)) % 4) + 1);
  return (
    <div aria-hidden className="flex h-12 items-stretch gap-[2px]">
      {bars.map((w, i) => (
        <span key={i} className="bg-ink" style={{ width: w }} />
      ))}
    </div>
  );
}
