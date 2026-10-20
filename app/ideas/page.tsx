"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/components/SyncProvider";
import { CATEGORIES, type Category } from "@/lib/daily-prompt";
import {
  IDEAS_PER_DAY,
  IDEA_MAX,
  IDEA_MIN,
  QUARANTINE_MS,
  listMyIdeas,
  submitIdea,
  validateIdea,
  type Idea,
} from "@/lib/community";

const DAY_MS = 24 * 60 * 60 * 1000;

function statusText(idea: Idea): string {
  if (idea.status === "removed") return "Removed";
  const eligibleAt = idea.createdAt.getTime() + QUARANTINE_MS;
  if (Date.now() < eligibleAt) {
    return `Waiting · joins the pool ${new Date(eligibleAt).toLocaleString(
      "en-US",
      { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }
    )}`;
  }
  return "In the pool";
}

export default function IdeasPage() {
  const { configured, loading, user } = useAuth();
  const userId = user?.id ?? null;

  const [category, setCategory] = useState<Category>("fiction");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [ideas, setIdeas] = useState<Idea[] | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);

  const load = useCallback(async () => {
    try {
      setIdeas(await listMyIdeas());
      setLoadFailed(false);
    } catch {
      setLoadFailed(true);
    }
  }, []);

  useEffect(() => {
    if (userId) void load();
  }, [userId, load]);

  const problem = validateIdea(text);
  const length = text.trim().length;
  const showProblem = problem && length >= IDEA_MIN;
  const usedToday = (ideas ?? []).filter(
    (i) => Date.now() - i.createdAt.getTime() < DAY_MS
  ).length;
  const left = Math.max(0, IDEAS_PER_DAY - usedToday);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!userId || problem) return;
    setBusy(true);
    setError("");
    setSuccess("");
    const result = await submitIdea(userId, category, text);
    setBusy(false);
    if (result) {
      setError(result);
      return;
    }
    setText("");
    setSuccess(
      "Thank you! Your idea will join the pool after a 24 hour review period."
    );
    void load();
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <p className="text-xs uppercase tracking-[0.2em] text-muted">Community</p>
      <h1 className="mt-2 font-serif text-4xl">Prompt ideas</h1>
      <p className="mt-3 max-w-md text-muted">
        Every day&apos;s prompt is chosen from ideas submitted by writers like
        you. Write something you&apos;d want to be asked.
      </p>

      {!configured && (
        <div className="mt-8 rounded-lg border border-line p-6 text-sm text-muted">
          Accounts aren&apos;t configured, so prompt ideas are unavailable.
        </div>
      )}

      {configured && loading && <p className="mt-8 text-muted">Loading…</p>}

      {configured && !loading && !user && (
        <div className="mt-8 rounded-lg border border-line p-8 text-center">
          <p className="text-muted">Sign in to submit a prompt idea.</p>
          <Link
            href="/account"
            className="mt-4 inline-block rounded-full bg-fg px-5 py-2 text-sm font-medium text-bg hover:opacity-80"
          >
            Sign in
          </Link>
        </div>
      )}

      {configured && !loading && user && (
        <>
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <label className="block text-sm text-muted">
              Category
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

            <div>
              <textarea
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                  setError("");
                  setSuccess("");
                }}
                maxLength={IDEA_MAX + 50}
                placeholder="A lighthouse keeper receives a letter from the sea…"
                className="h-32 w-full resize-none rounded-lg border border-line bg-bg p-4 font-serif text-lg leading-relaxed focus:border-fg focus:outline-none"
              />
              <div className="mt-1 flex justify-between text-xs text-muted">
                <span>
                  {showProblem ? problem : `At least ${IDEA_MIN} characters`}
                </span>
                <span>
                  {length} / {IDEA_MAX}
                </span>
              </div>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}
            {success && <p className="text-sm text-muted">{success}</p>}

            <div className="flex items-center justify-between">
              <span className="text-xs text-muted">
                {left} of {IDEAS_PER_DAY} left today
              </span>
              <button
                type="submit"
                disabled={busy || problem !== null || left === 0}
                className="rounded-full bg-fg px-6 py-2 text-sm font-medium text-bg hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-30"
              >
                {busy ? "Submitting…" : "Submit idea"}
              </button>
            </div>
          </form>

          <section className="mt-10 rounded-lg border border-line p-5 text-sm text-muted">
            <p className="font-medium text-fg">What makes a good idea</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>It gives a writer a starting point, not a finished story.</li>
              <li>{IDEA_MIN} to {IDEA_MAX} characters, at least four words.</li>
              <li>No links, emails or @handles, and no duplicates.</li>
              <li>New ideas wait 24 hours before they can be picked.</li>
            </ul>
          </section>

          <section className="mt-10">
            <h2 className="font-serif text-2xl">Your ideas</h2>
            {loadFailed && (
              <p className="mt-3 text-sm text-muted">
                Couldn&apos;t load your ideas right now.
              </p>
            )}
            {ideas?.length === 0 && (
              <p className="mt-3 text-sm text-muted">Nothing submitted yet.</p>
            )}
            <ul className="mt-4 space-y-3">
              {ideas?.map((idea) => (
                <li key={idea.id} className="rounded-lg border border-line p-4">
                  <p className="font-serif text-lg leading-snug">{idea.text}</p>
                  <p className="mt-2 text-xs uppercase tracking-wider text-muted">
                    {idea.category} · {statusText(idea)}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </main>
  );
}