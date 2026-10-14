"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { loadEntries, type Entry } from "@/lib/storage";

export default function HistoryPage() {
  const [entries, setEntries] = useState<Entry[] | null>(null);

  useEffect(() => {
    const sorted = loadEntries().sort((a, b) =>
      a.date < b.date ? 1 : a.date > b.date ? -1 : 0
    );
    setEntries(sorted);
  }, []);

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <p className="text-xs uppercase tracking-[0.2em] text-muted">Archive</p>
      <h1 className="mt-2 font-serif text-4xl">My works</h1>

      {entries === null && <p className="mt-8 text-muted">Loading…</p>}

      {entries?.length === 0 && (
        <div className="mt-8 rounded-lg border border-line p-8 text-center">
          <p className="text-muted">Nothing here yet.</p>
          <Link
            href="/write"
            className="mt-4 inline-block rounded-full bg-fg px-5 py-2 text-sm font-medium text-bg hover:opacity-80"
          >
            Write something
          </Link>
        </div>
      )}

      <ul className="mt-8 space-y-5">
        {entries?.map((e) => (
          <li
            key={`${e.date}-${e.category}`}
            className="rounded-lg border border-line p-6"
          >
            <div className="flex items-center justify-between text-xs uppercase tracking-wider text-muted">
              <span>
                {e.date} · {e.category}
              </span>
              <span>
                {e.words}/{e.goal} words ·{" "}
                {e.submitted ? "Submitted" : "Draft"}
              </span>
            </div>
            <p className="mt-3 font-serif italic text-muted">{e.prompt}</p>
            <p className="mt-3 whitespace-pre-wrap font-serif text-lg leading-relaxed">
              {e.text}
            </p>
          </li>
        ))}
      </ul>
    </main>
  );
}