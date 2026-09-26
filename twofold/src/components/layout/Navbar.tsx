"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { TABS, type TabId } from "@/lib/tabs";
import { sfx } from "@/lib/audio";
import { DailyStreak } from "./DailyStreak";
import { SoundToggle } from "./SoundToggle";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2" aria-label="TwoFold home">
      <span className="relative grid size-10 place-items-center">
        <span className="absolute size-7 -translate-x-1.5 rounded-full bg-rose/85 mix-blend-multiply" />
        <span className="absolute size-7 translate-x-1.5 rounded-full bg-amber/80 mix-blend-multiply" />
      </span>
      <span className="headline text-[22px] leading-none">
        Two<em className="font-medium text-rose italic">Fold</em>
      </span>
    </Link>
  );
}

/** Frosted top bar: logo, flame streak and mute. */
export function TopBar() {
  return (
    <header className="sticky top-0 z-40 px-3 pt-[max(0.6rem,env(safe-area-inset-top))] sm:px-6">
      <div className="glass mx-auto flex max-w-5xl items-center justify-between rounded-full py-1.5 pr-1.5 pl-3">
        <Logo />
        <div className="flex items-center gap-1.5">
          <DailyStreak />
          <SoundToggle />
        </div>
      </div>
    </header>
  );
}

type NavProps = { active: TabId; onChange: (id: TabId) => void };

/**
 * Module navigation. Phones get a thumb-friendly bottom dock that scrolls
 * sideways; tablets and up get a centred pill row under the top bar.
 */
export function Navbar({ active, onChange }: NavProps) {
  const dockRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dockRef.current?.querySelector<HTMLElement>(`[data-tab="${active}"]`)?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [active]);

  const select = (id: TabId) => {
    if (id === active) return;
    sfx.pop();
    onChange(id);
  };

  return (
    <>
      {/* Tablet / desktop */}
      <nav aria-label="Modules" className="sticky top-[4.6rem] z-30 hidden px-6 pt-3 md:block">
        <div className="glass mx-auto flex w-fit max-w-5xl flex-wrap justify-center gap-1 rounded-full p-1.5">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => select(t.id)}
              aria-current={active === t.id ? "page" : undefined}
              className="relative rounded-full px-3.5 py-2 text-[13px] font-semibold whitespace-nowrap transition lg:px-4"
            >
              {active === t.id && (
                <motion.span layoutId="nav-pill-top" className="absolute inset-0 rounded-full bg-ink" transition={{ type: "spring", stiffness: 420, damping: 34 }} />
              )}
              <span className={`relative ${active === t.id ? "text-cream" : "text-ink-soft hover:text-ink"}`}>
                {t.emoji} <span className="lg:hidden">{t.short}</span>
                <span className="hidden lg:inline">{t.label}</span>
              </span>
            </button>
          ))}
        </div>
      </nav>

      {/* Phone dock */}
      <nav aria-label="Modules" className="pb-safe fixed inset-x-0 bottom-0 z-40 px-2 md:hidden">
        <div ref={dockRef} className="glass no-scrollbar mx-auto flex max-w-lg snap-x gap-1 overflow-x-auto rounded-[26px] p-1.5">
          {TABS.map((t) => (
            <button
              key={t.id}
              data-tab={t.id}
              type="button"
              onClick={() => select(t.id)}
              aria-current={active === t.id ? "page" : undefined}
              className="relative flex min-w-[4.4rem] shrink-0 snap-center flex-col items-center gap-0.5 rounded-[20px] px-2 py-2"
            >
              {active === t.id && (
                <motion.span layoutId="nav-pill-dock" className="absolute inset-0 rounded-[20px] bg-ink" transition={{ type: "spring", stiffness: 420, damping: 34 }} />
              )}
              <span className="relative text-xl leading-none">{t.emoji}</span>
              <span className={`relative text-[11px] font-semibold ${active === t.id ? "text-cream" : "text-ink-soft"}`}>{t.short}</span>
            </button>
          ))}
        </div>
      </nav>
    </>
  );
}
