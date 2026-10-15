import type { Category } from "@/lib/daily-prompt";

export interface Entry {
  id: string;
  kind: "daily" | "free";
  date: string; // YYYY-MM-DD
  category: Category | null; // null for free writing
  title: string; // used by free writing
  prompt: string;
  text: string;
  words: number;
  goal: number;
  completed: boolean; // reached the word goal
  submitted: boolean; // finished by the writer
  sprintMinutes?: number; // set when the piece was written in a sprint
}

const KEY = "inkwell:entries";

export function dailyId(date: string, category: Category): string {
  return `daily-${date}-${category}`;
}

// Fills in missing fields so entries saved by older versions still work.
function normalize(e: Partial<Entry>): Entry {
  const kind = e.kind ?? "daily";
  const date = e.date ?? "";
  const category = e.category ?? (kind === "daily" ? "fiction" : null);
  return {
    id: e.id ?? `daily-${date}-${category}`,
    kind,
    date,
    category,
    title: e.title ?? "",
    prompt: e.prompt ?? "",
    text: e.text ?? "",
    words: e.words ?? 0,
    goal: e.goal ?? 0,
    completed: e.completed ?? false,
    submitted: e.submitted ?? e.completed ?? false,
    sprintMinutes: e.sprintMinutes,
  };
}

export function loadEntries(): Entry[] {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as Partial<Entry>[]) : [];
    return parsed.map(normalize);
  } catch {
    return [];
  }
}

function writeEntries(entries: Entry[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(entries));
  } catch {
    // storage full or blocked; ignore for now
  }
}

export function getEntry(id: string): Entry | undefined {
  return loadEntries().find((e) => e.id === id);
}

// Saves (or updates) an entry. Empty entries are not kept.
export function saveEntry(entry: Entry): void {
  const entries = loadEntries().filter((e) => e.id !== entry.id);
  if (entry.text.trim()) entries.push(entry);
  writeEntries(entries);
}

export function deleteEntry(id: string): void {
  writeEntries(loadEntries().filter((e) => e.id !== id));
}