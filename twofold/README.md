# 💞 TwoFold

A free, mobile-first relationship space for couples and crushes: interactive date invites, deep-talk
flashcards, games, shared money tools, family harmony and future planning.

**100% free:** no accounts, no paywalls, no API keys, no database. Everything is saved in your
browser (localStorage), and anything you share travels inside the link itself (base64 in the URL hash).

## Quick start

```bash
cd twofold
npm install
npm run dev        # http://localhost:3000
```

Production: `npm run build && npm start`. Every route is static, so it deploys anywhere
(on Vercel, set the project's **Root Directory** to `twofold`).

## Modules

| Tab | What's inside |
| --- | --- |
| 💌 **The Date Ask** | Invite creator → `/invite#…` walkthrough (meal, vibe, timing) → pulsing YES / dodging "No" → boarding-pass **Date Ticket** (`/ticket#…`) |
| ✨ **Spark** | Quirks swipe deck (right / left / down, with compatibility via `/quirks#…`), 5-round **Crush Telepathy** with a 10 s timer (`/telepathy#…`), **Blind Date Matcher** (pass-the-phone or `/match#…`), downloadable PNG **voucher** (`/pass#…`) |
| 🎡 **Weekender** | **Daily Vibe Drop** (new prompt at 9:00 AM, blur-to-reveal, countdown), physics **Date Roulette** with 4 filters and per-peg ticks, **Bucket List** (Movies / Cafes / Road Trips, mergeable via `/bucket#…`) |
| 🏡 **Nest & Money** | **Fair Share** ledger (50/50 or on-behalf, "A owes B ₹340"), **UPI QR** settle-up (`upi://pay?pa=…&am=…`, generated locally), **Chore Harmony** board with a balance meter |
| 🪔 **Kinfolk & Family** | **Family Passports** (teas, snacks, diets, routines, communication preferences), important-date countdown cards, **Festival & Holiday Balance** rotation, **In-Law Respect** flip cards, boundary guide |
| 💭 **Flashcards Hub** | 3D spring-flip decks: Intimacy (20), Parenting (15), Golden Years (15), Family (12), plus the **Custom Card Studio** (shareable via `/deck#…`) |
| 🌅 **Horizons** | **Parenting Alignment Matrix** with discussion cues, **Golden Years** timeline, **Anniversary Time Capsule** (AES-256-GCM in the browser, opens only on the unlock date with the passphrase; `/capsule#…`) |

**Shared Flame Streak** (🔥 in the top bar): every flip, swipe, spin or answer marks today as
active. Tap the flame to send a sync link (`/flame#…`). Once your partner's days are merged, only
days you *both* showed up count.

**Sound** (🔊 in the top bar): Web Audio synthesis only (pop, flip whoosh, roulette tick, swipe,
chime). No audio files.

## Structure

```
twofold/
├── data/                 # seed content: dateask, spark, flashcards, family, dailyprompts, weekender, horizons
└── src/
    ├── app/              # "/" (tabbed app) + share routes: invite, ticket, quirks, telepathy, match, deck, flame, pass, bucket, capsule
    ├── components/
    │   ├── layout/       # Navbar, DailyStreak, SoundToggle
    │   ├── dateask/      # InviteCreator, DateFlow, MealSelector, VibeSelector, ConfirmedTicket
    │   ├── spark/        # SwipeDeck, TelepathyGame, BlindMatcher, DateVoucher
    │   ├── weekender/    # RouletteWheel, BucketList, DailyVibeDrop
    │   ├── nest/         # ExpenseTracker, UpiQrModal, ChoreBoard
    │   ├── family/       # FamilyPassport, HolidayPlanner
    │   ├── flashcards/   # FlashcardHub, FlipCard, DeckViewer, CardStudio
    │   ├── horizons/     # ParentingQuiz, AgingTimeline, TimeCapsule
    │   └── ui/           # Modal, ShareBar, Section, Backdrop, Footer
    └── lib/              # audio, storage, share (URL encoding), streak, crypto, confetti, time, couple, tabs
```

## Design

Warm editorial cream `#faf7f5`, terracotta rose `#e06d53`, amber `#d97706`, forest sage `#588157`
and slate `#1e293b`, with frosted glass cards and soft drifting colour blobs. Type is **Fraunces**
(soft, wonky display serif), **Plus Jakarta Sans** (UI) and **Caveat** (handwritten accents).
Everything respects `prefers-reduced-motion`.

Stack: Next.js 16 (App Router, TypeScript), Tailwind CSS v4, Framer Motion, Lucide, canvas-confetti, qrcode.
