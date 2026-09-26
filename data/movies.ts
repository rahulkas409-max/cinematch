// Seed dataset used when TMDB_API_KEY is absent (and as the base catalogue when it
// is present — TMDB only enriches posters, trailers, ratings and providers).
// Ratings and streaming platforms are approximate snapshots for India and change often.

export const GENRES = [
  "Sci-Fi",
  "Horror",
  "Romance",
  "Thriller",
  "Comedy",
  "Action",
  "Indie",
  "Animation",
  "Drama",
] as const;
export type Genre = (typeof GENRES)[number];

export const VIBES = [
  { id: "cry", label: "Cry my eyes out", emoji: "😭", blurb: "Tissues mandatory", from: "#60a5fa", to: "#6366f1" },
  { id: "mind", label: "Mind-bending puzzle", emoji: "🌀", blurb: "Rewind-worthy twists", from: "#a855f7", to: "#22d3ee" },
  { id: "dopamine", label: "Pure dopamine", emoji: "🤩", blurb: "Grin from start to end", from: "#facc15", to: "#fb7185" },
  { id: "spooky", label: "Spooky thriller", emoji: "👻", blurb: "Lights off, volume up", from: "#ef4444", to: "#18181b" },
  { id: "butterflies", label: "Butterflies", emoji: "🦋", blurb: "Swoon-level romance", from: "#f472b6", to: "#f9a8d4" },
  { id: "adrenaline", label: "Adrenaline rush", emoji: "💥", blurb: "Seatbelt required", from: "#f97316", to: "#dc2626" },
  { id: "cozy", label: "Cozy comfort", emoji: "🫖", blurb: "Blanket + chai energy", from: "#fbbf24", to: "#a3e635" },
  { id: "laugh", label: "Belly laughs", emoji: "😂", blurb: "Snort-laugh guaranteed", from: "#34d399", to: "#22d3ee" },
] as const;
export type VibeId = (typeof VIBES)[number]["id"];

export type Platform = "Netflix" | "Prime Video" | "JioHotstar" | "Apple TV+" | "Zee5" | "SonyLIV";

export interface Movie {
  id: string;
  title: string;
  year: number;
  runtime: number; // minutes
  genres: Genre[];
  vibes: VibeId[];
  emoji: string; // 3-emoji riddle
  tagline: string;
  language: string;
  rating: number; // approx. TMDB score /10
  platforms: Platform[];
  palette: [string, string]; // fallback poster gradient
  /** Deep cut — boosted for high quiz scores and featured in secret playlists. */
  gem?: boolean;
  // Filled in by the TMDB client when TMDB_API_KEY is set
  posterUrl?: string;
  trailerKey?: string;
  tmdbId?: number;
}

const m = (x: Movie) => x;

export const MOVIES: Movie[] = [
  // ---- Sci-Fi ----
  m({ id: "interstellar", title: "Interstellar", year: 2014, runtime: 169, genres: ["Sci-Fi", "Drama"], vibes: ["mind", "cry"], emoji: "🚀🌽⏳", tagline: "Love is the one thing that transcends time and space.", language: "English", rating: 8.4, platforms: ["Prime Video"], palette: ["#0f172a", "#f59e0b"] }),
  m({ id: "inception", title: "Inception", year: 2010, runtime: 148, genres: ["Sci-Fi", "Action", "Thriller"], vibes: ["mind", "adrenaline"], emoji: "💤🌀🔝", tagline: "Your mind is the scene of the crime.", language: "English", rating: 8.4, platforms: ["Netflix", "Prime Video"], palette: ["#1e293b", "#38bdf8"] }),
  m({ id: "matrix", title: "The Matrix", year: 1999, runtime: 136, genres: ["Sci-Fi", "Action"], vibes: ["mind", "adrenaline"], emoji: "💊🕶️🐇", tagline: "Free your mind.", language: "English", rating: 8.2, platforms: ["Prime Video"], palette: ["#022c22", "#22c55e"] }),
  m({ id: "blade-runner", title: "Blade Runner", year: 1982, runtime: 117, genres: ["Sci-Fi", "Thriller"], vibes: ["mind"], emoji: "🦄🌧️🤖", tagline: "Man has made his match... now it's his problem.", language: "English", rating: 7.9, platforms: ["Prime Video"], palette: ["#1c1917", "#f97316"] }),
  m({ id: "arrival", title: "Arrival", year: 2016, runtime: 116, genres: ["Sci-Fi", "Drama"], vibes: ["mind", "cry"], emoji: "🐙✍️🛸", tagline: "Why are they here?", language: "English", rating: 7.6, platforms: ["Netflix"], palette: ["#334155", "#cbd5e1"], gem: true }),
  m({ id: "eeaao", title: "Everything Everywhere All at Once", year: 2022, runtime: 139, genres: ["Sci-Fi", "Comedy", "Action"], vibes: ["mind", "cry", "laugh"], emoji: "🥯👀🌭", tagline: "The universe is so much bigger than you realize.", language: "English", rating: 7.8, platforms: ["Prime Video"], palette: ["#4c1d95", "#f472b6"] }),
  m({ id: "wall-e", title: "WALL·E", year: 2008, runtime: 98, genres: ["Animation", "Sci-Fi"], vibes: ["cozy", "cry"], emoji: "🤖🌱🚀", tagline: "After 700 years of doing what he was built for — he'll discover what he's meant for.", language: "English", rating: 8.1, platforms: ["JioHotstar"], palette: ["#78350f", "#fde68a"] }),
  m({ id: "quiet-place", title: "A Quiet Place", year: 2018, runtime: 90, genres: ["Horror", "Sci-Fi", "Thriller"], vibes: ["spooky"], emoji: "🤫👂👽", tagline: "If they hear you, they hunt you.", language: "English", rating: 7.4, platforms: ["Prime Video"], palette: ["#1f2937", "#b91c1c"] }),

  // ---- Horror ----
  m({ id: "get-out", title: "Get Out", year: 2017, runtime: 104, genres: ["Horror", "Thriller"], vibes: ["spooky", "mind"], emoji: "☕🥄😱", tagline: "Just because you're invited, doesn't mean you're welcome.", language: "English", rating: 7.6, platforms: ["Prime Video"], palette: ["#0c0a09", "#e11d48"] }),
  m({ id: "hereditary", title: "Hereditary", year: 2018, runtime: 127, genres: ["Horror"], vibes: ["spooky"], emoji: "👑🔥🏠", tagline: "Every family tree hides a secret.", language: "English", rating: 7.3, platforms: ["Prime Video"], palette: ["#292524", "#a16207"], gem: true }),
  m({ id: "shining", title: "The Shining", year: 1980, runtime: 146, genres: ["Horror"], vibes: ["spooky"], emoji: "🪓🏨❄️", tagline: "Here's Johnny!", language: "English", rating: 8.2, platforms: ["Prime Video"], palette: ["#7f1d1d", "#fca5a5"] }),
  m({ id: "tumbbad", title: "Tumbbad", year: 2018, runtime: 104, genres: ["Horror", "Indie"], vibes: ["spooky", "mind"], emoji: "🪙👵🌧️", tagline: "Never build a temple for Hastar.", language: "Hindi", rating: 8.0, platforms: ["Prime Video"], palette: ["#1c1917", "#ca8a04"], gem: true }),
  m({ id: "stree", title: "Stree", year: 2018, runtime: 128, genres: ["Horror", "Comedy"], vibes: ["spooky", "laugh"], emoji: "👻💃🧵", tagline: "O Stree, kal aana.", language: "Hindi", rating: 7.2, platforms: ["JioHotstar"], palette: ["#3b0764", "#f43f5e"] }),
  m({ id: "jaws", title: "Jaws", year: 1975, runtime: 124, genres: ["Thriller", "Horror"], vibes: ["spooky", "adrenaline"], emoji: "🦈🏖️🚤", tagline: "You'll never go in the water again.", language: "English", rating: 7.7, platforms: ["Prime Video"], palette: ["#0c4a6e", "#e0f2fe"] }),

  // ---- Thriller ----
  m({ id: "parasite", title: "Parasite", year: 2019, runtime: 132, genres: ["Thriller", "Drama", "Comedy"], vibes: ["mind", "spooky"], emoji: "🪨🏠🍑", tagline: "Act like you own the place.", language: "Korean", rating: 8.5, platforms: ["Prime Video"], palette: ["#14532d", "#d9f99d"] }),
  m({ id: "andhadhun", title: "Andhadhun", year: 2018, runtime: 139, genres: ["Thriller", "Comedy"], vibes: ["mind", "laugh"], emoji: "🎹🕶️🐇", tagline: "What you see is not what it is.", language: "Hindi", rating: 8.0, platforms: ["Netflix"], palette: ["#111827", "#facc15"] }),
  m({ id: "drishyam", title: "Drishyam", year: 2013, runtime: 160, genres: ["Thriller", "Drama"], vibes: ["mind"], emoji: "📅🎬🔒", tagline: "Visuals can be deceptive.", language: "Malayalam", rating: 8.1, platforms: ["JioHotstar"], palette: ["#1e3a8a", "#93c5fd"], gem: true }),
  m({ id: "se7en", title: "Se7en", year: 1995, runtime: 127, genres: ["Thriller"], vibes: ["spooky", "mind"], emoji: "📦😨7️⃣", tagline: "Seven deadly sins. Seven ways to die.", language: "English", rating: 8.4, platforms: ["Prime Video"], palette: ["#27272a", "#a8a29e"] }),
  m({ id: "gone-girl", title: "Gone Girl", year: 2014, runtime: 149, genres: ["Thriller", "Drama"], vibes: ["mind", "spooky"], emoji: "👩‍🦰📖🔪", tagline: "You don't know what you've got 'til it's...", language: "English", rating: 7.9, platforms: ["JioHotstar"], palette: ["#0f172a", "#e2e8f0"] }),

  // ---- Romance ----
  m({ id: "la-la-land", title: "La La Land", year: 2016, runtime: 128, genres: ["Romance", "Drama"], vibes: ["butterflies", "cry"], emoji: "🎹💃🌆", tagline: "Here's to the fools who dream.", language: "English", rating: 7.9, platforms: ["Prime Video"], palette: ["#312e81", "#facc15"] }),
  m({ id: "before-sunrise", title: "Before Sunrise", year: 1995, runtime: 101, genres: ["Romance", "Indie"], vibes: ["butterflies", "cozy"], emoji: "🚂🌅🗣️", tagline: "Can the greatest romance of your life last only one night?", language: "English", rating: 7.9, platforms: ["Apple TV+"], palette: ["#7c2d12", "#fed7aa"], gem: true }),
  m({ id: "ddlj", title: "Dilwale Dulhania Le Jayenge", year: 1995, runtime: 189, genres: ["Romance", "Drama"], vibes: ["butterflies", "dopamine"], emoji: "🚂🌻✋", tagline: "Ja Simran ja, jee le apni zindagi.", language: "Hindi", rating: 8.1, platforms: ["Prime Video"], palette: ["#166534", "#fde047"] }),
  m({ id: "jab-we-met", title: "Jab We Met", year: 2007, runtime: 138, genres: ["Romance", "Comedy"], vibes: ["butterflies", "dopamine"], emoji: "🚆💃🧳", tagline: "Main apni favourite hoon!", language: "Hindi", rating: 7.8, platforms: ["Prime Video"], palette: ["#be185d", "#fbcfe8"] }),
  m({ id: "notebook", title: "The Notebook", year: 2004, runtime: 123, genres: ["Romance", "Drama"], vibes: ["butterflies", "cry"], emoji: "📓🛶🦢", tagline: "Behind every great love is a great story.", language: "English", rating: 7.9, platforms: ["Netflix"], palette: ["#155e75", "#a5f3fc"] }),
  m({ id: "pride-prejudice", title: "Pride & Prejudice", year: 2005, runtime: 129, genres: ["Romance", "Drama"], vibes: ["butterflies", "cozy"], emoji: "💍🏰🌧️", tagline: "Sometimes the last person on earth you want to be with is the one person you can't be without.", language: "English", rating: 7.9, platforms: ["Prime Video"], palette: ["#3f6212", "#ecfccb"] }),
  m({ id: "lunchbox", title: "The Lunchbox", year: 2013, runtime: 104, genres: ["Romance", "Indie", "Drama"], vibes: ["butterflies", "cozy", "cry"], emoji: "🍱✉️🚂", tagline: "Sometimes the wrong train takes you to the right station.", language: "Hindi", rating: 7.6, platforms: ["Netflix"], palette: ["#78350f", "#fcd34d"], gem: true }),
  m({ id: "eternal-sunshine", title: "Eternal Sunshine of the Spotless Mind", year: 2004, runtime: 108, genres: ["Romance", "Indie", "Sci-Fi"], vibes: ["mind", "butterflies", "cry"], emoji: "🧠🧽❤️", tagline: "You can erase someone from your mind. Getting them out of your heart is another story.", language: "English", rating: 8.1, platforms: ["Prime Video"], palette: ["#1d4ed8", "#fb923c"] }),

  // ---- Comedy ----
  m({ id: "superbad", title: "Superbad", year: 2007, runtime: 113, genres: ["Comedy"], vibes: ["laugh", "dopamine"], emoji: "🍺🚓🤓", tagline: "Come and get some.", language: "English", rating: 7.2, platforms: ["Netflix"], palette: ["#ea580c", "#fef08a"] }),
  m({ id: "hera-pheri", title: "Hera Pheri", year: 2000, runtime: 156, genres: ["Comedy"], vibes: ["laugh", "dopamine"], emoji: "☎️💰😂", tagline: "Yeh Baburao ka style hai!", language: "Hindi", rating: 8.1, platforms: ["Prime Video"], palette: ["#b45309", "#fde68a"] }),
  m({ id: "3-idiots", title: "3 Idiots", year: 2009, runtime: 170, genres: ["Comedy", "Drama"], vibes: ["laugh", "cry", "dopamine"], emoji: "🎓🔧🙌", tagline: "All izz well.", language: "Hindi", rating: 8.0, platforms: ["Prime Video"], palette: ["#0369a1", "#bae6fd"] }),
  m({ id: "grand-budapest", title: "The Grand Budapest Hotel", year: 2014, runtime: 99, genres: ["Comedy", "Indie"], vibes: ["laugh", "cozy"], emoji: "🏨🎂🔑", tagline: "A murder case. A stolen painting. A great hotel.", language: "English", rating: 8.0, platforms: ["JioHotstar"], palette: ["#be185d", "#fbcfe8"] }),
  m({ id: "znmd", title: "Zindagi Na Milegi Dobara", year: 2011, runtime: 155, genres: ["Comedy", "Drama"], vibes: ["dopamine", "cozy"], emoji: "🚗🍅🤿", tagline: "Seize the day, my friend.", language: "Hindi", rating: 7.9, platforms: ["Netflix", "Prime Video"], palette: ["#0e7490", "#fcd34d"] }),
  m({ id: "paddington-2", title: "Paddington 2", year: 2017, runtime: 103, genres: ["Comedy"], vibes: ["cozy", "dopamine", "laugh"], emoji: "🐻🍊🥪", tagline: "If we are kind and polite, the world will be right.", language: "English", rating: 7.6, platforms: ["Netflix"], palette: ["#1e40af", "#fca5a5"] }),

  // ---- Action ----
  m({ id: "mad-max", title: "Mad Max: Fury Road", year: 2015, runtime: 120, genres: ["Action", "Sci-Fi"], vibes: ["adrenaline", "dopamine"], emoji: "🚗🔥🏜️", tagline: "What a lovely day.", language: "English", rating: 7.6, platforms: ["Prime Video"], palette: ["#9a3412", "#fdba74"] }),
  m({ id: "john-wick", title: "John Wick", year: 2014, runtime: 101, genres: ["Action", "Thriller"], vibes: ["adrenaline"], emoji: "🐶🔫🕴️", tagline: "Don't set him off.", language: "English", rating: 7.4, platforms: ["Prime Video"], palette: ["#020617", "#6366f1"] }),
  m({ id: "rrr", title: "RRR", year: 2022, runtime: 187, genres: ["Action", "Drama"], vibes: ["adrenaline", "dopamine"], emoji: "🔥🌊🤝", tagline: "Rise. Roar. Revolt.", language: "Telugu", rating: 7.8, platforms: ["Netflix", "Zee5"], palette: ["#7f1d1d", "#38bdf8"] }),
  m({ id: "baahubali", title: "Baahubali: The Beginning", year: 2015, runtime: 159, genres: ["Action", "Drama"], vibes: ["adrenaline", "dopamine"], emoji: "⚔️🏔️👑", tagline: "Why did Kattappa kill Baahubali?", language: "Telugu", rating: 7.5, platforms: ["Netflix", "JioHotstar"], palette: ["#78350f", "#f59e0b"] }),
  m({ id: "die-hard", title: "Die Hard", year: 1988, runtime: 132, genres: ["Action", "Thriller"], vibes: ["adrenaline", "dopamine"], emoji: "🏢🎄🔫", tagline: "Yippee-ki-yay.", language: "English", rating: 7.8, platforms: ["JioHotstar"], palette: ["#1e3a8a", "#f87171"] }),
  m({ id: "kgf", title: "K.G.F: Chapter 1", year: 2018, runtime: 155, genres: ["Action"], vibes: ["adrenaline"], emoji: "⛏️👑💥", tagline: "Powerful people make places powerful.", language: "Kannada", rating: 7.5, platforms: ["Prime Video"], palette: ["#451a03", "#fbbf24"] }),
  m({ id: "sholay", title: "Sholay", year: 1975, runtime: 204, genres: ["Action", "Drama"], vibes: ["adrenaline", "dopamine"], emoji: "🐎🔫🤝", tagline: "Kitne aadmi the?", language: "Hindi", rating: 8.1, platforms: ["Prime Video"], palette: ["#92400e", "#fde68a"] }),

  // ---- Animation ----
  m({ id: "spirited-away", title: "Spirited Away", year: 2001, runtime: 125, genres: ["Animation"], vibes: ["cozy", "mind"], emoji: "🐉🛁👧", tagline: "Nothing that happens is ever forgotten.", language: "Japanese", rating: 8.5, platforms: ["Netflix"], palette: ["#0f766e", "#fca5a5"] }),
  m({ id: "spider-verse", title: "Spider-Man: Into the Spider-Verse", year: 2018, runtime: 117, genres: ["Animation", "Action"], vibes: ["dopamine", "adrenaline"], emoji: "🕷️🎨🌌", tagline: "Anyone can wear the mask.", language: "English", rating: 8.4, platforms: ["Netflix"], palette: ["#be123c", "#2563eb"] }),
  m({ id: "toy-story", title: "Toy Story", year: 1995, runtime: 81, genres: ["Animation", "Comedy"], vibes: ["cozy", "dopamine"], emoji: "🤠🚀🧸", tagline: "To infinity and beyond!", language: "English", rating: 8.0, platforms: ["JioHotstar"], palette: ["#1d4ed8", "#fde047"] }),
  m({ id: "coco", title: "Coco", year: 2017, runtime: 105, genres: ["Animation"], vibes: ["cry", "cozy"], emoji: "💀🎸🌼", tagline: "Remember me.", language: "English", rating: 8.2, platforms: ["JioHotstar"], palette: ["#6d28d9", "#fb923c"] }),
  m({ id: "up", title: "Up", year: 2009, runtime: 96, genres: ["Animation", "Comedy"], vibes: ["cry", "cozy", "dopamine"], emoji: "🎈🏠👴", tagline: "Adventure is out there.", language: "English", rating: 7.9, platforms: ["JioHotstar"], palette: ["#0284c7", "#fde68a"] }),
  m({ id: "grave-fireflies", title: "Grave of the Fireflies", year: 1988, runtime: 89, genres: ["Animation", "Drama"], vibes: ["cry"], emoji: "🍬🔥✨", tagline: "Why do fireflies have to die so soon?", language: "Japanese", rating: 8.5, platforms: ["Netflix"], palette: ["#431407", "#fdba74"], gem: true }),

  // ---- Indie / Drama ----
  m({ id: "lady-bird", title: "Lady Bird", year: 2017, runtime: 94, genres: ["Indie", "Comedy", "Drama"], vibes: ["cozy", "laugh", "cry"], emoji: "🐦🎓🚗", tagline: "Fly away home.", language: "English", rating: 7.3, platforms: ["Prime Video"], palette: ["#9d174d", "#fecdd3"] }),
  m({ id: "moonlight", title: "Moonlight", year: 2016, runtime: 111, genres: ["Indie", "Drama"], vibes: ["cry"], emoji: "🌙🌊💙", tagline: "This is the story of a lifetime.", language: "English", rating: 7.4, platforms: ["Prime Video"], palette: ["#1e1b4b", "#60a5fa"], gem: true }),
  m({ id: "masaan", title: "Masaan", year: 2015, runtime: 109, genres: ["Indie", "Drama", "Romance"], vibes: ["cry", "butterflies"], emoji: "🔥🌊🚣", tagline: "Two lives, one river.", language: "Hindi", rating: 7.9, platforms: ["Netflix"], palette: ["#7c2d12", "#fdba74"], gem: true }),
  m({ id: "kumbalangi", title: "Kumbalangi Nights", year: 2019, runtime: 135, genres: ["Indie", "Drama", "Comedy"], vibes: ["cozy", "cry", "laugh"], emoji: "🏝️🐟👬", tagline: "Home is where the heart glows.", language: "Malayalam", rating: 8.2, platforms: ["Prime Video"], palette: ["#134e4a", "#5eead4"], gem: true }),
  m({ id: "taare-zameen-par", title: "Taare Zameen Par", year: 2007, runtime: 165, genres: ["Drama"], vibes: ["cry", "cozy"], emoji: "🎨⭐👦", tagline: "Every child is special.", language: "Hindi", rating: 8.2, platforms: ["Netflix"], palette: ["#1e40af", "#fde047"] }),
  m({ id: "shawshank", title: "The Shawshank Redemption", year: 1994, runtime: 142, genres: ["Drama"], vibes: ["cry", "dopamine"], emoji: "🔨🧱🌧️", tagline: "Fear can hold you prisoner. Hope can set you free.", language: "English", rating: 8.7, platforms: ["Netflix"], palette: ["#292524", "#93c5fd"] }),
];

export const movieById = (id: string) => MOVIES.find((x) => x.id === id);

/** Premium-only hand-curated playlists. Served exclusively by /api/playlists. */
export const SECRET_PLAYLISTS: { id: string; title: string; emoji: string; blurb: string; movieIds: string[] }[] = [
  { id: "midnight-mind", title: "Midnight Mind-Benders", emoji: "🌀", blurb: "For when you want to argue about the ending until 3 AM.", movieIds: ["arrival", "tumbbad", "eternal-sunshine", "drishyam", "blade-runner", "parasite"] },
  { id: "monsoon-cry", title: "Monsoon Cry Club", emoji: "🌧️", blurb: "Rain outside, rain inside. Keep the chai close.", movieIds: ["grave-fireflies", "moonlight", "masaan", "lunchbox", "coco", "taare-zameen-par"] },
  { id: "desi-deep-cuts", title: "Desi Deep Cuts", emoji: "🪔", blurb: "Indian gems your group chat hasn't discovered yet.", movieIds: ["kumbalangi", "tumbbad", "masaan", "lunchbox", "drishyam", "andhadhun"] },
  { id: "snack-size", title: "90-Minute Miracles", emoji: "⏱️", blurb: "Short, sharp, and done before your food arrives.", movieIds: ["toy-story", "grave-fireflies", "quiet-place", "lady-bird", "wall-e", "up"] },
  { id: "chaos-party", title: "Friday Night Chaos", emoji: "🎉", blurb: "Loud, silly, and best with a crowd.", movieIds: ["hera-pheri", "rrr", "superbad", "mad-max", "stree", "spider-verse"] },
];
