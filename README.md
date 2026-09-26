# 🎬 CineMatch

A playful movie discovery app: pick a vibe, swipe posters, crack emoji riddles, and get
personalised picks across Hollywood, Bollywood and world cinema.

**CineMatch is currently 100% free.** Everyone gets the full watch-deck, secret playlists,
unlimited Mood Match and a watchlist. A ₹9 / 24-hour pass via Razorpay is built in but
switched off; set `ENABLE_PAYWALL=true` to turn it on.

## Quick start

```bash
npm install
npm run dev        # http://localhost:3000
```

Requires **Node ≥ 22.5** (uses the built-in `node:sqlite`; you'll see a harmless
"ExperimentalWarning" in the server log).

If you enable the paywall without Razorpay keys, the app runs in **Sandbox Mode**: a banner
is shown and the ₹9 unlock is simulated, so you can test the payment flow straight away.

## Configuration (`.env.local`)

Copy `.env.example` → `.env.local`:

| Variable | Purpose |
| --- | --- |
| `ENABLE_PAYWALL` | `true` turns the ₹9 paywall on. Default: off, everything free, payment endpoints return 404 |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Razorpay key id (`rzp_test_…` for test mode, `rzp_live_…` for live) |
| `RAZORPAY_KEY_SECRET` | Razorpay key secret (server only) |
| `TMDB_API_KEY` | Optional. TMDB v3 key or v4 read token: real posters, embedded trailers, live ratings, India streaming providers |
| `DATABASE_PATH` | Optional. SQLite file path (default `./.data/cinematch.db`) |

Setting both Razorpay keys turns Sandbox Mode off. After that, simulated unlocks are rejected
by the server.

## How it fits together

```
app/
  page.tsx                          → components/CineMatchApp (intro → quiz → results)
  api/me                            premium status, sandbox flag, free Mood Match quota
  api/deck                          swipe cards + emoji riddles for the chosen vibes
  api/recommend                     scored picks; free users get 3, premium get 24
  api/mood-match                    free-text mood → movies (3/day free, unlimited premium)
  api/playlists, api/watchlist      premium-only content (server-gated)
  api/razorpay/create-order         creates a 900-paise INR order (or a sandbox order)
  api/razorpay/verify-payment       HMAC-SHA256 verification of order_id|payment_id → 24h pass
components/  VibeQuiz, SwipeDeck, EmojiRiddle, RecommendationGrid, Paywall, MoodMatch, SecretVault …
data/movies.ts   52 seed movies (9 genres, 8 vibes) + secret playlists
lib/             recommend.ts (scoring engine), tmdb.ts, db.ts (SQLite), session.ts, sound.ts
```

- **Identity:** anonymous, stored in an httpOnly `cm_uid` cookie. Premium status is kept on the
  server, and locked content is never sent to free users.
- **Payments:** the verify step checks the signature with `timingSafeEqual`, confirms the order
  belongs to the caller and is ₹9 INR, and is idempotent, so a replay won't extend the pass
  a second time.
- **Mood Match** is a keyword/lexicon matcher, not an LLM. You can swap `moodMatch()` in
  `lib/recommend.ts` for an LLM call.
- Seed ratings and streaming platforms are approximate. With `TMDB_API_KEY` set, live TMDB
  values replace them.

## Deploying to Vercel

1. At [vercel.com](https://vercel.com) sign in with GitHub → **Add New… → Project**.
2. Import `cinematch`, leave the defaults, and tap **Deploy**.
3. Every push to `main` redeploys automatically.

On Vercel the SQLite file lives in `/tmp`, which is per-instance and temporary. Saved
watchlists can occasionally reset, and a hosted database fixes that (see below).

## Going to production

- Add a Razorpay **webhook** (`payment.captured`) as a backup to the client-side verify call.
- Swap SQLite for Postgres/Supabase if you deploy to serverless hosting, where the filesystem
  is not persistent.
- Add real accounts (e.g. Supabase Auth) if passes should work across devices.
