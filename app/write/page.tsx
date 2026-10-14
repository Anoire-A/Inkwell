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
  const [submitted, setSubmitted] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const [focus, setFocus] = useState(false);

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
    setSubmitted(existing?.submitted ?? false);
    if (existing) setGoal(existing.goal);
    setStreak(calculateStreak(entries, today));
  }, [today, category]);

  // Escape closes focus mode or the celebration.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setFocus(false);
        setCelebrating(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function persist(nextText: string, nextGoal: number, nextSubmitted: boolean) {
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
      submitted: nextSubmitted,
    });
    setStreak(calculateStreak(loadEntries(), today));
  }

  function handleTextChange(value: string) {
    setText(value);
    persist(value, goal, false);
  }

  function handleGoalChange(value: number) {
    setGoal(value);
    persist(text, value, submitted);
  }

  function handleSubmit() {
    persist(text, goal, true);
    setSubmitted(true);
    setFocus(false);
    setCelebrating(true);
  }

  function handleUnlock() {
    persist(text, goal, false);
    setSubmitted(false);
  }

  const words = countWords(text);
  const progress = Math.min(100, Math.round((words / goal) * 100));
  const goalReached = words >= goal;
  const dateLabel = today
    ? today.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      })
    : "";

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted">
            {dateLabel}
          </p>
          <h1 className="mt-2 font-serif text-4xl">Today&apos;s writing</h1>
        </div>
        <div className="rounded-full border border-line px-4 py-1.5 text-sm">
          Streak · {streak} day{streak === 1 ? "" : "s"}
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-6 text-sm">
        <label className="text-muted">
          Type
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
            className="ml-2 rounded-md border border-line bg-bg px-2 py-1 text-fg"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </label>

        <label className="text-muted">
          Daily goal
          <select
            value={goal}
            disabled={submitted}
            onChange={(e) => handleGoalChange(Number(e.target.value))}
            className="ml-2 rounded-md border border-line bg-bg px-2 py-1 text-fg disabled:opacity-50"
          >
            {GOALS.map((g) => (
              <option key={g} value={g}>
                {g} words
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* In focus mode this block fills the whole screen. */}
      <section
        className={
          focus
            ? "fixed inset-0 z-50 overflow-auto bg-bg px-6 py-10"
            : "mt-8"
        }
      >
        <div className="mx-auto max-w-2xl">
          <div className="border-l-2 border-fg pl-4">
            <p className="text-xs uppercase tracking-[0.2em] text-muted">
              Prompt
            </p>
            <p className="mt-1 font-serif text-xl leading-snug">
              {prompt ? prompt.text : "Loading…"}
            </p>
          </div>

          <textarea
            value={text}
            readOnly={submitted}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder="Start writing…"
            className={`mt-6 w-full resize-none rounded-lg border border-line bg-bg p-5 font-serif text-lg leading-relaxed focus:border-fg focus:outline-none ${
              focus ? "h-[60vh]" : "h-80"
            } ${submitted ? "bg-soft text-muted" : ""}`}
          />

          <div className="mt-4">
            <div className="flex justify-between text-sm text-muted">
              <span>
                {words} / {goal} words
              </span>
              <span>
                {submitted
                  ? "Submitted"
                  : goalReached
                  ? "Goal reached"
                  : `${progress}%`}
              </span>
            </div>
            <div className="mt-2 h-1 w-full overflow-hidden rounded bg-line">
              <div
                className="h-full bg-fg transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <button
              onClick={() => setFocus((f) => !f)}
              className="text-sm text-muted hover:text-fg"
            >
              {focus ? "Exit focus (Esc)" : "Focus mode"}
            </button>

            {submitted ? (
              <button
                onClick={handleUnlock}
                className="rounded-full border border-line px-5 py-2 text-sm hover:bg-soft"
              >
                Unlock to edit
              </button>
            ) : (
              <div className="flex items-center gap-4">
                {!goalReached && (
                  <span className="text-xs text-muted">
                    {goal - words} more word{goal - words === 1 ? "" : "s"} to
                    finish
                  </span>
                )}
                <button
                  onClick={handleSubmit}
                  disabled={!goalReached}
                  className="rounded-full bg-fg px-6 py-2 text-sm font-medium text-bg hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  Finish for today
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {celebrating && (
        <div
          className="animate-fade fixed inset-0 z-[60] flex items-center justify-center bg-black/60 px-6"
          onClick={() => setCelebrating(false)}
        >
          <div
            className="animate-pop w-full max-w-sm rounded-2xl border border-line bg-bg p-8 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <svg
              viewBox="0 0 24 24"
              className="mx-auto h-16 w-16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path className="draw-check" d="M7 12.5l3.2 3.2L17 9" />
            </svg>
            <h2 className="mt-5 font-serif text-3xl">Done for today</h2>
            <p className="mt-2 text-sm text-muted">
              {words} words · {streak}-day streak
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Link
                href="/history"
                className="rounded-full bg-fg px-5 py-2 text-sm font-medium text-bg hover:opacity-80"
              >
                View my works
              </Link>
              <button
                onClick={() => setCelebrating(false)}
                className="rounded-full border border-line px-5 py-2 text-sm hover:bg-soft"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}