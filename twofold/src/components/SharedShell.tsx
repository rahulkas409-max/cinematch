"use client";

import { MotionConfig } from "framer-motion";
import Link from "next/link";
import type { ReactNode } from "react";
import { TopBar } from "@/components/layout/Navbar";
import { Footer } from "@/components/ui/Footer";
import { useHash, useHydrated } from "@/lib/storage";
import { decodeState } from "@/lib/share";

/** Layout for pages opened from a shared link (/invite, /ticket, /match…). */
export function SharedShell({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <TopBar />
      <main className="mx-auto w-full max-w-3xl px-4 pt-8 pb-24 sm:px-6">
        {children}
        <div className="mt-14 text-center">
          <Link href="/" className="btn-ghost">
            ✨ Explore everything on TwoFold, free
          </Link>
        </div>
        <Footer />
      </main>
    </MotionConfig>
  );
}

/** Decodes the URL hash payload and validates it; renders a friendly error for broken links. */
export function useSharedPayload<T>(guard: (x: unknown) => x is T) {
  const hash = useHash();
  const hydrated = useHydrated();
  const data = hash ? decodeState<unknown>(hash) : null;
  return { ready: hydrated, data: data !== null && guard(data) ? data : null };
}

export function BrokenLink({ what }: { what: string }) {
  return (
    <div className="card mx-auto max-w-md text-center">
      <p className="text-5xl">🥲</p>
      <h1 className="headline mt-3 text-2xl">This {what} link looks incomplete</h1>
      <p className="mt-2 text-sm text-ink-soft">It may have been cut off while copying. Ask for the link again, or make your own below.</p>
    </div>
  );
}

export function Loading() {
  return <div className="card mx-auto h-72 max-w-md animate-pulse" />;
}
