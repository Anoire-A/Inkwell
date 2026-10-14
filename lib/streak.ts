import { dateKey } from "@/lib/daily-prompt";
import type { Entry } from "@/lib/storage";

// Consecutive days with at least one completed entry.
// If today isn't finished yet, the streak is still alive from yesterday.
export function calculateStreak(entries: Entry[], today: Date): number {
  const done = new Set(entries.filter((e) => e.completed).map((e) => e.date));
  const cursor = new Date(today);

  if (!done.has(dateKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }

  let streak = 0;
  while (done.has(dateKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}