export type Category = "fiction" | "poetry" | "reflection";

export interface Prompt {
  id: string;
  category: Category;
  text: string;
  constraint?: string;
}

// Hand-written prompts. About a third of daily prompts come from here.
export const PROMPTS: Prompt[] = [
  // Fiction
  { id: "f1", category: "fiction", text: "A character finds a door in their house that wasn't there yesterday." },
  { id: "f2", category: "fiction", text: "Write a scene that takes place entirely during a power outage." },
  { id: "f3", category: "fiction", text: "Two strangers share an umbrella. One of them is lying about something." },
  { id: "f4", category: "fiction", text: "The last customer of the day asks for something impossible." },
  { id: "f5", category: "fiction", text: "Begin with the sentence: 'Nobody told me the letters would keep arriving.'" },

  // Poetry
  { id: "p1", category: "poetry", text: "Write about the sound of a place you used to live in." },
  { id: "p2", category: "poetry", text: "Describe a color without naming it." },
  { id: "p3", category: "poetry", text: "Write a poem that begins in the middle of a conversation." },
  { id: "p4", category: "poetry", text: "Use three objects from your desk as metaphors for a feeling." },
  { id: "p5", category: "poetry", text: "Write about something ordinary as if it were a miracle." },

  // Reflection
  { id: "r1", category: "reflection", text: "What is something you changed your mind about this year?" },
  { id: "r2", category: "reflection", text: "Describe a small moment from this week you want to remember." },
  { id: "r3", category: "reflection", text: "What would you tell yourself from five years ago?" },
  { id: "r4", category: "reflection", text: "Write about a skill you're proud of and how you got it." },
  { id: "r5", category: "reflection", text: "What does a perfect ordinary day look like for you?" },
];

// Parts the engine combines into new prompts.
export const PARTS = {
  fiction: {
    where: [
      "On the last train home",
      "During a town festival nobody wanted",
      "In a house that is being packed up",
      "In a snowed-in cabin",
      "At a wedding that is going wrong",
      "In a café minutes before closing",
      "On the night the power goes out",
      "On a ferry crossing in heavy fog",
    ],
    who: [
      "a retired lighthouse keeper",
      "a nervous substitute teacher",
      "a night-shift baker",
      "a child who talks to the moon",
      "a translator who is losing a language",
      "a musician who has stopped playing",
      "a stubborn grandmother",
      "a new neighbor who never opens the curtains",
      "a museum guard who knows every painting by heart",
      "a locksmith with a guilty conscience",
    ],
    does: [
      "finds a letter addressed to someone who died years ago",
      "is asked to keep a secret that isn't theirs",
      "has to deliver news nobody wants",
      "notices something that doesn't belong",
      "tells a lie that grows out of control",
      "receives a gift with no name on it",
      "makes a promise they can't keep",
      "overhears half of a conversation",
      "meets someone who knows them too well",
      "has until morning to decide",
    ],
  },
  poetry: {
    subject: [
      "the sound of a place you used to live",
      "a stranger's laugh",
      "the last day of summer",
      "the weight of an empty room",
      "rain on a tin roof",
      "a door you never opened",
      "your grandparents' hands",
      "the color of waiting",
      "a city at 4 a.m.",
      "something you almost said",
    ],
    angle: [
      "Never use the first person.",
      "Address it to someone who isn't listening.",
      "Write it as a series of questions.",
      "Keep it to exactly eight lines.",
      "Use only concrete images, no abstract nouns.",
      "Begin in the middle of a sentence.",
      "Start every line with the same word.",
      "Let it begin as a list and slowly turn into something else.",
    ],
  },
  reflection: {
    topic: [
      "a time you were wrong and didn't know it yet",
      "someone who shaped you without meaning to",
      "a place that feels like home even though it isn't",
      "something you keep putting off",
      "a small kindness you still remember",
      "a habit you picked up from someone else",
      "a fear that turned out smaller than expected",
      "something you used to believe",
      "a day you would happily live again",
      "a skill you're quietly proud of",
    ],
    angle: [
      "What has changed since?",
      "What would you say to the person you were then?",
      "What are you still unsure about?",
      "How would someone else tell this story?",
      "What do you want to keep from it?",
      "What would you do differently, if anything?",
    ],
  },
};

// Extra twists for challenge mode.
export const CONSTRAINTS: string[] = [
  "Use no adjectives.",
  "Write it entirely in second person (\"you\").",
  "Include all five senses.",
  "Begin every sentence with a different letter.",
  "Include a line of dialogue.",
  "Use at least one metaphor and no clichés.",
  "Write the last sentence first.",
  "Never use the word \"the\".",
  "Include a number and a color.",
];