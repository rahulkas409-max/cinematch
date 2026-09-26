export type RouletteFilter = "cozy" | "foodie" | "midnight" | "outdoor";

export const ROULETTE_FILTERS: { id: RouletteFilter; label: string; emoji: string }[] = [
  { id: "cozy", label: "Quick & Cozy (<₹300)", emoji: "🧸" },
  { id: "foodie", label: "Foodie Trail", emoji: "🍜" },
  { id: "midnight", label: "Midnight Drive", emoji: "🌙" },
  { id: "outdoor", label: "Outdoor Adventure", emoji: "🥾" },
];

export const ROULETTE_IDEAS: Record<RouletteFilter, string[]> = {
  cozy: ["Chai & bun maska", "Blanket fort movie", "Board game night", "Cook Maggi together", "Library afternoon", "Face-mask spa night", "Sunset terrace chai", "Old photo album night"],
  foodie: ["Golgappa challenge", "Momo tasting tour", "Biryani showdown", "South Indian breakfast", "Dessert-only dinner", "New cuisine roulette", "Chaat street crawl", "Midnight parantha"],
  midnight: ["Highway dhaba chai", "City lights viewpoint", "Late-night ice cream", "Empty-road playlist", "Airport runway watch", "24h cafe hop", "Sea-face walk", "Stargazing pull-over"],
  outdoor: ["Sunrise trek", "Lake kayaking", "Botanical garden", "Cycling trail", "Waterfall day trip", "Farm picnic", "Rock climbing wall", "Heritage walk"],
};

export type BucketCategory = "Movies" | "Cafes" | "Road Trips";

export const BUCKET_CATEGORIES: { id: BucketCategory; emoji: string }[] = [
  { id: "Movies", emoji: "🎬" },
  { id: "Cafes", emoji: "☕" },
  { id: "Road Trips", emoji: "🚗" },
];

export const BUCKET_SEED: { text: string; category: BucketCategory }[] = [
  { text: "Watch Dilwale Dulhania Le Jayenge together", category: "Movies" },
  { text: "Studio Ghibli marathon", category: "Movies" },
  { text: "That new rooftop cafe everyone talks about", category: "Cafes" },
  { text: "Find the best filter coffee in town", category: "Cafes" },
  { text: "Mumbai → Goa coastal drive", category: "Road Trips" },
  { text: "Weekend trip to the nearest hills", category: "Road Trips" },
];

export const CHORES = [
  { id: "dishes", title: "Dishes", emoji: "🍽️" },
  { id: "laundry", title: "Laundry", emoji: "🧺" },
  { id: "groceries", title: "Groceries", emoji: "🛒" },
  { id: "plants", title: "Water plants", emoji: "🪴" },
  { id: "trash", title: "Take out trash", emoji: "🗑️" },
  { id: "cook", title: "Cook dinner", emoji: "🍲" },
  { id: "bills", title: "Pay bills", emoji: "🧾" },
  { id: "tidy", title: "Tidy living room", emoji: "🛋️" },
];

export const EXPENSE_CATEGORIES = [
  { id: "food", label: "Food", emoji: "🍕" },
  { id: "groceries", label: "Groceries", emoji: "🛒" },
  { id: "rent", label: "Rent", emoji: "🏠" },
  { id: "bills", label: "Bills", emoji: "💡" },
  { id: "travel", label: "Travel", emoji: "🚕" },
  { id: "dates", label: "Dates", emoji: "💕" },
  { id: "other", label: "Other", emoji: "✨" },
];
