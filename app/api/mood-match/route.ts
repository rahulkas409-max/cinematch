import { FREE_MOOD_MATCHES_PER_DAY } from "@/lib/config";
import { moodUsage } from "@/lib/db";
import { moodMatch } from "@/lib/recommend";
import { getUser } from "@/lib/session";
import { enrich } from "@/lib/tmdb";

export async function POST(req: Request) {
  const { text } = await req.json().catch(() => ({ text: "" }));
  if (typeof text !== "string" || !text.trim() || text.length > 300) {
    return Response.json({ error: "Tell us your mood in a few words (max 300 characters)." }, { status: 400 });
  }
  const user = await getUser();
  if (!user.premium) {
    if (moodUsage.get(user.id) >= FREE_MOOD_MATCHES_PER_DAY) {
      return Response.json({ error: "limit", left: 0 }, { status: 402 });
    }
    moodUsage.increment(user.id);
  }
  const left = user.premium ? null : Math.max(0, FREE_MOOD_MATCHES_PER_DAY - moodUsage.get(user.id));
  return Response.json({ movies: await enrich(moodMatch(text)), left });
}
