"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { dateKey } from "@/lib/daily-prompt";
import { deleteEntry, getEntry, saveEntry } from "@/lib/storage";
import { Suspense } from "react";

function countWords(text: string): number {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

function ComposeEditor() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;

  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [date, setDate] = useState("");
  const [finished, setFinished] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // "/compose/new" creates a fresh piece with its own id.
    if (id === "new") {
      router.replace(`/compose/${crypto.randomUUID()}`);
      return;
    }
    const existing = getEntry(id);
    setTitle(existing?.title ?? "");
    setText(existing?.text ?? "");
    setDate(existing?.date ?? dateKey(new Date()));
    setFinished(existing?.submitted ?? false);
    setReady(true);
  }, [id, router]);

  function persist(nextTitle: string, nextText: string, nextFinished: boolean) {
    saveEntry({
      id,
      kind: "free",
      date,
      category: null,
      title: nextTitle,
      prompt: "",
      text: nextText,
      words: countWords(nextText),
      goal: 0,
      completed: true,
      submitted: nextFinished,
    });
  }

  function handleTitle(value: string) {
    setTitle(value);
    persist(value, text, finished);
  }

  function handleText(value: string) {
    setText(value);
    persist(title, value, false);
    setFinished(false);
  }

  function handleFinish() {
    persist(title, text, true);
    setFinished(true);
    router.push("/history");
  }

  function handleDelete() {
    if (window.confirm("Delete this piece? This can't be undone.")) {
      deleteEntry(id);
      router.push("/history");
    }
  }

  if (!ready) return null;

  const words = countWords(text);

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <Link href="/history" className="text-sm text-muted hover:text-fg">
        ← My works
      </Link>

      <p className="mt-6 text-xs uppercase tracking-[0.2em] text-muted">
        Free writing · {date}
      </p>

      <input
        value={title}
        onChange={(e) => handleTitle(e.target.value)}
        placeholder="Untitled"
        className="mt-2 w-full bg-transparent font-serif text-4xl placeholder:text-muted focus:outline-none"
      />

      <textarea
        value={text}
        onChange={(e) => handleText(e.target.value)}
        placeholder="Write anything…"
        className="mt-6 h-96 w-full resize-none rounded-lg border border-line bg-bg p-5 font-serif text-lg leading-relaxed focus:border-fg focus:outline-none"
      />

      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm text-muted">
          {words} word{words === 1 ? "" : "s"} ·{" "}
          {finished ? "Finished" : "Draft, saved automatically"}
        </span>
        <div className="flex items-center gap-4">
          <button
            onClick={handleDelete}
            className="text-sm text-muted hover:text-fg"
          >
            Delete
          </button>
          <button
            onClick={handleFinish}
            disabled={!text.trim()}
            className="rounded-full bg-fg px-6 py-2 text-sm font-medium text-bg hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-30"
          >
            Mark as finished
          </button>
        </div>
      </div>
    </main>
  );
}

export default function ComposePage() {
  return (
    <Suspense fallback={null}>
      <ComposeEditor />
    </Suspense>
  );
}