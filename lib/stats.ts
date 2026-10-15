import { dateKey } from "@/lib/daily-prompt";
import type { Entry } from "@/lib/storage";

const DAY = 86_400_000;

function toDayNumber(key: string): number {
  const [y, m, d] = key.split("-").map(Number);
  return Math.floor(Date.UTC(y, m - 1, d) / DAY);
}

export function totalWords(entries: Entry[]): number {
  return entries.reduce((sum, e) => sum + e.words, 0);
}

// date -> total words written that day (any kind of writing)
export function wordsByDay(entries: Entry[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const e of entries) {
    if (!e.date) continue;
    map.set(e.date, (map.get(e.date) ?? 0) + e.words);
  }
  return map;
}

// Longest run of consecutive days with a submitted daily prompt.
export function longestStreak(entries: Entry[]): number {
  const days = Array.from(
    new Set(
      entries
        .filter((e) => e.submitted && e.kind === "daily" && e.date)
        .map((e) => toDayNumber(e.date))
    )
  ).sort((a, b) => a - b);

  let best = 0;
  let run = 0;
  let prev = -Infinity;
  for (const d of days) {
    run = d === prev + 1 ? run + 1 : 1;
    best = Math.max(best, run);
    prev = d;
  }
  return best;
}

export interface DayStat {
  key: string;
  label: string;
  words: number;
}

// The last n days, oldest first, ending today.
export function lastDays(entries: Entry[], today: Date, n: number): DayStat[] {
  const map = wordsByDay(entries);
  const out: DayStat[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = dateKey(d);
    out.push({
      key,
      label: d.toLocaleDateString("en-US", { weekday: "short" }),
      words: map.get(key) ?? 0,
    });
  }
  return out;
}

export interface CalendarCell {
  key: string;
  words: number;
  future: boolean;
}

// A grid of `weeks` columns (Sunday to Saturday), ending with this week.
export function calendarCells(
  entries: Entry[],
  today: Date,
  weeks: number
): CalendarCell[] {
  const map = wordsByDay(entries);
  const start = new Date(today);
  start.setDate(start.getDate() - start.getDay() - (weeks - 1) * 7);

  const cells: CalendarCell[] = [];
  for (let i = 0; i < weeks * 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const key = dateKey(d);
    cells.push({
      key,
      words: map.get(key) ?? 0,
      future: d.getTime() > today.getTime(),
    });
  }
  return cells;
}

// 0 = nothing written, 4 = a big day.
export function level(words: number): 0 | 1 | 2 | 3 | 4 {
  if (words <= 0) return 0;
  if (words < 100) return 1;
  if (words < 250) return 2;
  if (words < 500) return 3;
  return 4;
}