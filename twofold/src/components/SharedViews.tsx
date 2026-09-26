"use client";

import { motion } from "framer-motion";
import { Check, Download, Flame } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ConfirmedTicket } from "@/components/dateask/ConfirmedTicket";
import { DateFlow } from "@/components/dateask/DateFlow";
import { isInvite, isTicket } from "@/components/dateask/types";
import type { FlameSync } from "@/components/layout/DailyStreak";
import { DeckViewer } from "@/components/flashcards/DeckViewer";
import { useStudio, type DeckShare } from "@/components/flashcards/CardStudio";
import { CapsuleCard, useCapsules, type CapsuleShare } from "@/components/horizons/TimeCapsule";
import { BlindMatchPlay, type MatchShare } from "@/components/spark/BlindMatcher";
import { VoucherCard, type VoucherData } from "@/components/spark/DateVoucher";
import { SwipeDeck, type QuirksShare } from "@/components/spark/SwipeDeck";
import { TelepathyPlay, type TelepathyShare } from "@/components/spark/TelepathyGame";
import { useBucket, type BucketShare } from "@/components/weekender/BucketList";
import { BUCKET_CATEGORIES } from "@data/weekender";
import { DATE_IDEAS, QUIRKS, TELEPATHY } from "@data/spark";
import { sfx } from "@/lib/audio";
import { celebrate } from "@/lib/confetti";
import { uid, useStored } from "@/lib/storage";
import { computeStreak, EMPTY_STREAK, markActive, mergePartner, STREAK_KEY, type StreakState } from "@/lib/streak";
import { BrokenLink, Loading, SharedShell, useSharedPayload } from "./SharedShell";

const isObj = (x: unknown): x is Record<string, unknown> => !!x && typeof x === "object";
const isStr = (x: unknown): x is string => typeof x === "string";

function Title({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div className="mb-6 text-center">
      <p className="font-script text-2xl text-rose">{kicker}</p>
      <h1 className="headline text-3xl sm:text-4xl">{title}</h1>
    </div>
  );
}

/** Builds a page component for a payload type: loading → broken link → content. */
function sharedPage<T>(what: string, guard: (x: unknown) => x is T, render: (data: T) => React.ReactNode) {
  return function SharedPage() {
    const { ready, data } = useSharedPayload(guard);
    return <SharedShell>{!ready ? <Loading /> : data ? render(data) : <BrokenLink what={what} />}</SharedShell>;
  };
}

export const InviteView = sharedPage("invitation", isInvite, (invite) => <DateFlow invite={invite} />);

export const TicketView = sharedPage("ticket", isTicket, (t) => (
  <>
    <Title kicker="Boarding now" title={`${t.f} × ${t.t}`} />
    <ConfirmedTicket ticket={t} />
  </>
));

export const QuirksView = sharedPage(
  "quirks",
  (x): x is QuirksShare => isObj(x) && isStr(x.n) && isStr(x.r) && x.r.length === QUIRKS.length,
  (d) => (
    <>
      <Title kicker={`${d.n} swiped ${QUIRKS.length} quirks`} title="Your turn: same or dealbreaker?" />
      <div className="mx-auto max-w-md">
        <SwipeDeck compareWith={d} />
      </div>
    </>
  ),
);

export const TelepathyView = sharedPage(
  "telepathy game",
  (x): x is TelepathyShare =>
    isObj(x) &&
    isStr(x.n) &&
    Array.isArray(x.q) &&
    Array.isArray(x.a) &&
    x.q.length === x.a.length &&
    x.q.length > 0 &&
    x.q.every((id) => TELEPATHY.some((t) => t.id === id)),
  (d) => (
    <>
      <Title kicker="Crush Telepathy" title={`How well do you know ${d.n}?`} />
      <div className="mx-auto max-w-md">
        <TelepathyPlay data={d} />
      </div>
    </>
  ),
);

export const MatchView = sharedPage(
  "matcher",
  (x): x is MatchShare => isObj(x) && isStr(x.n) && Array.isArray(x.p) && x.p.every((i) => Number.isInteger(i) && i >= 0 && i < DATE_IDEAS.length),
  (d) => (
    <>
      <Title kicker="Blind Date Matcher" title="Pick 3. Only mutual matches get revealed." />
      <BlindMatchPlay data={d} />
    </>
  ),
);

function DeckImport({ d }: { d: DeckShare }) {
  const [, setCards] = useStudio();
  const [saved, setSaved] = useState(false);
  const cards = d.c.map(([front, back], i) => ({ id: `shared-${i}`, front, back }));
  return (
    <>
      <Title kicker="A deck made for you" title={d.t} />
      <DeckViewer cards={cards} accent="#588157" deckLabel={d.t} backTitle="The answer" />
      <div className="mt-8 text-center">
        <button
          type="button"
          className="btn-primary"
          disabled={saved}
          onClick={() => {
            sfx.chime();
            setCards((prev) => [...prev, ...d.c.map(([front, back]) => ({ id: uid(), front, back }))]);
            setSaved(true);
          }}
        >
          {saved ? <Check className="size-4" /> : <Download className="size-4" />} {saved ? "Saved to your Card Studio" : "Save to my Card Studio"}
        </button>
      </div>
    </>
  );
}

export const DeckView = sharedPage(
  "deck",
  (x): x is DeckShare => isObj(x) && isStr(x.t) && Array.isArray(x.c) && x.c.length > 0 && x.c.every((p) => Array.isArray(p) && isStr(p[0]) && isStr(p[1])),
  (d) => <DeckImport d={d} />,
);

function FlameMerge({ d }: { d: FlameSync }) {
  const [state, setState] = useStored<StreakState>(STREAK_KEY, EMPTY_STREAK);
  const [merged, setMerged] = useState(false);
  const streak = computeStreak(state);
  return (
    <div className="card mx-auto max-w-md text-center">
      <motion.div animate={{ scale: [1, 1.12, 1] }} transition={{ duration: 1.6, repeat: Infinity }} className="mx-auto grid size-24 place-items-center rounded-full bg-gradient-to-b from-amber-soft to-rose-soft">
        <Flame className="size-12 fill-amber text-rose" />
      </motion.div>
      <h1 className="headline mt-4 text-3xl">{d.n} sent their flame 🔥</h1>
      <p className="mt-2 text-sm text-ink-soft">
        Merge their {d.d.length} active day{d.d.length === 1 ? "" : "s"} so your streak only counts the days you <b>both</b> showed up.
      </p>
      {merged ? (
        <>
          <p className="headline mt-5 text-5xl text-rose">{streak.count}</p>
          <p className="text-sm text-ink-soft">day shared streak</p>
          <p className="mt-3 text-xs text-ink-soft">Now send yours back from the 🔥 button so their streak matches.</p>
        </>
      ) : (
        <button
          type="button"
          className="btn-primary mt-6"
          onClick={() => {
            markActive();
            setState((s) => mergePartner(s, d.d));
            setMerged(true);
            sfx.chime();
            celebrate();
          }}
        >
          <Flame className="size-4" /> Merge our flames
        </button>
      )}
    </div>
  );
}

export const FlameView = sharedPage(
  "flame sync",
  (x): x is FlameSync => isObj(x) && isStr(x.n) && Array.isArray(x.d) && x.d.every((k) => isStr(k) && /^\d{4}-\d{2}-\d{2}$/.test(k)),
  (d) => <FlameMerge d={d} />,
);

export const PassView = sharedPage(
  "voucher",
  (x): x is VoucherData => isObj(x) && isStr(x.a) && isStr(x.b) && typeof x.s === "number" && isStr(x.k),
  (d) => (
    <>
      <Title kicker="You've got a voucher" title="Redeem anytime, with love" />
      <VoucherCard data={d} />
    </>
  ),
);

function BucketImport({ d }: { d: BucketShare }) {
  const [, setItems] = useBucket();
  const [merged, setMerged] = useState(false);
  return (
    <>
      <Title kicker="A shared bucket list" title="Someday, together" />
      <div className="card mx-auto max-w-md">
        {BUCKET_CATEGORIES.map((c) => {
          const items = d.i.filter(([, cat]) => cat === c.id);
          if (!items.length) return null;
          return (
            <div key={c.id} className="mb-4 last:mb-0">
              <p className="mb-2 text-xs font-bold tracking-wider text-ink-soft uppercase">
                {c.emoji} {c.id}
              </p>
              <ul className="grid gap-1.5">
                {items.map(([text, , done]) => (
                  <li key={text} className={`rounded-2xl bg-white/75 px-3 py-2 text-sm ${done ? "text-ink-soft line-through" : ""}`}>
                    {text}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
        <button
          type="button"
          className="btn-primary mt-4 w-full"
          disabled={merged}
          onClick={() => {
            sfx.chime();
            setItems((prev) => {
              const have = new Set(prev.map((p) => `${p.category}|${p.text.toLowerCase()}`));
              const add = d.i
                .filter(([t, cat]) => !have.has(`${cat}|${t.toLowerCase()}`))
                .map(([text, category, done]) => ({ id: uid(), text, category, done: done === 1 }));
              return [...prev, ...add];
            });
            setMerged(true);
          }}
        >
          {merged ? "Merged into your list ✓" : "Merge into my bucket list"}
        </button>
        {merged && (
          <Link href="/#weekender" className="mt-3 block text-center text-sm font-semibold text-rose">
            Open my bucket list →
          </Link>
        )}
      </div>
    </>
  );
}

export const BucketView = sharedPage(
  "bucket list",
  (x): x is BucketShare =>
    isObj(x) && Array.isArray(x.i) && x.i.every((r) => Array.isArray(r) && isStr(r[0]) && BUCKET_CATEGORIES.some((c) => c.id === r[1])),
  (d) => <BucketImport d={d} />,
);

function CapsuleImport({ d }: { d: CapsuleShare }) {
  const [capsules, setCapsules] = useCapsules();
  const already = capsules.some((c) => c.sealed.ct === d.s.ct);
  const capsule = { id: "shared", title: d.t, from: d.f, unlockAt: d.u, sealed: d.s, createdAt: 0 };
  return (
    <>
      <Title kicker={`${d.f} sealed a letter for you`} title="Anniversary Time Capsule" />
      <div className="mx-auto max-w-md">
        <CapsuleCard capsule={capsule} shareable={false} />
        <button
          type="button"
          className="btn-ghost mt-4 w-full"
          disabled={already}
          onClick={() => {
            sfx.pop();
            setCapsules((prev) => [{ ...capsule, id: uid(), createdAt: Date.now() }, ...prev]);
          }}
        >
          {already ? "Saved in your capsules ✓" : "Keep it in my capsules"}
        </button>
      </div>
    </>
  );
}

export const CapsuleView = sharedPage(
  "time capsule",
  (x): x is CapsuleShare =>
    isObj(x) && isStr(x.t) && isStr(x.f) && isStr(x.u) && /^\d{4}-\d{2}-\d{2}$/.test(x.u) && isObj(x.s) && isStr(x.s.ct) && isStr(x.s.iv) && isStr(x.s.salt),
  (d) => <CapsuleImport d={d} />,
);
