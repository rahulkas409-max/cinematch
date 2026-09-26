import "server-only";
import type { Movie, Platform } from "@/data/movies";

// Optional TMDB enrichment: real posters, YouTube trailer keys, live ratings and
// Indian streaming providers. Accepts either a v3 API key or a v4 read token.
const key = () => process.env.TMDB_API_KEY?.trim() || "";
export const tmdbEnabled = () => !!key();

type Enrichment = Pick<Movie, "posterUrl" | "trailerKey" | "tmdbId"> & { rating?: number; platforms?: Platform[] };
const cache = new Map<string, Promise<Enrichment>>();

const PROVIDER_MAP: Record<string, Platform> = {
  Netflix: "Netflix",
  "Amazon Prime Video": "Prime Video",
  "Amazon Prime Video with Ads": "Prime Video",
  Hotstar: "JioHotstar",
  JioHotstar: "JioHotstar",
  "Jio Hotstar": "JioHotstar",
  "Apple TV Plus": "Apple TV+",
  "Apple TV+": "Apple TV+",
  Zee5: "Zee5",
  "Sony Liv": "SonyLIV",
  SonyLIV: "SonyLIV",
};

async function tmdb<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const k = key();
  const bearer = k.length > 40; // v4 read access tokens are long JWTs
  const url = new URL(`https://api.themoviedb.org/3${path}`);
  for (const [p, v] of Object.entries(params)) url.searchParams.set(p, v);
  if (!bearer) url.searchParams.set("api_key", k);
  const res = await fetch(url, {
    headers: bearer ? { Authorization: `Bearer ${k}` } : undefined,
    signal: AbortSignal.timeout(5000),
    next: { revalidate: 86400 },
  });
  if (!res.ok) throw new Error(`TMDB ${res.status} for ${path}`);
  return res.json() as Promise<T>;
}

type ProviderResponse = { results: Record<string, { flatrate?: { provider_name: string }[] }> };

async function fetchEnrichment(movie: Movie): Promise<Enrichment> {
  const search = await tmdb<{ results: { id: number; poster_path: string | null; vote_average: number }[] }>(
    "/search/movie",
    { query: movie.title, year: String(movie.year) },
  );
  const hit = search.results[0];
  if (!hit) return {};
  const [videos, providers] = await Promise.all([
    tmdb<{ results: { site: string; type: string; key: string; official: boolean }[] }>(`/movie/${hit.id}/videos`).catch(
      () => ({ results: [] }),
    ),
    tmdb<ProviderResponse>(`/movie/${hit.id}/watch/providers`).catch((): ProviderResponse => ({ results: {} })),
  ]);
  const yt = videos.results.filter((v) => v.site === "YouTube");
  const trailer = yt.find((v) => v.type === "Trailer" && v.official) ?? yt.find((v) => v.type === "Trailer") ?? yt[0];
  const platforms = [
    ...new Set(
      (providers.results.IN?.flatrate ?? []).map((p) => PROVIDER_MAP[p.provider_name]).filter((p): p is Platform => !!p),
    ),
  ];
  return {
    tmdbId: hit.id,
    posterUrl: hit.poster_path ? `https://image.tmdb.org/t/p/w500${hit.poster_path}` : undefined,
    trailerKey: trailer?.key,
    rating: hit.vote_average ? Math.round(hit.vote_average * 10) / 10 : undefined,
    platforms: providers.results.IN ? platforms : undefined,
  };
}

/** Enriches movies with TMDB data when a key is configured; otherwise a no-op. Never throws. */
export async function enrich<T extends Movie>(movies: T[]): Promise<T[]> {
  if (!tmdbEnabled()) return movies;
  return Promise.all(
    movies.map(async (m) => {
      let p = cache.get(m.id);
      if (!p) {
        p = fetchEnrichment(m).catch((err) => {
          console.warn("[tmdb]", m.title, err instanceof Error ? err.message : err);
          cache.delete(m.id);
          return {};
        });
        cache.set(m.id, p);
      }
      const e = await p;
      return {
        ...m,
        tmdbId: e.tmdbId ?? m.tmdbId,
        posterUrl: e.posterUrl ?? m.posterUrl,
        trailerKey: e.trailerKey ?? m.trailerKey,
        rating: e.rating ?? m.rating,
        platforms: e.platforms ?? m.platforms,
      };
    }),
  );
}
