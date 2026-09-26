"use client";

import { motion } from "framer-motion";
import { Download, Heart } from "lucide-react";
import { useState } from "react";
import { ShareBar } from "@/components/ui/ShareBar";
import { sfx } from "@/lib/audio";
import { sparkle } from "@/lib/confetti";
import { useCouple } from "@/lib/couple";
import { buildLink } from "@/lib/share";
import { useHydrated } from "@/lib/storage";

export const VOUCHER_KINDS = [
  { id: "chai", title: "Chai Date", line: "Good for one cutting chai & endless talk", emoji: "☕" },
  { id: "movie", title: "Movie Night", line: "Good for one movie, your pick, my popcorn", emoji: "🍿" },
  { id: "dinner", title: "Dinner on Me", line: "Good for one candle-lit dinner", emoji: "🍝" },
  { id: "drive", title: "Midnight Drive", line: "Good for one drive & a shared playlist", emoji: "🚗" },
] as const;

export type VoucherData = { a: string; b: string; s: number; k: string };

export function VoucherCard({ data, id }: { data: VoucherData; id?: string }) {
  const kind = VOUCHER_KINDS.find((k) => k.id === data.k) ?? VOUCHER_KINDS[0];
  return (
    <div id={id} className="relative mx-auto aspect-[1.7] w-full max-w-md overflow-hidden rounded-[28px] bg-gradient-to-br from-[#fde7dc] via-[#fbeede] to-[#f3e1c6] p-5 shadow-lift sm:p-6">
      <div className="absolute -top-10 -right-10 size-40 rounded-full bg-rose/20 blur-2xl" />
      <div className="absolute -bottom-12 -left-8 size-40 rounded-full bg-sage/20 blur-2xl" />
      <div className="relative flex h-full">
        <div className="flex flex-1 flex-col justify-between">
          <div>
            <p className="text-[10px] font-bold tracking-[0.25em] text-rose uppercase">TwoFold · Voucher</p>
            <p className="headline mt-1 text-3xl leading-none sm:text-4xl">
              {kind.emoji} {kind.title}
            </p>
            <p className="mt-2 font-script text-xl leading-tight text-ink-soft">{kind.line}</p>
          </div>
          <p className="text-sm font-semibold">
            {data.a || "You"} <Heart className="inline size-3.5 fill-rose text-rose" /> {data.b || "Partner"}
          </p>
        </div>
        <div className="ml-3 flex w-24 flex-col items-center justify-center border-l-2 border-dashed border-rose/30 pl-3 text-center">
          <p className="text-[10px] font-bold tracking-widest text-ink-soft uppercase">Match</p>
          <p className="headline text-4xl text-rose">{data.s}%</p>
          <p className="text-[10px] text-ink-soft">No expiry</p>
        </div>
      </div>
    </div>
  );
}

/** Paint the voucher on a canvas so it downloads as a crisp PNG (no screenshot libs). */
async function renderPng(data: VoucherData) {
  const kind = VOUCHER_KINDS.find((k) => k.id === data.k) ?? VOUCHER_KINDS[0];
  await document.fonts.ready;
  const css = getComputedStyle(document.documentElement);
  const serif = css.getPropertyValue("--font-fraunces").trim() || "Georgia, serif";
  const sans = css.getPropertyValue("--font-jakarta").trim() || "system-ui, sans-serif";
  const script = css.getPropertyValue("--font-caveat").trim() || "cursive";

  const W = 1080;
  const H = 640;
  const cv = document.createElement("canvas");
  cv.width = W;
  cv.height = H;
  const g = cv.getContext("2d")!;

  const bg = g.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#fde7dc");
  bg.addColorStop(0.5, "#fbeede");
  bg.addColorStop(1, "#f3e1c6");
  g.fillStyle = bg;
  g.beginPath();
  g.roundRect(0, 0, W, H, 56);
  g.fill();

  const blob = (x: number, y: number, r: number, c: string) => {
    const rg = g.createRadialGradient(x, y, 0, x, y, r);
    rg.addColorStop(0, c);
    rg.addColorStop(1, "transparent");
    g.fillStyle = rg;
    g.fillRect(0, 0, W, H);
  };
  blob(W - 60, 40, 260, "rgba(224,109,83,0.25)");
  blob(60, H - 20, 260, "rgba(88,129,87,0.22)");

  g.fillStyle = "#e06d53";
  g.font = `700 22px ${sans}`;
  g.fillText("TWOFOLD · VOUCHER", 64, 96);

  g.fillStyle = "#1e293b";
  g.font = `600 76px ${serif}`;
  g.fillText(`${kind.emoji} ${kind.title}`, 60, 196);

  g.fillStyle = "#475569";
  g.font = `500 46px ${script}`;
  g.fillText(kind.line, 64, 270);

  g.fillStyle = "#1e293b";
  g.font = `700 34px ${sans}`;
  g.fillText(`${data.a || "You"}  ♥  ${data.b || "Partner"}`, 64, H - 72);

  g.strokeStyle = "rgba(224,109,83,0.4)";
  g.setLineDash([12, 12]);
  g.lineWidth = 4;
  g.beginPath();
  g.moveTo(W - 280, 60);
  g.lineTo(W - 280, H - 60);
  g.stroke();

  g.textAlign = "center";
  g.fillStyle = "#475569";
  g.font = `700 22px ${sans}`;
  g.fillText("MATCH", W - 140, H / 2 - 70);
  g.fillStyle = "#e06d53";
  g.font = `600 110px ${serif}`;
  g.fillText(`${data.s}%`, W - 140, H / 2 + 40);
  g.fillStyle = "#475569";
  g.font = `500 22px ${sans}`;
  g.fillText("No expiry", W - 140, H / 2 + 90);

  return cv.toDataURL("image/png");
}

export function DateVoucher() {
  const { names } = useCouple();
  const hydrated = useHydrated();
  const [kind, setKind] = useState<string>("chai");
  const [score, setScore] = useState(92);
  const data: VoucherData = { a: names.a, b: names.b, s: score, k: kind };
  const url = hydrated ? buildLink("/pass", data) : "";

  const download = async (e: React.MouseEvent) => {
    sfx.chime();
    sparkle(e.clientX / window.innerWidth, e.clientY / window.innerHeight);
    const png = await renderPng(data);
    const a = document.createElement("a");
    a.href = png;
    a.download = `twofold-${kind}-voucher.png`;
    a.click();
  };

  return (
    <div className="card grid gap-5 lg:grid-cols-[1fr_1.1fr] lg:items-center">
      <div className="grid gap-4">
        <div className="flex flex-wrap gap-2">
          {VOUCHER_KINDS.map((k) => (
            <button
              key={k.id}
              type="button"
              onClick={() => {
                sfx.pop();
                setKind(k.id);
              }}
              className={`chip ${kind === k.id ? "border-ink bg-ink text-cream" : "border-line bg-white/70 text-ink-soft"}`}
            >
              {k.emoji} {k.title}
            </button>
          ))}
        </div>
        <label className="text-sm font-semibold">
          Compatibility score: <span className="text-rose">{score}%</span>
          <input type="range" min={0} max={100} value={score} onChange={(e) => setScore(Number(e.target.value))} className="mt-2 w-full accent-rose" />
        </label>
        <p className="text-xs text-ink-soft">Names come from your flame profile (tap the 🔥 up top to edit).</p>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn-dark" onClick={download}>
            <Download className="size-4" /> Download PNG
          </button>
        </div>
        <ShareBar compact url={url} text={`🎟️ A ${VOUCHER_KINDS.find((k) => k.id === kind)?.title} voucher, just for you. Redeem anytime 💌`} />
      </div>
      <motion.div key={kind} initial={{ rotate: -4, scale: 0.94, opacity: 0 }} animate={{ rotate: 0, scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 220, damping: 18 }}>
        <VoucherCard data={data} />
      </motion.div>
    </div>
  );
}
