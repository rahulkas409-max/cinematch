export type DeckId = "intimacy" | "parenting" | "golden" | "family";

export type Flashcard = {
  id: string;
  deck: DeckId;
  /** Question or scenario shown on the front. */
  front: string;
  /** Constructive conversation prompts / talking points shown on the back. */
  back: string[];
};

export type Deck = { id: DeckId; title: string; subtitle: string; emoji: string; accent: string };

export const DECKS: Deck[] = [
  { id: "intimacy", title: "Deep Intimacy & Vulnerability", subtitle: "Childhood dreams, fears, love languages", emoji: "🫶", accent: "#e06d53" },
  { id: "parenting", title: "Parenting Philosophies", subtitle: "Screens, discipline, school, money", emoji: "🍼", accent: "#d97706" },
  { id: "golden", title: "Aging & Golden Years", subtitle: "Retirement, health, where we live at 60", emoji: "🌅", accent: "#588157" },
  { id: "family", title: "Family & In-Law Respect", subtitle: "Boundaries with love", emoji: "🏡", accent: "#1e293b" },
];

const c = (deck: DeckId, n: number, front: string, back: string[]): Flashcard => ({ id: `${deck}-${n}`, deck, front, back });

export const FLASHCARDS: Flashcard[] = [
  // ── Deep Intimacy & Vulnerability (20)
  c("intimacy", 1, "What did you want to be when you grew up, and what happened to that dream?", ["Which part of that dream still lives in you?", "How can I help you honour it now?"]),
  c("intimacy", 2, "What's a fear you've never said out loud?", ["Take your time. I'm just listening.", "What would make it feel a little lighter?"]),
  c("intimacy", 3, "How do you most like to receive love: words, time, touch, acts, or gifts?", ["Share a recent moment you felt deeply loved.", "Which one do I do well? Which could I do more?"]),
  c("intimacy", 4, "When do you feel most emotionally safe with me?", ["Name one thing that builds that safety.", "Is there anything that quietly chips away at it?"]),
  c("intimacy", 5, "What's a childhood memory that shaped how you love?", ["What did you learn about love at home?", "What would you keep, and what would you rewrite?"]),
  c("intimacy", 6, "What's something you wish I asked you about more often?", ["Answer it now. I'm asking!", "How can I remember to ask?"]),
  c("intimacy", 7, "When you're hurt, what do you need first: space, words, or a hug?", ["How can I tell which one you need?", "Is there a signal we could agree on?"]),
  c("intimacy", 8, "What's one insecurity you'd like me to understand better?", ["Where do you think it comes from?", "What can I say that actually helps?"]),
  c("intimacy", 9, "What moment made you realise you really liked me?", ["What did you notice first?", "Does that still feel true today?"]),
  c("intimacy", 10, "What do you need more of from me this month?", ["Be specific: small is perfect.", "What could you give me in return?"]),
  c("intimacy", 11, "What does 'home' feel like to you: a place, a person, or a feeling?", ["When did you last feel fully at home?", "How can we build more of that?"]),
  c("intimacy", 12, "What's a mistake you made that taught you something about yourself?", ["How did you forgive yourself?", "What would you tell someone going through it?"]),
  c("intimacy", 13, "What does a perfect apology sound like to you?", ["Words, actions, or both?", "How do you like to repair after a fight?"]),
  c("intimacy", 14, "Which part of yourself are you still learning to love?", ["What do I see in that part that you might miss?", "How can I be gentle with it?"]),
  c("intimacy", 15, "What's your earliest memory of feeling completely happy?", ["Who was there?", "How can we recreate a little of it?"]),
  c("intimacy", 16, "What's one thing you'd never want to lose in our relationship?", ["Why does it matter so much?", "How can we protect it together?"]),
  c("intimacy", 17, "When do you feel lonely even when we're together?", ["No blame, just curiosity.", "What would help you feel seen in those moments?"]),
  c("intimacy", 18, "What's a compliment you've received that you still think about?", ["Why did it stay with you?", "Here's one from me, right now…"]),
  c("intimacy", 19, "What does emotional intimacy mean to you, beyond physical closeness?", ["When have we felt closest?", "What's one ritual that could keep that alive?"]),
  c("intimacy", 20, "If you could promise me one thing for the next year, what would it be?", ["Make it realistic and kind.", "And what would you like me to promise?"]),

  // ── Parenting Philosophies (15)
  c("parenting", 1, "How much screen time is okay for a 5-year-old?", ["What was screen time like when you grew up?", "Rules vs. modelling: which matters more?"]),
  c("parenting", 2, "Discipline or gentle guidance: where do you stand?", ["What did your parents do that you'd repeat?", "What would you never repeat?"]),
  c("parenting", 3, "Public, private, international or homeschool?", ["What matters most: values, results, or happiness?", "How would we decide if we disagree?"]),
  c("parenting", 4, "Should kids get pocket money? From what age?", ["Earned through chores, or unconditional?", "How do we teach saving vs. spending?"]),
  c("parenting", 5, "How involved should grandparents be in raising our kids?", ["Where's the line between help and interference?", "How do we say no kindly?"]),
  c("parenting", 6, "How do we split night feeds, school runs and sick days?", ["What feels fair, not just equal?", "How do we check in when it stops feeling fair?"]),
  c("parenting", 7, "Which language(s) should our kids grow up speaking?", ["Mother tongue at home?", "How do we keep our cultures alive?"]),
  c("parenting", 8, "How would we talk to our kids about religion and faith?", ["Teach one path, many, or let them explore?", "Which festivals are non-negotiable for you?"]),
  c("parenting", 9, "What's our stance on tuition classes and competitive exams?", ["How much pressure is healthy?", "What does 'success' mean for our kid?"]),
  c("parenting", 10, "When should a child get their first phone?", ["What rules would come with it?", "How do we handle social media?"]),
  c("parenting", 11, "How do we handle a tantrum in a crowded mall?", ["Calm first, or consequences first?", "Who steps in, and how do we back each other up?"]),
  c("parenting", 12, "Should we ever argue in front of our children?", ["Is healthy repair something they should see?", "What topics stay private?"]),
  c("parenting", 13, "How do we make sure each of us still gets 'me time' as parents?", ["What does recharging look like for you?", "How do we protect date nights?"]),
  c("parenting", 14, "What are three values we most want our kids to carry?", ["How would we teach them day to day?", "How do we model them ourselves?"]),
  c("parenting", 15, "How many kids, if any, and when would feel right?", ["What would need to be true first?", "How do we stay open if plans change?"]),

  // ── Aging & Golden Years (15)
  c("golden", 1, "At 60, do we live in the mountains, by the coast, or in the city?", ["What would a normal Tuesday look like there?", "How close do we want to be to family?"]),
  c("golden", 2, "What does retirement look like to you: slow down, or start something new?", ["What's the first thing you'd do?", "What would you miss about working?"]),
  c("golden", 3, "What health commitment could we make together, starting now?", ["Walks, yoga, check-ups, sleep?", "How do we keep each other accountable, kindly?"]),
  c("golden", 4, "If one of us needed long-term care, how would we handle it?", ["Home care, family, or assisted living?", "How do we avoid burning out the caregiver?"]),
  c("golden", 5, "Where should our parents live when they're older?", ["With us, nearby, or independently?", "How do we balance both families fairly?"]),
  c("golden", 6, "What's on your 'before 70' travel list?", ["One trip for each of us, one together.", "What would we save for it each month?"]),
  c("golden", 7, "How do you want to be remembered by our grandchildren?", ["What stories would you tell them?", "What traditions would you pass on?"]),
  c("golden", 8, "How much do we save for retirement vs. enjoy now?", ["What does 'enough' look like to you?", "Who handles which part of our money?"]),
  c("golden", 9, "What hobby would you want to master in your 60s?", ["Could we pick one together?", "What's stopping us from starting a little now?"]),
  c("golden", 10, "How do we keep romance alive after 30 years together?", ["What rituals would you never let go of?", "What's one surprise you'd plan?"]),
  c("golden", 11, "What are your wishes for end-of-life care?", ["It's a heavy card: go slowly.", "Have we written any of this down?"]),
  c("golden", 12, "Would you downsize, or keep the family home for the kids to visit?", ["What does the home symbolise for you?", "What would we keep, no matter what?"]),
  c("golden", 13, "How would we stay socially connected as we age?", ["Friends, community, volunteering?", "What keeps you from feeling isolated?"]),
  c("golden", 14, "What would a perfect 50th anniversary look like?", ["Big party, or quiet getaway?", "Who has to be there?"]),
  c("golden", 15, "What's one thing you want us to stop postponing 'for later'?", ["Why not this year?", "What's the smallest first step?"]),

  // ── Family & In-Law Respect (12)
  c("family", 1, "Your parents drop in unannounced, again, on a Sunday morning.", ["Agree on a warm, clear ask: 'We love seeing you, a quick call first helps us be ready.'", "The child of those parents leads the conversation.", "Offer a standing visit slot so it feels like an invitation, not a rule."]),
  c("family", 2, "A relative gives unsolicited advice on how you run your home.", ["Acknowledge the care behind it: 'Thanks, we'll think about it.'", "Decide together afterwards, not in the moment.", "Present a united front, even if you privately disagree."]),
  c("family", 3, "Your partner's parents need regular financial support.", ["Set a monthly amount you both agree on, openly.", "Treat both sets of parents with the same transparency.", "Revisit the plan every six months."]),
  c("family", 4, "Privacy: your fights are being reported back to family.", ["Agree on what stays between the two of you.", "Venting to a friend ≠ involving parents in decisions.", "Repair with each other first."]),
  c("family", 5, "Pressure about 'good news' (kids) at every family gathering.", ["Prepare a light, shared one-liner: 'You'll be the first to know!'", "Redirect: ask them about their own early married life.", "The respective child sets the boundary with their own parents."]),
  c("family", 6, "One family expects you for every festival.", ["Use a rotation calendar so both families get fair time.", "Split days when distance allows (e.g., Diwali eve & Diwali day).", "Announce plans early to avoid last-minute hurt."]),
  c("family", 7, "Comments about your cooking, clothes, or career.", ["Name the feeling calmly: 'That comment hurt a little.'", "Ask your partner to step in with their family.", "Choose which battles matter; let small ones pass."]),
  c("family", 8, "A family member wants to stay with you for three months.", ["Discuss your capacity honestly before saying yes.", "Agree on house rules and a rough end date.", "Keep a weekly check-in on how it's going."]),
  c("family", 9, "Deciding whether to live with parents after marriage.", ["List the benefits and the needs for each of you.", "Agree on private space and alone-time rituals.", "Set a review date to check in on the arrangement."]),
  c("family", 10, "Grandparents undermining your parenting rules.", ["Thank them for their love, then restate the rule warmly.", "Explain the 'why', not just the 'what'.", "Pick the few rules that truly matter."]),
  c("family", 11, "Siblings asking for a loan.", ["Decide together, never alone, on loans above an agreed amount.", "Only lend what you can afford to never get back.", "Write down terms kindly, even with family."]),
  c("family", 12, "You feel your partner always sides with their parents.", ["Use 'I feel' language, not 'you always'.", "Ask for support in private, even if they stay neutral in public.", "Agree that your partnership is the first team."]),
];

export const deckCards = (deck: DeckId) => FLASHCARDS.filter((f) => f.deck === deck);
