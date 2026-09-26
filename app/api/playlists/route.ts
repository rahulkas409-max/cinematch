import { SECRET_PLAYLISTS, movieById } from "@/data/movies";
import { getUser } from "@/lib/session";
import { enrich } from "@/lib/tmdb";

export async function GET() {
  const user = await getUser();
  if (!user.premium) {
    // Teaser only: titles, no contents.
    return Response.json({ locked: true, playlists: SECRET_PLAYLISTS.map(({ id, title, emoji }) => ({ id, title, emoji })) });
  }
  const playlists = await Promise.all(
    SECRET_PLAYLISTS.map(async (p) => ({ ...p, movies: await enrich(p.movieIds.map((id) => movieById(id)!).filter(Boolean)) })),
  );
  return Response.json({ locked: false, playlists });
}
