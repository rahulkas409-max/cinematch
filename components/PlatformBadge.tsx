import type { Platform } from "@/data/movies";

const STYLE: Record<Platform, string> = {
  Netflix: "bg-[#e50914] text-white",
  "Prime Video": "bg-[#00a8e1] text-white",
  JioHotstar: "bg-[#1f1fb8] text-white",
  "Apple TV+": "bg-white text-black",
  Zee5: "bg-[#8230c6] text-white",
  SonyLIV: "bg-black text-white border border-white/30",
};

export function PlatformBadge({ platform }: { platform: Platform }) {
  return <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold tracking-wide ${STYLE[platform]}`}>{platform}</span>;
}
