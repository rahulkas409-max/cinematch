export type Quirk = { id: string; text: string; emoji: string; tag: "Habits" | "Food debates" | "Humour" | "Lifestyle" };

export const QUIRKS: Quirk[] = [
  { id: "q1", text: "Pineapple belongs on pizza", emoji: "🍍", tag: "Food debates" },
  { id: "q2", text: "Replying to texts hours later, then acting like nothing happened", emoji: "📱", tag: "Habits" },
  { id: "q3", text: "Chai is superior to coffee. Non-negotiable.", emoji: "☕", tag: "Food debates" },
  { id: "q4", text: "Planning trips down to the minute on a spreadsheet", emoji: "🗂️", tag: "Lifestyle" },
  { id: "q5", text: "Sending memes instead of saying how you feel", emoji: "😂", tag: "Humour" },
  { id: "q6", text: "Morning person who talks before coffee", emoji: "🌅", tag: "Habits" },
  { id: "q7", text: "Dancing badly and confidently at weddings", emoji: "💃", tag: "Humour" },
  { id: "q8", text: "Eating the last bite of someone else's dessert", emoji: "🍰", tag: "Food debates" },
  { id: "q9", text: "Rewatching the same comfort show for the 9th time", emoji: "📺", tag: "Lifestyle" },
  { id: "q10", text: "Leaving 47 browser tabs open", emoji: "🗃️", tag: "Habits" },
  { id: "q11", text: "Biryani with aloo is the real biryani", emoji: "🥔", tag: "Food debates" },
  { id: "q12", text: "Talking to pets in a completely different voice", emoji: "🐶", tag: "Humour" },
  { id: "q13", text: "Being 10 minutes early to everything", emoji: "⏰", tag: "Habits" },
  { id: "q14", text: "Singing loudly in the car, lyrics optional", emoji: "🎤", tag: "Humour" },
  { id: "q15", text: "Maggi at 2 AM is a love language", emoji: "🍜", tag: "Food debates" },
  { id: "q16", text: "Keeping the room at an arctic 18°C", emoji: "🥶", tag: "Lifestyle" },
  { id: "q17", text: "Saying 'I'm 5 min away' while still in bed", emoji: "🛏️", tag: "Habits" },
  { id: "q18", text: "Puns. Lots of puns. Terrible ones.", emoji: "🤓", tag: "Humour" },
  { id: "q19", text: "Ordering the same dish at every restaurant", emoji: "🍛", tag: "Food debates" },
  { id: "q20", text: "Weekend plans = zero plans, full couch", emoji: "🛋️", tag: "Lifestyle" },
  { id: "q21", text: "Voice notes longer than 3 minutes", emoji: "🎙️", tag: "Habits" },
  { id: "q22", text: "Crying at animated movies", emoji: "🥹", tag: "Lifestyle" },
  { id: "q23", text: "Dipping fries in ice cream", emoji: "🍟", tag: "Food debates" },
  { id: "q24", text: "Inside jokes that nobody else understands", emoji: "🙊", tag: "Humour" },
  { id: "q25", text: "Folding clothes straight out of the dryer, every time", emoji: "🧺", tag: "Habits" },
  { id: "q26", text: "Spontaneous midnight drives", emoji: "🚗", tag: "Lifestyle" },
  { id: "q27", text: "Extra spicy or don't bother", emoji: "🌶️", tag: "Food debates" },
  { id: "q28", text: "Laughing at your own joke before the punchline", emoji: "🤭", tag: "Humour" },
];

export type TelepathyQuestion = { id: string; question: string; options: string[] };

export const TELEPATHY: TelepathyQuestion[] = [
  { id: "t1", question: "My ultimate comfort snack is…", options: ["Masala chips", "Chocolate", "Samosa", "Popcorn"] },
  { id: "t2", question: "At 1 AM, I'm most likely craving…", options: ["Maggi", "Ice cream", "Leftover pizza", "A cup of chai"] },
  { id: "t3", question: "My comfort movie genre is…", options: ["Rom-com", "Animated", "Thriller", "Old Bollywood classics"] },
  { id: "t4", question: "My perfect Sunday morning is…", options: ["Sleeping till noon", "Long walk", "Big breakfast", "Cleaning & chores"] },
  { id: "t5", question: "When stressed, I…", options: ["Go quiet", "Talk it out", "Eat something", "Clean everything"] },
  { id: "t6", question: "My go-to drink order is…", options: ["Cold coffee", "Masala chai", "Fresh lime soda", "Hot chocolate"] },
  { id: "t7", question: "My dream holiday is…", options: ["Mountains", "Beach", "A big city", "A quiet village"] },
  { id: "t8", question: "The song I'd pick for a road trip is…", options: ["90s Bollywood", "Indie", "Pop hits", "Old ghazals"] },
  { id: "t9", question: "My hidden talent is…", options: ["Cooking", "Singing", "Mimicry", "Remembering everything"] },
  { id: "t10", question: "I feel most loved when you…", options: ["Say it out loud", "Spend time with me", "Help me out", "Hug me"] },
  { id: "t11", question: "My biggest pet peeve is…", options: ["Loud chewing", "Being late", "Messy rooms", "Slow walkers"] },
  { id: "t12", question: "My dessert of choice is…", options: ["Gulab jamun", "Brownie", "Rasmalai", "Cheesecake"] },
  { id: "t13", question: "If I won the lottery, I'd first…", options: ["Travel the world", "Buy a home", "Help family", "Quit my job"] },
  { id: "t14", question: "My ideal date night is…", options: ["Candle-lit dinner", "Movie at home", "Street food crawl", "Stargazing"] },
  { id: "t15", question: "My comfort series to rewatch is…", options: ["Friends", "The Office", "A K-drama", "Panchayat"] },
];

export type DateIdea = { id: string; emoji: string; title: string; blurb: string };

export const DATE_IDEAS: DateIdea[] = [
  { id: "d1", emoji: "🎨", title: "Pottery class", blurb: "Get messy with clay" },
  { id: "d2", emoji: "🌮", title: "Street food crawl", blurb: "Five stalls, one evening" },
  { id: "d3", emoji: "🌌", title: "Stargazing", blurb: "Blanket, snacks, sky" },
  { id: "d4", emoji: "🎳", title: "Bowling night", blurb: "Loser buys dessert" },
  { id: "d5", emoji: "📚", title: "Bookstore date", blurb: "Pick a book for each other" },
  { id: "d6", emoji: "🍳", title: "Cook-off at home", blurb: "Same recipe, two chefs" },
  { id: "d7", emoji: "🚲", title: "Sunrise cycle ride", blurb: "Chai at the finish line" },
  { id: "d8", emoji: "🎬", title: "Old-school movie hall", blurb: "Popcorn & front row seats" },
  { id: "d9", emoji: "🎤", title: "Karaoke night", blurb: "Duets are mandatory" },
  { id: "d10", emoji: "🧺", title: "Picnic in the park", blurb: "Sandwiches & slow talks" },
  { id: "d11", emoji: "🛶", title: "Lake boating", blurb: "Row, row, row your crush" },
  { id: "d12", emoji: "🕹️", title: "Arcade battle", blurb: "Winner picks dinner" },
];
