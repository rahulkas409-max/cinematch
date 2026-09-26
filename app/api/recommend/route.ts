import { GENRES, type Genre } from "@/data/movies";
import { FREE_RECS } from "@/lib/config";
import { quizResults } from "@/lib/db";
import { recommend, sanitizeProfile } from "@/lib/recommend";
import { getUser } from "@/lib/session";
import { enrich, tmdbEnabled } from "@/lib/tmdb";
import type { RecommendResponse } from "@/lib/types";

const PREMIUM_DECK = 24;

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const profile = sanitizeProfile(body.profile);
  const genre = GENRES.includes(body.genre) ? (body.genre as Genre) : null;
  const user = await getUser();

  if (body.save) quizResults.save(user.id, profile, profile.emojiScore);

  const all = recommend(profile, genre);
  const cap = user.premium ? PREMIUM_DECK : FREE_RECS;
  // Free users only ever receive the first 3 — the rest stay on the server.
  const res: RecommendResponse = {
    premium: user.premium,
    movies: await enrich(all.slice(0, cap)),
    lockedCount: user.premium ? 0 : Math.max(0, Math.min(all.length, PREMIUM_DECK) - FREE_RECS),
    tmdb: tmdbEnabled(),
  };
  return Response.json(res);
}
