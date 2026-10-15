"use client";

import { useEffect, useState } from "react";
import { getMilestones } from "@/lib/milestones";
import { loadEntries, type Entry } from "@/lib/storage";
import {
  calendarCells,
  lastDays,
  level,
  longestStreak,
  totalWords,
} from "@/lib/stats";
import { calculateStreak } from "@/lib/streak";

const OPACITY = [0, 0.25, 0.45, 0.7, 1];
const WEEKS = 26;

export default function StatsPage() {
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [today, setToday] = useState<Date | null>(null);

  useEffect(() => {
    setEntries(loadEntries());
    setToday(new Date());
  }, []);

  if (!entries || !today) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-12">
        <p className="text-muted">Loading…</p>
      </main>
    );
  }

  const last14 = lastDays(entries, today, 14);
  const prevWeekWords = last14.slice(0, 7).reduce((s, d) => s + d.words, 0);
  const week = last14.slice(7);
  const weekWords = week.reduce((s, d) => s + d.words, 0);
  const daysWritten = week.filter((d) => d.words > 0).length;
  const maxDay = Math.max(...week.map((d) => d.words), 1);
  const diff = weekWords - prevWeekWords;

  const cells = calendarCells(entries, today, WEEKS);
  const milestones = getMilestones(entries);
  const earnedCount = milestones.filter((m) => m.earned).length;

  const cards = [
    { label: "Total words", value: totalWords(entries).toLocaleString() },
    { label: "Current streak", value: `${calculateStreak(entries, today)} d` },
    { label: "Longest streak", value: `${longestStreak(entries)} d` },
    { label: "Finished pieces", value: entries.filter((e) => e.submitted).length },
  ];

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <p className="text-xs uppercase tracking-[0.2em] text-muted">Progress</p>
      <h1 className="mt-2 font-serif text-4xl">Stats</h1>

      {/* Headline numbers */}
      <div className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-bg p-5">
            <p className="text-xs uppercase tracking-wider text-muted">
              {c.label}
            </p>
            <p className="mt-2 font-serif text-3xl">{c.value}</p>
          </div>
        ))}
      </div>

      {/* Weekly summary */}
      <section className="mt-12">
        <h2 className="font-serif text-2xl">This week</h2>
        <p className="mt-1 text-sm text-muted">
          {weekWords.toLocaleString()} words across {daysWritten} day
          {daysWritten === 1 ? "" : "s"}
          {prevWeekWords > 0 || weekWords > 0
            ? ` · ${diff >= 0 ? "+" : "−"}${Math.abs(diff).toLocaleString()} vs last week`
            : ""}
        </p>

        <div className="mt-6 flex h-36 items-end gap-3 rounded-lg border border-line p-4">
          {week.map((d) => (
            <div
              key={d.key}
              className="flex h-full flex-1 flex-col items-center justify-end gap-2"
            >
              <span className="text-xs text-muted">
                {d.words > 0 ? d.words : ""}
              </span>
              <div
                className={`w-full rounded-sm ${d.words > 0 ? "bg-fg" : "bg-line"}`}
                style={{
                  height: d.words > 0 ? `${(d.words / maxDay) * 70}%` : "4px",
                }}
              />
              <span className="text-xs text-muted">{d.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Calendar */}
      <section className="mt-12">
        <h2 className="font-serif text-2xl">Days written</h2>
        <p className="mt-1 text-sm text-muted">The last {WEEKS} weeks.</p>

        <div className="mt-6 overflow-x-auto rounded-lg border border-line p-4">
          <div
            style={{
              display: "grid",
              gridTemplateRows: "repeat(7, 14px)",
              gridAutoFlow: "column",
              gridAutoColumns: "14px",
              gap: "4px",
              width: "max-content",
            }}
          >
            {cells.map((c) => {
              const lv = level(c.words);
              return (
                <div
                  key={c.key}
                  title={`${c.key}: ${c.words} words`}
                  className={`rounded-[3px] ${
                    lv === 0 ? "border border-line bg-soft" : "bg-fg"
                  }`}
                  style={{
                    opacity: lv === 0 ? 1 : OPACITY[lv],
                    visibility: c.future ? "hidden" : "visible",
                  }}
                />
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-end gap-1.5 text-xs text-muted">
            <span>Less</span>
            {[0, 1, 2, 3, 4].map((lv) => (
              <div
                key={lv}
                className={`h-3.5 w-3.5 rounded-[3px] ${
                  lv === 0 ? "border border-line bg-soft" : "bg-fg"
                }`}
                style={{ opacity: lv === 0 ? 1 : OPACITY[lv] }}
              />
            ))}
            <span>More</span>
          </div>
        </div>
      </section>

      {/* Milestones */}
      <section className="mt-12">
        <h2 className="font-serif text-2xl">Milestones</h2>
        <p className="mt-1 text-sm text-muted">
          {earnedCount} of {milestones.length} earned
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {milestones.map((m) => (
            <div
              key={m.id}
              className={`rounded-lg border p-5 ${
                m.earned ? "border-fg" : "border-line"
              }`}
            >
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full border ${
                  m.earned
                    ? "border-fg bg-fg text-bg"
                    : "border-line text-muted"
                }`}
              >
                {m.earned ? (
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12.5l4.2 4.2L19 7" />
                  </svg>
                ) : (
                  <span className="text-xs">
                    {Math.round((m.current / m.target) * 100)}%
                  </span>
                )}
              </div>
              <h3
                className={`mt-4 font-serif text-lg ${
                  m.earned ? "" : "text-muted"
                }`}
              >
                {m.title}
              </h3>
              <p className="mt-1 text-sm text-muted">{m.description}</p>
              {!m.earned && (
                <div className="mt-4">
                  <div className="h-1 w-full overflow-hidden rounded bg-line">
                    <div
                      className="h-full bg-fg"
                      style={{ width: `${(m.current / m.target) * 100}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-muted">
                    {m.current.toLocaleString()} / {m.target.toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}