"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { loadEntries, type Entry } from "@/lib/storage";

type Filter = "all" | "daily" | "free";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "daily", label: "Daily prompts" },
  { value: "free", label: "Free writing" },
];

export default function HistoryPage() {
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    const sorted = loadEntries().sort((a, b) =>
      a.date < b.date ? 1 : a.date > b.date ? -1 : 0
    );
    setEntries(sorted);
  }, []);

  const visible = entries?.filter((e) => filter === "all" || e.kind === filter);

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted">
            Archive
          </p>
          <h1 className="mt-2 font-serif text-4xl">My works</h1>
        </div>
        <Link
          href="/compose/new"
          className="rounded-full bg-fg px-5 py-2 text-sm font-medium text-bg hover:opacity-80"
        >
          New piece
        </Link>
      </div>

      <div className="mt-8 flex gap-2 text-sm">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`rounded-full border px-4 py-1 ${
              filter === f.value
                ? "border-fg bg-fg text-bg"
                : "border-line text-muted hover:text-fg"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {entries === null && <p className="mt-8 text-muted">Loading…</p>}

      {visible?.length === 0 && (
        <div className="mt-8 rounded-lg border border-line p-8 text-center">
          <p className="text-muted">Nothing here yet.</p>
        </div>
      )}

      <ul className="mt-8 space-y-5">
        {visible?.map((e) => (
          <li key={e.id} className="rounded-lg border border-line p-6">
            <div className="flex items-center justify-between text-xs uppercase tracking-wider text-muted">
              <span>
                {e.date} · {e.kind === "daily" ? e.category : "free writing"}
              </span>
              <span>
                {e.words}
                {e.kind === "daily" ? `/${e.goal}` : ""} words ·{" "}
                {e.submitted ? "Finished" : "Draft"}
              </span>
            </div>

            {e.kind === "free" && (
              <h2 className="mt-3 font-serif text-2xl">
                {e.title || "Untitled"}
              </h2>
            )}
            {e.prompt && (
              <p className="mt-3 font-serif italic text-muted">{e.prompt}</p>
            )}

            <p className="mt-3 whitespace-pre-wrap font-serif text-lg leading-relaxed">
              {e.text}
            </p>

            {e.kind === "free" && (
              <Link
                href={`/compose/${e.id}`}
                className="mt-4 inline-block text-sm text-muted underline underline-offset-4 hover:text-fg"
              >
                Edit
              </Link>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}