import type { Category } from "@/lib/daily-prompt";

export interface Entry {
  date: string; // YYYY-MM-DD
  category: Category;
  prompt: string;
  text: string;
  words: number;
  goal: number;
  completed: boolean; // reached the word goal
  submitted: boolean; // the writer pressed "Finish for today"
}

const KEY = "inkwell:entries";

export function loadEntries(): Entry[] {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as Entry[]) : [];
    // Entries saved before the submit button existed count as submitted if they hit the goal.
    return parsed.map((e) => ({ ...e, submitted: e.submitted ?? e.completed }));
  } catch {
    return [];
  }
}

export function saveEntry(entry: Entry): void {
  const entries = loadEntries().filter(
    (e) => !(e.date === entry.date && e.category === entry.category)
  );
  if (entry.text.trim()) entries.push(entry);
  try {
    localStorage.setItem(KEY, JSON.stringify(entries));
  } catch {
    // storage full or blocked; ignore for now
  }
}