import { MOVIES } from "@/data/movies";
import { sanitizeProfile } from "@/lib/recommend";
import { enrich } from "@/lib/tmdb";

// Candidate cards for the quiz: a swipe deck biased toward the chosen vibes, and
// emoji riddles with multiple-choice options.
export async function POST(req: Request) {
  const { vibes } = sanitizeProfile(await req.json().catch(() => ({})));
  const shuffle = <T,>(a: T[]) => a.map((x) => [Math.random(), x] as const).sort((p, q) => p[0] - q[0]).map(([, x]) => x);

  const onVibe = shuffle(MOVIES.filter((m) => m.vibes.some((v) => vibes.includes(v))));
  const offVibe = shuffle(MOVIES.filter((m) => !onVibe.includes(m)));
  const swipe = shuffle([...onVibe.slice(0, 5), ...offVibe.slice(0, onVibe.length ? 2 : 7)]).slice(0, 7);

  const riddles = shuffle(MOVIES.filter((m) => !swipe.includes(m)))
    .slice(0, 5)
    .map((answer) => {
      const decoys = shuffle(MOVIES.filter((m) => m.id !== answer.id)).slice(0, 3);
      return {
        emoji: answer.emoji,
        answerId: answer.id,
        options: shuffle([answer, ...decoys]).map((m) => ({ id: m.id, title: m.title, year: m.year })),
      };
    });

  return Response.json({ swipe: await enrich(swipe), riddles });
}
