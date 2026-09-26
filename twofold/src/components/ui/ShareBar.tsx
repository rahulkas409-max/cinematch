"use client";

import { useState } from "react";
import { Check, Copy, MessageCircle, Share2 } from "lucide-react";
import { copyText, nativeShare, whatsappUrl } from "@/lib/share";
import { sfx } from "@/lib/audio";

type Props = { url: string; text: string; title?: string; compact?: boolean };

/** WhatsApp / native share sheet (Instagram Stories etc.) / copy link. */
export function ShareBar({ url, text, title = "TwoFold", compact }: Props) {
  const [copied, setCopied] = useState(false);

  const flashCopied = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className={`flex flex-wrap gap-2 ${compact ? "" : "justify-center"}`}>
      <a
        href={whatsappUrl(`${text}\n${url}`)}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => sfx.pop()}
        className="btn bg-[#25D366] text-white shadow-[0_10px_24px_-12px_rgb(37_211_102/0.9)] hover:brightness-95"
      >
        <MessageCircle className="size-4" /> WhatsApp
      </a>
      <button
        type="button"
        className="btn-ghost"
        onClick={async () => {
          sfx.pop();
          const r = await nativeShare({ title, text, url });
          if (r === "copied") flashCopied();
        }}
      >
        <Share2 className="size-4" /> Share
      </button>
      <button
        type="button"
        className="btn-ghost"
        onClick={async () => {
          sfx.pop();
          if (await copyText(url)) flashCopied();
        }}
      >
        {copied ? <Check className="size-4 text-sage" /> : <Copy className="size-4" />}
        {copied ? "Copied!" : "Copy link"}
      </button>
    </div>
  );
}
