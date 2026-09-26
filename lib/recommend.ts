import { MOVIES, VIBES, type Genre, type Movie } from "@/data/movies";
import type { QuizProfile, RecMovie } from "./types";

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));
const eraPos = (year: number) => clamp(((year - 1970) / (2024 - 1970)) * 100, 0, 100);
const runtimePos = (mins: number) => clamp(((mins - 85) / (175 - 85)) * 100, 0, 100);
const overlap = <T,>(a: readonly T[], b: readonly T[]) => a.filter((x) => b.includes(x)).length;

export function sanitizeProfile(raw: unknown): QuizProfile {
  const p = (raw ?? {}) as Partial<QuizProfile>;
  const ids = new Set(MOVIES.map((m) => m.id));
  const vibeIds = new Set<string>(VIBES.map((v) => v.id));
  const strs = (x: unknown) => (Array.isArray(x) ? x.filter((s): s is string => typeof s === "string") : []);
  const num = (x: unknown, d: number) => (typeof x === "number" && Number.isFinite(x) ? x : d);
  return {
    vibes: strs(p.vibes).filter((v) => vibeIds.has(v)).slice(0, 8) as QuizProfile["vibes"],
    era: clamp(num(p.era, 50), 0, 100),
    runtime: clamp(num(p.runtime, 50), 0, 100),
    liked: strs(p.liked).filter((id) => ids.has(id)).slice(0, 20),
    passed: strs(p.passed).filter((id) => ids.has(id)).slice(0, 20),
    emojiScore: clamp(Math.round(num(p.emojiScore, 0)), 0, 20),
    emojiTotal: clamp(Math.round(num(p.emojiTotal, 0)), 0, 20),
  };
}

/** Scores the whole catalogue against a quiz profile, best first. */
export function recommend(profile: QuizProfile, genre?: Genre | null): RecMovie[] {
  const liked = profile.liked.map((id) => MOVIES.find((m) => m.id === id)!).filter(Boolean);
  const passed = new Set(profile.passed);
  const cinephile = profile.emojiTotal > 0 && profile.emojiScore / profile.emojiTotal >= 0.6;

  const scored = MOVIES.filter((m) => !passed.has(m.id) && (!genre || m.genres.includes(genre))).map((m) => {
    const vibeHits = overlap(m.vibes, profile.vibes);
    const eraFit = 1 - Math.abs(eraPos(m.year) - profile.era) / 100;
    const runFit = 1 - Math.abs(runtimePos(m.runtime) - profile.runtime) / 100;
    const kin = liked
      .filter((l) => l.id !== m.id)
      .map((l) => ({ l, s: overlap(l.genres, m.genres) * 0.6 + overlap(l.vibes, m.vibes) * 0.8 }))
      .sort((a, b) => b.s - a.s)[0];

    let score = vibeHits * 3 + eraFit * 2 + runFit * 1.5 + (kin?.s ?? 0) + m.rating * 0.15;
    if (profile.liked.includes(m.id)) score += 2.5;
    if (m.gem && cinephile) score += 1.5;

    const reasons: string[] = [];
    const vibe = VIBES.find((v) => m.vibes.includes(v.id) && profile.vibes.includes(v.id));
    if (vibe) reasons.push(`${vibe.emoji} ${vibe.label}`);
    if (profile.liked.includes(m.id)) reasons.push("you swiped right");
    else if (kin && kin.s >= 1.4) reasons.push(`because you liked ${kin.l.title}`);
    if (m.gem && cinephile) reasons.push("deep cut for a cinephile");
    if (eraFit > 0.8) reasons.push(m.year < 2000 ? "retro gold" : "fresh pick");
    if (runFit > 0.85) reasons.push(m.runtime < 100 ? "snack-length" : m.runtime > 150 ? "epic runtime" : "just-right length");

    return { m, score, why: reasons.slice(0, 3).join(" · ") || "a crowd-pleaser worth a shot" };
  });

  scored.sort((a, b) => b.score - a.score);
  const top = scored[0]?.score ?? 1;
  return scored.map(({ m, score, why }) => ({
    ...m,
    match: Math.round(clamp(62 + (score / top) * 37, 50, 99)),
    why,
  }));
}

// ---- Mood Match: free-text → vibes/genres keyword matcher ----
const MOOD_LEXICON: Record<string, { vibes?: string[]; genres?: Genre[] }> = {
  sad: { vibes: ["cry"] }, cry: { vibes: ["cry"] }, emotional: { vibes: ["cry"] }, heartbreak: { vibes: ["cry", "butterflies"] },
  lonely: { vibes: ["cry", "cozy"] }, tears: { vibes: ["cry"] }, grief: { vibes: ["cry"] }, nostalgic: { vibes: ["cozy", "cry"] },
  confused: { vibes: ["mind"] }, twist: { vibes: ["mind"] }, puzzle: { vibes: ["mind"] }, think: { vibes: ["mind"] }, smart: { vibes: ["mind"] },
  mind: { vibes: ["mind"] }, weird: { vibes: ["mind"], genres: ["Indie"] }, trippy: { vibes: ["mind"], genres: ["Sci-Fi"] }, space: { genres: ["Sci-Fi"] },
  future: { genres: ["Sci-Fi"] }, robot: { genres: ["Sci-Fi"] }, aliens: { genres: ["Sci-Fi"] },
  happy: { vibes: ["dopamine"] }, hype: { vibes: ["dopamine", "adrenaline"] }, energy: { vibes: ["dopamine", "adrenaline"] }, fun: { vibes: ["dopamine", "laugh"] },
  celebrate: { vibes: ["dopamine"] }, party: { vibes: ["dopamine", "laugh"] }, friends: { vibes: ["laugh", "dopamine"] },
  scary: { vibes: ["spooky"], genres: ["Horror"] }, scared: { vibes: ["spooky"], genres: ["Horror"] }, spooky: { vibes: ["spooky"] }, horror: { genres: ["Horror"] },
  creepy: { vibes: ["spooky"] }, dark: { vibes: ["spooky"], genres: ["Thriller"] }, tense: { genres: ["Thriller"] }, suspense: { genres: ["Thriller"] },
  love: { vibes: ["butterflies"], genres: ["Romance"] }, romantic: { vibes: ["butterflies"], genres: ["Romance"] }, date: { vibes: ["butterflies"] },
  crush: { vibes: ["butterflies"] }, swoon: { vibes: ["butterflies"] }, bored: { vibes: ["adrenaline", "dopamine"] }, action: { genres: ["Action"] },
  angry: { vibes: ["adrenaline"], genres: ["Action"] }, explosions: { genres: ["Action"] }, fight: { genres: ["Action"] }, fast: { vibes: ["adrenaline"] },
  tired: { vibes: ["cozy"] }, cozy: { vibes: ["cozy"] }, rain: { vibes: ["cozy", "cry"] }, chill: { vibes: ["cozy"] }, comfort: { vibes: ["cozy"] },
  sick: { vibes: ["cozy"] }, family: { vibes: ["cozy"], genres: ["Animation"] }, kids: { genres: ["Animation"] }, cartoon: { genres: ["Animation"] }, anime: { genres: ["Animation"] },
  laugh: { vibes: ["laugh"], genres: ["Comedy"] }, funny: { vibes: ["laugh"], genres: ["Comedy"] }, silly: { vibes: ["laugh"] }, stressed: { vibes: ["laugh", "cozy"] },
  indie: { genres: ["Indie"] }, artsy: { genres: ["Indie"] }, short: {}, quick: {}, long: {}, epic: {}, old: {}, classic: {}, retro: {}, new: {}, recent: {},
  bollywood: {}, hindi: {}, indian: {}, desi: {}, korean: {}, japanese: {}, malayalam: {}, telugu: {},
};
const LANG: Record<string, string[]> = {
  bollywood: ["Hindi"], hindi: ["Hindi"], indian: ["Hindi", "Telugu", "Malayalam", "Kannada"], desi: ["Hindi", "Telugu", "Malayalam", "Kannada"],
  korean: ["Korean"], japanese: ["Japanese"], malayalam: ["Malayalam"], telugu: ["Telugu"],
};

export function moodMatch(text: string, limit = 5): RecMovie[] {
  const words = text.toLowerCase().match(/[a-z]+/g) ?? [];
  const vibes: string[] = [];
  const genres: Genre[] = [];
  const langs: string[] = [];
  let runtimeBias = 0;
  let eraBias = 0;
  for (const w of words) {
    const stem = Object.keys(MOOD_LEXICON).find((k) => w === k || (k.length > 3 && w.startsWith(k)));
    if (!stem) continue;
    vibes.push(...(MOOD_LEXICON[stem].vibes ?? []));
    genres.push(...(MOOD_LEXICON[stem].genres ?? []));
    langs.push(...(LANG[stem] ?? []));
    if (stem === "short" || stem === "quick" || stem === "tired") runtimeBias = -1;
    if (stem === "long" || stem === "epic") runtimeBias = 1;
    if (stem === "old" || stem === "classic" || stem === "retro") eraBias = -1;
    if (stem === "new" || stem === "recent") eraBias = 1;
  }

  const scored = MOVIES.map((m) => {
    let s = overlap(m.vibes, vibes as Movie["vibes"]) * 2 + overlap(m.genres, genres) * 1.5 + m.rating * 0.1;
    if (langs.length && langs.includes(m.language)) s += 3;
    if (runtimeBias < 0 && m.runtime <= 105) s += 1.5;
    if (runtimeBias > 0 && m.runtime >= 150) s += 1.5;
    if (eraBias < 0 && m.year < 2000) s += 1.5;
    if (eraBias > 0 && m.year >= 2015) s += 1.5;
    const hay = `${m.title} ${m.tagline}`.toLowerCase();
    s += words.filter((w) => w.length > 3 && hay.includes(w)).length;
    return { m, s };
  }).sort((a, b) => b.s - a.s);

  const top = scored[0]?.s || 1;
  const vibeLabels = VIBES.filter((v) => vibes.includes(v.id)).map((v) => `${v.emoji} ${v.label}`);
  return scored.slice(0, limit).map(({ m, s }) => ({
    ...m,
    match: Math.round(clamp(60 + (s / top) * 39, 50, 99)),
    why: vibeLabels.length ? `reads as ${vibeLabels.slice(0, 2).join(" + ")}` : "a well-loved all-rounder",
  }));
}
