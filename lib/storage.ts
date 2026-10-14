import type { Category } from "@/lib/daily-prompt";

export interface Entry {
  date: string; // YYYY-MM-DD
  category: Category;
  prompt: string;
  text: string;
  words: number;
  goal: number;
  completed: boolean;
}

const KEY = "inkwell:entries";

export function loadEntries(): Entry[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Entry[]) : [];
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