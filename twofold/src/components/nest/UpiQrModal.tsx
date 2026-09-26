"use client";

import QRCode from "qrcode";
import { useEffect, useState } from "react";
import { CheckCircle2, ExternalLink, IndianRupee } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { possessive } from "@/lib/couple";
import { inr } from "@/lib/time";

const VPA_RE = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z][a-zA-Z0-9]{2,64}$/;

export function buildUpiUri({ vpa, name, amount, note }: { vpa: string; name: string; amount: number; note: string }) {
  const params = new URLSearchParams({ pa: vpa.trim(), pn: name, am: amount.toFixed(2), cu: "INR", tn: note });
  // UPI apps expect %20 rather than "+" for spaces.
  return `upi://pay?${params.toString().replace(/\+/g, "%20")}`;
}

type Props = {
  open: boolean;
  onClose: () => void;
  payer: string;
  payee: string;
  amount: number;
  vpa: string;
  onVpaChange: (vpa: string) => void;
  onSettled: () => void;
};

/** Generates a scannable UPI QR locally (no payment gateway, no API keys). */
export function UpiQrModal({ open, onClose, payer, payee, amount, vpa, onVpaChange, onSettled }: Props) {
  const [qr, setQr] = useState<string>("");
  const valid = VPA_RE.test(vpa.trim());
  const uri = valid ? buildUpiUri({ vpa, name: payee, amount, note: `TwoFold settle-up from ${payer}` }) : "";

  useEffect(() => {
    let alive = true;
    if (!uri) return;
    QRCode.toDataURL(uri, { width: 520, margin: 1, errorCorrectionLevel: "M", color: { dark: "#1e293b", light: "#ffffff" } })
      .then((d) => alive && setQr(d))
      .catch(() => alive && setQr(""));
    return () => {
      alive = false;
    };
  }, [uri]);

  return (
    <Modal open={open} onClose={onClose} title="Settle up via UPI">
      <p className="text-sm text-ink-soft">
        <b className="text-ink">{payer}</b> pays <b className="text-ink">{payee}</b>
      </p>
      <p className="headline mt-1 flex items-center text-5xl text-rose">{inr(amount)}</p>

      <label className="mt-5 block text-sm font-semibold">
        {possessive(payee)} UPI ID
        <input
          className="input mt-1.5"
          inputMode="email"
          autoCapitalize="none"
          autoCorrect="off"
          placeholder="name@okaxis"
          value={vpa}
          onChange={(e) => onVpaChange(e.target.value)}
        />
      </label>
      {vpa && !valid && <p className="mt-1.5 text-xs text-rose">That doesn&apos;t look like a UPI ID yet (e.g. meera@okicici).</p>}

      <div className="mt-5 grid place-items-center rounded-3xl bg-white p-4">
        {valid && qr ? (
          // eslint-disable-next-line @next/next/no-img-element -- data URL generated locally
          <img src={qr} alt={`UPI QR code to pay ${inr(amount)} to ${payee}`} className="aspect-square w-56" />
        ) : (
          <div className="grid aspect-square w-56 place-items-center rounded-2xl border-2 border-dashed border-line text-center text-sm text-ink-soft">
            <span>
              <IndianRupee className="mx-auto mb-2 size-8 text-ink-soft/40" />
              Enter a UPI ID to
              <br />
              generate the QR
            </span>
          </div>
        )}
        <p className="mt-2 text-xs text-ink-soft">Scan with GPay, PhonePe, Paytm or any UPI app</p>
      </div>

      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        <a href={uri || undefined} aria-disabled={!valid} className={`btn-ghost ${valid ? "" : "pointer-events-none opacity-50"}`}>
          <ExternalLink className="size-4" /> Open UPI app
        </a>
        <button
          type="button"
          className="btn-primary"
          onClick={() => {
            onSettled();
            onClose();
          }}
        >
          <CheckCircle2 className="size-4" /> Mark as settled
        </button>
      </div>
    </Modal>
  );
}
