import { movieById } from "@/data/movies";
import { watchlist } from "@/lib/db";
import { getUser } from "@/lib/session";
import { enrich } from "@/lib/tmdb";

const paywalled = () => Response.json({ error: "The secret watchlist is a premium feature." }, { status: 402 });

export async function GET() {
  const user = await getUser();
  if (!user.premium) return paywalled();
  const movies = watchlist.list(user.id).map((id) => movieById(id)).filter((m) => !!m);
  return Response.json({ movies: await enrich(movies) });
}

export async function POST(req: Request) {
  const user = await getUser();
  if (!user.premium) return paywalled();
  const { movieId, action } = await req.json().catch(() => ({}));
  if (typeof movieId !== "string" || !movieById(movieId)) return Response.json({ error: "Unknown movie" }, { status: 400 });
  if (action === "remove") watchlist.remove(user.id, movieId);
  else watchlist.add(user.id, movieId);
  return Response.json({ ids: watchlist.list(user.id) });
}
