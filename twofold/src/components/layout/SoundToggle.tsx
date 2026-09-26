"use client";

import { Volume2, VolumeX } from "lucide-react";
import { MUTE_KEY, setMuted, sfx } from "@/lib/audio";
import { useStored } from "@/lib/storage";

export function SoundToggle() {
  const [muted] = useStored<boolean>(MUTE_KEY, false);
  return (
    <button
      type="button"
      onClick={() => {
        setMuted(!muted);
        if (muted) setTimeout(() => sfx.pop(), 30);
      }}
      aria-pressed={!muted}
      aria-label={muted ? "Turn sounds on" : "Mute sounds"}
      className="glass grid size-11 place-items-center rounded-full text-ink transition active:scale-90"
    >
      {muted ? <VolumeX className="size-[18px] text-ink-soft" /> : <Volume2 className="size-[18px] text-rose" />}
    </button>
  );
}
