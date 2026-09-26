import type { Genre, Movie, VibeId } from "@/data/movies";

export interface QuizProfile {
  vibes: VibeId[];
  /** 0 = retro (70s–90s) … 100 = modern (2010+) */
  era: number;
  /** 0 = snack-length (<90 min) … 100 = epic (>2.5 h) */
  runtime: number;
  liked: string[];
  passed: string[];
  emojiScore: number;
  emojiTotal: number;
}

export type RecMovie = Movie & { match: number; why: string };

export interface RecommendResponse {
  premium: boolean;
  movies: RecMovie[];
  /** How many more matches exist behind the paywall (free users only). */
  lockedCount: number;
  tmdb: boolean;
}

export interface MeResponse {
  /** false = everything is free; hide all paywall UI */
  paywall: boolean;
  premium: boolean;
  premiumUntil: number;
  premiumHoursLeft: number;
  sandbox: boolean;
  razorpayTestMode: boolean;
  razorpayKeyId: string;
  pricePaise: number;
  passHours: number;
  moodMatchesLeft: number | null;
}

export type { Genre };
