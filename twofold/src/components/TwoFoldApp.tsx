"use client";

import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import { useCallback } from "react";
import { DateAskTab } from "@/components/dateask/DateAskTab";
import { KinfolkTab } from "@/components/family/KinfolkTab";
import { FlashcardHub } from "@/components/flashcards/FlashcardHub";
import { HorizonsTab } from "@/components/horizons/HorizonsTab";
import { Navbar, TopBar } from "@/components/layout/Navbar";
import { NestTab } from "@/components/nest/NestTab";
import { SparkTab } from "@/components/spark/SparkTab";
import { Footer } from "@/components/ui/Footer";
import { WeekenderTab } from "@/components/weekender/WeekenderTab";
import { useHash } from "@/lib/storage";
import { isTab, TABS, type TabId } from "@/lib/tabs";

const VIEWS: Record<TabId, () => React.ReactNode> = {
  "date-ask": () => <DateAskTab />,
  spark: () => <SparkTab />,
  weekender: () => <WeekenderTab />,
  nest: () => <NestTab />,
  kinfolk: () => <KinfolkTab />,
  flashcards: () => <FlashcardHub />,
  horizons: () => <HorizonsTab />,
};

/** The single-page shell. The active tab lives in the URL hash (#spark, #nest…) so tabs are linkable. */
export function TwoFoldApp() {
  const hash = useHash();
  const active: TabId = isTab(hash) ? hash : TABS[0].id;

  const change = useCallback((id: TabId) => {
    history.replaceState(null, "", `#${id}`);
    window.dispatchEvent(new HashChangeEvent("hashchange"));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <TopBar />
      <Navbar active={active} onChange={change} />
      <main className="mx-auto w-full max-w-5xl px-4 pt-6 pb-36 sm:px-6 md:pt-10 md:pb-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            {VIEWS[active]()}
          </motion.div>
        </AnimatePresence>
        <Footer />
      </main>
    </MotionConfig>
  );
}
