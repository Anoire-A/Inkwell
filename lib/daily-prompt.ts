import { PROMPTS, type Category, type Prompt } from "@/data/prompts";

export type { Category };

export const CATEGORIES: { value: Category; label: string }[] = [
  { value: "fiction", label: "Fiction" },
  { value: "poetry", label: "Poetry" },
  { value: "reflection", label: "Reflection" },
];

// Days since 1970, using the user's local calendar date.
function dayNumber(date: Date): number {
  return Math.floor(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000
  );
}

// Same date + same category = same prompt, every time. No database needed.
export function getDailyPrompt(category: Category, date: Date): Prompt {
  const pool = PROMPTS.filter((p) => p.category === category);
  return pool[dayNumber(date) % pool.length];
}

// "2026-10-14" style key, used for saving drafts.
export function dateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}