export type Choice = {
  id: string;
  emoji: string;
  title: string;
  blurb: string;
  /** Tailwind gradient classes for the tile art. */
  tint: string;
};

export const MEALS: Choice[] = [
  {
    id: "breakfast",
    emoji: "☕",
    title: "Breakfast / Morning Chai",
    blurb: "Crispy dosas, sunrise chai, or a bakery run",
    tint: "from-amber-100 to-orange-50",
  },
  {
    id: "brunch",
    emoji: "🥞",
    title: "Lazy Weekend Brunch",
    blurb: "Pancakes, specialty coffee, a sunny cafe corner",
    tint: "from-rose-100 to-amber-50",
  },
  {
    id: "dinner",
    emoji: "🍝",
    title: "Dinner Date",
    blurb: "Dim lights, great pasta or biryani, deep conversation",
    tint: "from-orange-100 to-rose-50",
  },
  {
    id: "dessert",
    emoji: "🍨",
    title: "Dessert & Midnight Drive",
    blurb: "Late-night gelato, quiet roads, good music",
    tint: "from-indigo-100 to-rose-50",
  },
];

export const VIBES: Choice[] = [
  {
    id: "cozy",
    emoji: "📚",
    title: "Cozy & Quiet",
    blurb: "A corner cafe with books and slow sips",
    tint: "from-stone-100 to-amber-50",
  },
  {
    id: "lively",
    emoji: "🎳",
    title: "Lively & Fun",
    blurb: "Arcade, bowling, or bustling street food",
    tint: "from-rose-100 to-orange-50",
  },
  {
    id: "scenic",
    emoji: "🌇",
    title: "Scenic & Breezy",
    blurb: "Rooftop sunset or a slow park stroll",
    tint: "from-emerald-50 to-sky-50",
  },
];

export const WINDOWS: Choice[] = [
  { id: "weekend", emoji: "🗓️", title: "This Weekend", blurb: "Can't wait that long anyway", tint: "from-amber-50 to-rose-50" },
  { id: "nextweek", emoji: "⏳", title: "Next Week", blurb: "Something to look forward to", tint: "from-emerald-50 to-amber-50" },
  { id: "surprise", emoji: "🎁", title: "Surprise me", blurb: "You pick the date & time, I'll just show up", tint: "from-rose-100 to-violet-50" },
];

/** Cheeky lines shown each time the "No" / "Maybe" button dodges. */
export const DODGE_CUES: string[] = [
  "Nice try! Coffee is on me 😉",
  "Error 404: 'No' not found. Try clicking Yes",
  "Hmm, that button seems shy today…",
  "Are you sure? The biryani is really good 🍛",
  "Plot twist: this button only says yes",
  "Wrong button, the pretty one is on the left 👀",
  "I'll even let you pick the playlist 🎶",
  "That's a 'maybe'? I'll take it as a yes",
  "Button.exe has stopped working 🙈",
  "Okay but what if… yes?",
];

export const NO_LABELS = ["Maybe…", "Hmm, no?", "Still no?", "Wait…", "Really?", "Okay fine…"];

export const SAMPLE_NOTES = [
  "I've been thinking we're overdue for some good food…",
  "Our playlist deserves a proper outing.",
  "I found a cafe that looks exactly like your vibe.",
  "Let's make a memory this week?",
];

export function findChoice(list: Choice[], id?: string) {
  return list.find((c) => c.id === id);
}
