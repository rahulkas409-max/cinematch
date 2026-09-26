export type PassportField = { key: string; label: string; placeholder: string; emoji: string };

/** Template for the "Meet My Family" passport, one per family member. */
export const PASSPORT_FIELDS: PassportField[] = [
  { key: "tea", label: "Favourite tea / drink", placeholder: "Adrak chai, less sugar", emoji: "☕" },
  { key: "snack", label: "Favourite snack", placeholder: "Kachori from the corner shop", emoji: "🥟" },
  { key: "diet", label: "Dietary needs", placeholder: "Vegetarian, no onion-garlic on Tuesdays", emoji: "🥗" },
  { key: "routine", label: "Daily routine", placeholder: "Morning walk at 6, puja at 7:30", emoji: "🕰️" },
  { key: "comms", label: "Communication style", placeholder: "Prefers morning calls", emoji: "📞" },
  { key: "love", label: "What makes them smile", placeholder: "Old Kishore Kumar songs", emoji: "💛" },
];

export type FamilyMember = { id: string; name: string; relation: string; side: "A" | "B"; fields: Record<string, string> };

export const MEMBER_TEMPLATES: FamilyMember[] = [
  {
    id: "tpl-mom",
    name: "Mom",
    relation: "Mother",
    side: "A",
    fields: { tea: "Masala chai, extra elaichi", snack: "Homemade mathri", diet: "Vegetarian", routine: "Up by 6, evening walk at 7", comms: "Prefers morning calls", love: "Fresh flowers & old songs" },
  },
  {
    id: "tpl-dad",
    name: "Dad",
    relation: "Father",
    side: "A",
    fields: { tea: "Filter coffee, strong", snack: "Roasted peanuts", diet: "Low sugar", routine: "Newspaper with breakfast, nap after lunch", comms: "Prefers WhatsApp messages", love: "Cricket talk" },
  },
];

export type ImportantDate = { id: string; title: string; date: string; kind: "Birthday" | "Anniversary" | "Festival" | "Puja"; recurring: boolean };

export const DEFAULT_DATES: ImportantDate[] = [
  { id: "dt-diwali", title: "Diwali", date: "2026-11-08", kind: "Festival", recurring: false },
  { id: "dt-christmas", title: "Christmas", date: "2026-12-25", kind: "Festival", recurring: true },
  { id: "dt-eid", title: "Eid al-Fitr", date: "2027-03-10", kind: "Festival", recurring: false },
  { id: "dt-holi", title: "Holi", date: "2027-03-22", kind: "Festival", recurring: false },
];

export type Occasion = { id: string; name: string; emoji: string };

/** Occasions rotated between both families in the Holiday Balance Planner. */
export const OCCASIONS: Occasion[] = [
  { id: "diwali", name: "Diwali", emoji: "🪔" },
  { id: "eid", name: "Eid", emoji: "🌙" },
  { id: "christmas", name: "Christmas", emoji: "🎄" },
  { id: "holi", name: "Holi", emoji: "🎨" },
  { id: "newyear", name: "New Year's Eve", emoji: "🎆" },
  { id: "rakhi", name: "Raksha Bandhan", emoji: "🧵" },
  { id: "summer", name: "Summer family visit", emoji: "☀️" },
  { id: "winter", name: "Winter family visit", emoji: "❄️" },
];

/**
 * Fair rotation: occasions alternate each year and the starting family
 * alternates too, so across any two consecutive years both families
 * host every occasion exactly once.
 */
export function rotation(year: number, startWith: "A" | "B", occasions = OCCASIONS) {
  return occasions.map((o, i) => {
    const flip = (i + year) % 2 === 0;
    const host: "A" | "B" = flip ? startWith : startWith === "A" ? "B" : "A";
    return { ...o, host };
  });
}

export type BoundaryGuide = { id: string; title: string; emoji: string; points: string[] };

export const BOUNDARY_GUIDES: BoundaryGuide[] = [
  {
    id: "b1",
    title: "Each partner speaks to their own family",
    emoji: "🗣️",
    points: ["It lands softer from their own child.", "The other partner stays warm and present, not silent."],
  },
  {
    id: "b2",
    title: "Decide together, announce together",
    emoji: "🤝",
    points: ["Hold decisions until you've talked privately.", "'We've decided' beats 'my partner wants'."],
  },
  {
    id: "b3",
    title: "Kind words, clear lines",
    emoji: "🌿",
    points: ["Lead with appreciation, then the request.", "A boundary is about your actions, not controlling theirs."],
  },
  {
    id: "b4",
    title: "Equal love, equal time",
    emoji: "⚖️",
    points: ["Track festival visits so no one feels forgotten.", "Gifts and money transparency for both sides."],
  },
];
