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
  updatedAt?: number; // ms since 1970; the newer copy wins when syncing
}

export interface ChangeDetail {
  type: "save" | "delete";
  id: string;
}

const KEY = "inkwell:entries";
export const CHANGE_EVENT = "inkwell:local-change";

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
    updatedAt: e.updatedAt ?? 0,
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

// Tells the sync layer that something changed and needs uploading.
function emit(type: ChangeDetail["type"], id: string): void {
  try {
    window.dispatchEvent(
      new CustomEvent<ChangeDetail>(CHANGE_EVENT, { detail: { type, id } })
    );
  } catch {
    // not in a browser; nothing to notify
  }
}

export function getEntry(id: string): Entry | undefined {
  return loadEntries().find((e) => e.id === id);
}

// Saves (or updates) an entry. Empty entries are not kept.
export function saveEntry(entry: Entry): void {
  const entries = loadEntries().filter((e) => e.id !== entry.id);
  if (entry.text.trim()) entries.push({ ...entry, updatedAt: Date.now() });
  writeEntries(entries);
  emit("save", entry.id);
}

export function deleteEntry(id: string): void {
  writeEntries(loadEntries().filter((e) => e.id !== id));
  emit("delete", id);
}

// The two functions below are for the sync layer. They don't emit events,
// so they never trigger an upload.
export function replaceEntries(entries: Entry[]): void {
  writeEntries(entries);
}

export function clearLocalEntries(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}