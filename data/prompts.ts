export type Category = "fiction" | "poetry" | "reflection";

export interface Prompt {
  id: string;
  category: Category;
  text: string;
}

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