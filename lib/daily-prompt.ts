import { PARTS, PROMPTS, type Category } from "@/data/prompts";

export type { Category };

export const CATEGORIES: { value: Category; label: string }[] = [
  { value: "fiction", label: "Fiction" },
  { value: "poetry", label: "Poetry" },
  { value: "reflection", label: "Reflection" },
];

// "2026-10-20" style key, used for saving entries.
export function dateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Turns a text seed into a number.
function hash(seed: string): number {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  h = Math.imul(h ^ (h >>> 16), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  return (h ^ (h >>> 16)) >>> 0;
}

// A repeatable stream of random numbers: the same seed gives the same stream.
function seeded(seed: string): () => number {
  let a = hash(seed);
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(list: T[], rand: () => number): T {
  return list[Math.floor(rand() * list.length)];
}

function build(category: Category, rand: () => number): string {
  if (category === "fiction") {
    const { where, who, does } = PARTS.fiction;
    return `${pick(where, rand)}, ${pick(who, rand)} ${pick(does, rand)}.`;
  }
  if (category === "poetry") {
    const { subject, angle } = PARTS.poetry;
    return `Write a poem about ${pick(subject, rand)}. ${pick(angle, rand)}`;
  }
  const { topic, angle } = PARTS.reflection;
  return `Write about ${pick(topic, rand)}. ${pick(angle, rand)}`;
}

// The fallback prompt for a day: the same for everyone, no server needed.
export function getGeneratedPrompt(category: Category, date: Date): string {
  const rand = seeded(`${dateKey(date)}:${category}`);
  const curated = PROMPTS.filter((p) => p.category === category);
  return rand() < 0.35 ? pick(curated, rand).text : build(category, rand);
}