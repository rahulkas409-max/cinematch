export type AlignmentQuestion = {
  id: string;
  topic: string;
  left: string;
  right: string;
  /** Discussion cue shown when answers are far apart. */
  cue: string;
};

/** Each partner places themselves on a 1–5 scale between two poles. */
export const ALIGNMENT: AlignmentQuestion[] = [
  { id: "a1", topic: "Screen time", left: "Strict limits", right: "Flexible & trust-based", cue: "Try a trial rule for a month, then review it together." },
  { id: "a2", topic: "Discipline", left: "Clear consequences", right: "Gentle guidance", cue: "Agree on 2–3 non-negotiables; everything else can be gentle." },
  { id: "a3", topic: "Schooling", left: "Academics first", right: "Play & creativity first", cue: "Visit schools together and list what each of you noticed." },
  { id: "a4", topic: "Pocket money", left: "Earned by chores", right: "Given freely", cue: "Split it: a base amount plus a bonus for extra help." },
  { id: "a5", topic: "Grandparents' role", left: "Hands-on daily", right: "Loving but occasional", cue: "Talk about what support you actually need, not what's expected." },
  { id: "a6", topic: "Faith & culture", left: "One clear tradition", right: "Let them explore", cue: "Pick festivals you'll both always celebrate, then stay curious." },
  { id: "a7", topic: "Career pressure", left: "Aim high, push hard", right: "Follow their joy", cue: "Share what your own parents expected and how it felt." },
  { id: "a8", topic: "Household roles", left: "Traditional split", right: "Fully shared", cue: "List every weekly task and claim them; revisit monthly." },
];

export type Milestone = { id: string; age: number; title: string; emoji: string; kind: "travel" | "dream" | "health" | "home" | "money" };

export const MILESTONE_KINDS: { id: Milestone["kind"]; label: string; color: string }[] = [
  { id: "travel", label: "Travel", color: "#e06d53" },
  { id: "dream", label: "Dream", color: "#d97706" },
  { id: "health", label: "Health", color: "#588157" },
  { id: "home", label: "Home", color: "#7c6f64" },
  { id: "money", label: "Money", color: "#1e293b" },
];

export const MILESTONE_SEED: Milestone[] = [
  { id: "m1", age: 35, title: "Emergency fund: 6 months", emoji: "🛟", kind: "money" },
  { id: "m2", age: 40, title: "Trek to a Himalayan base camp", emoji: "🏔️", kind: "travel" },
  { id: "m3", age: 45, title: "Annual joint health check-ups", emoji: "🩺", kind: "health" },
  { id: "m4", age: 50, title: "Silver jubilee trip to Japan", emoji: "🌸", kind: "travel" },
  { id: "m5", age: 55, title: "Open a tiny bookstore cafe", emoji: "📚", kind: "dream" },
  { id: "m6", age: 60, title: "Move to a home by the coast", emoji: "🌊", kind: "home" },
  { id: "m7", age: 65, title: "Learn classical music together", emoji: "🎶", kind: "dream" },
];
