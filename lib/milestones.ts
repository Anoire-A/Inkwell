import type { Entry } from "@/lib/storage";
import { longestStreak, totalWords } from "@/lib/stats";

export interface Milestone {
  id: string;
  title: string;
  description: string;
  current: number;
  target: number;
  earned: boolean;
}

export function getMilestones(entries: Entry[]): Milestone[] {
  const finished = entries.filter((e) => e.submitted);
  const longest = longestStreak(entries);
  const words = totalWords(entries);

  const categories = new Set(
    finished
      .filter((e) => e.kind === "daily" && e.category)
      .map((e) => e.category)
  );
  const sprints = entries.filter((e) => e.sprintMinutes && e.words > 0).length;
  const freePieces = finished.filter(
    (e) => e.kind === "free" && !e.sprintMinutes
  ).length;

  const defs = [
    { id: "first", title: "First words", description: "Finish your first piece.", current: finished.length, target: 1 },
    { id: "streak3", title: "Three in a row", description: "Finish the daily prompt 3 days running.", current: longest, target: 3 },
    { id: "streak7", title: "One full week", description: "A 7-day streak.", current: longest, target: 7 },
    { id: "streak30", title: "A month of habit", description: "A 30-day streak.", current: longest, target: 30 },
    { id: "words1k", title: "1,000 words", description: "Write 1,000 words in total.", current: words, target: 1000 },
    { id: "words10k", title: "10,000 words", description: "Write 10,000 words in total.", current: words, target: 10000 },
    { id: "allthree", title: "Every voice", description: "Finish a daily prompt in fiction, poetry, and reflection.", current: categories.size, target: 3 },
    { id: "sprint", title: "Beat the clock", description: "Complete a writing sprint.", current: sprints, target: 1 },
    { id: "free", title: "Off the leash", description: "Finish a piece of free writing.", current: freePieces, target: 1 },
  ];

  return defs.map((d) => ({ ...d, earned: d.current >= d.target }));
}