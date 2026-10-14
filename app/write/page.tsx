"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  CATEGORIES,
  dateKey,
  getDailyPrompt,
  type Category,
} from "@/lib/daily-prompt";
import { loadEntries, saveEntry } from "@/lib/storage";
import { calculateStreak } from "@/lib/streak";

const GOALS = [100, 250, 500];

function countWords(text: string): number {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

export default function WritePage() {
  const [today, setToday] = useState<Date | null>(null);
  const [category, setCategory] = useState<Category>("fiction");
  const [goal, setGoal] = useState(250);
  const [text, setText] = useState("");
  const [streak, setStreak] = useState(0);

  // Date is set after mount so the server and browser don't disagree.
  useEffect(() => {
    setToday(new Date());
  }, []);

  const prompt = today ? getDailyPrompt(category, today) : null;

  // Load today's saved entry whenever the day or category changes.
  useEffect(() => {
    if (!today) return;
    const entries = loadEntries();
    const key = dateKey(today);
    const existing = entries.find(
      (e) => e.date === key && e.category === category
    );
    setText(existing?.text ?? "");
    setStreak(calculateStreak(entries, today));
  }, [today, category]);

  // Save the entry and refresh the streak.
  function persist(nextText: string, nextGoal: number) {
    if (!today || !prompt) return;
    const w = countWords(nextText);
    saveEntry({
      date: dateKey(today),
      category,
      prompt: prompt.text,
      text: nextText,
      words: w,
      goal: nextGoal,
      completed: w >= nextGoal,
    });
    setStreak(calculateStreak(loadEntries(), today));
  }

  function handleTextChange(value: string) {
    setText(value);
    persist(value, goal);
  }

  function handleGoalChange(value: number) {
    setGoal(value);
    persist(text, value);
  }

  const words = countWords(text);
  const progress = Math.min(100, Math.round((words / goal) * 100));
  const goalReached = words >= goal;

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <div className="flex items-center justify-between text-sm">
        <Link href="/" className="opacity-70 hover:opacity-100">
          ← Home
        </Link>
        <Link href="/history" className="opacity-70 hover:opacity-100">
          History →
        </Link>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <h1 className="text-3xl font-semibold">Today&apos;s writing</h1>
        <div className="rounded-full border border-gray-500 px-3 py-1 text-sm">
          🔥 {streak} day{streak === 1 ? "" : "s"}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-4">
        <label className="text-sm">
          Type
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
            className="ml-2 rounded border border-gray-400 bg-transparent px-2 py-1"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value} className="text-black">
                {c.label}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm">
          Daily goal
          <select
            value={goal}
            onChange={(e) => handleGoalChange(Number(e.target.value))}
            className="ml-2 rounded border border-gray-400 bg-transparent px-2 py-1"
          >
            {GOALS.map((g) => (
              <option key={g} value={g} className="text-black">
                {g} words
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-6 rounded-lg border border-gray-400 p-4">
        <p className="text-xs uppercase tracking-wide opacity-60">Prompt</p>
        <p className="mt-1 text-lg">{prompt ? prompt.text : "Loading…"}</p>
      </div>

      <textarea
        value={text}
        onChange={(e) => handleTextChange(e.target.value)}
        placeholder="Start writing…"
        className="mt-6 h-72 w-full resize-y rounded-lg border border-gray-400 bg-transparent p-4 leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />

      <div className="mt-4">
        <div className="flex justify-between text-sm">
          <span>
            {words} / {goal} words
          </span>
          <span>{goalReached ? "Goal reached! 🎉" : `${progress}%`}</span>
        </div>
        <div className="mt-1 h-2 w-full overflow-hidden rounded bg-gray-300">
          <div
            className={`h-full transition-all ${
              goalReached ? "bg-green-500" : "bg-indigo-500"
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </main>
  );
}