export const TABS = [
  { id: "date-ask", label: "The Date Ask", short: "Date Ask", emoji: "💌" },
  { id: "spark", label: "Spark", short: "Spark", emoji: "✨" },
  { id: "weekender", label: "Weekender", short: "Weekend", emoji: "🎡" },
  { id: "nest", label: "Nest & Money", short: "Nest", emoji: "🏡" },
  { id: "kinfolk", label: "Kinfolk & Family", short: "Family", emoji: "🪔" },
  { id: "flashcards", label: "Flashcards Hub", short: "Cards", emoji: "💭" },
  { id: "horizons", label: "Horizons", short: "Horizons", emoji: "🌅" },
] as const;

export type TabId = (typeof TABS)[number]["id"];

export function isTab(id: string): id is TabId {
  return TABS.some((t) => t.id === id);
}
