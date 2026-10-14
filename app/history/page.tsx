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
    <main className="mx-auto max-w-2xl px-4 py-10">
      <Link href="/write" className="text-sm opacity-70 hover:opacity-100">
        ← Back to writing
      </Link>

      <h1 className="mt-4 text-3xl font-semibold">Your history</h1>

      {entries === null && <p className="mt-6 opacity-70">Loading…</p>}

      {entries?.length === 0 && (
        <p className="mt-6 opacity-70">
          Nothing here yet. Write something and it will show up.
        </p>
      )}

      <ul className="mt-6 space-y-4">
        {entries?.map((e) => (
          <li
            key={`${e.date}-${e.category}`}
            className="rounded-lg border border-gray-400 p-4"
          >
            <div className="flex items-center justify-between text-sm">
              <span className="opacity-70">
                {e.date} · {e.category}
              </span>
              <span>
                {e.words}/{e.goal} words {e.completed ? "✅" : ""}
              </span>
            </div>
            <p className="mt-2 text-sm italic opacity-70">{e.prompt}</p>
            <p className="mt-2 whitespace-pre-wrap">{e.text}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}