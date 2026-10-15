"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { PROMPTS } from "@/data/prompts";
import { dateKey } from "@/lib/daily-prompt";
import { deleteEntry, saveEntry } from "@/lib/storage";

const DURATIONS = [5, 10, 15];

function countWords(text: string): number {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function SprintPage() {
  const [phase, setPhase] = useState<"setup" | "running" | "done">("setup");
  const [minutes, setMinutes] = useState(10);
  const [usePrompt, setUsePrompt] = useState(true);
  const [prompt, setPrompt] = useState("");
  const [text, setText] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);
  const [idle, setIdle] = useState(false);
  const [id, setId] = useState("");

  const endRef = useRef(0);
  const lastTypedRef = useRef(0);
  const audioRef = useRef<AudioContext | null>(null);

  // Tick the clock. Using the end timestamp keeps it accurate
  // even if the browser slows down a background tab.
  useEffect(() => {
    if (phase !== "running") return;
    const timer = setInterval(() => {
      const left = Math.max(0, Math.ceil((endRef.current - Date.now()) / 1000));
      setTimeLeft(left);
      setIdle(Date.now() - lastTypedRef.current > 8000);
    }, 250);
    return () => clearInterval(timer);
  }, [phase]);

  // When the clock hits zero, finish with a chime.
  useEffect(() => {
    if (phase === "running" && timeLeft === 0) finish(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, timeLeft]);

  // Release the audio context when leaving the page.
  useEffect(() => {
    return () => {
      audioRef.current?.close().catch(() => {});
    };
  }, []);

  function playChime() {
    try {
      const ctx = audioRef.current;
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = 528;
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.6);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.7);
    } catch {
      // no audio available; the screen change is signal enough
    }
  }

  function start() {
    // Created inside the click so the browser allows sound later.
    try {
      audioRef.current = new AudioContext();
    } catch {
      audioRef.current = null;
    }
    const picked = usePrompt
      ? PROMPTS[Math.floor(Math.random() * PROMPTS.length)].text
      : "";
    setId(crypto.randomUUID());
    setPrompt(picked);
    setText("");
    setIdle(false);
    setTimeLeft(minutes * 60);
    endRef.current = Date.now() + minutes * 60_000;
    lastTypedRef.current = Date.now();
    setPhase("running");
  }

  function finish(chime: boolean) {
    if (chime) playChime();
    saveEntry({
      id,
      kind: "free",
      date: dateKey(new Date()),
      category: null,
      title: `Sprint · ${minutes} min`,
      prompt,
      text,
      words: countWords(text),
      goal: 0,
      completed: true,
      submitted: true,
      sprintMinutes: minutes,
    });
    setPhase("done");
  }

  function handleChange(value: string) {
    setText(value);
    lastTypedRef.current = Date.now();
    setIdle(false);
  }

  function reset() {
    setText("");
    setPhase("setup");
  }

  function discard() {
    deleteEntry(id);
    reset();
  }

  const words = countWords(text);
  const elapsedPct =
    minutes > 0 ? 100 - (timeLeft / (minutes * 60)) * 100 : 0;

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      {phase === "setup" && (
        <div className="animate-fade">
          <p className="text-xs uppercase tracking-[0.2em] text-muted">
            Sprint
          </p>
          <h1 className="mt-2 font-serif text-4xl">Write without stopping</h1>
          <p className="mt-4 max-w-md text-muted">
            Pick a length and start. Don&apos;t edit and don&apos;t overthink.
            When the time is up, you&apos;ll hear a soft chime and your piece is
            saved to My works.
          </p>

          <div className="mt-8 flex gap-2 text-sm">
            {DURATIONS.map((d) => (
              <button
                key={d}
                onClick={() => setMinutes(d)}
                className={`rounded-full border px-5 py-2 ${
                  minutes === d
                    ? "border-fg bg-fg text-bg"
                    : "border-line text-muted hover:text-fg"
                }`}
              >
                {d} min
              </button>
            ))}
          </div>

          <label className="mt-6 flex items-center gap-2 text-sm text-muted">
            <input
              type="checkbox"
              checked={usePrompt}
              onChange={(e) => setUsePrompt(e.target.checked)}
            />
            Give me a random prompt
          </label>

          <button
            onClick={start}
            className="mt-8 rounded-full bg-fg px-7 py-3 text-sm font-medium text-bg hover:opacity-80"
          >
            Start sprint
          </button>
        </div>
      )}

      {phase === "running" && (
        <div className="animate-fade">
          <div className="flex items-center justify-between">
            <p className="font-serif text-5xl tabular-nums">
              {formatTime(timeLeft)}
            </p>
            <button
              onClick={() => finish(false)}
              className="text-sm text-muted hover:text-fg"
            >
              End early
            </button>
          </div>

          <div className="mt-3 h-1 w-full overflow-hidden rounded bg-line">
            <div
              className="h-full bg-fg transition-all"
              style={{ width: `${elapsedPct}%` }}
            />
          </div>

          {prompt && (
            <div className="mt-6 border-l-2 border-fg pl-4">
              <p className="text-xs uppercase tracking-[0.2em] text-muted">
                Prompt
              </p>
              <p className="mt-1 font-serif text-xl leading-snug">{prompt}</p>
            </div>
          )}

          <textarea
            autoFocus
            value={text}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="Just start…"
            className="mt-6 h-[50vh] w-full resize-none rounded-lg border border-line bg-bg p-5 font-serif text-lg leading-relaxed focus:border-fg focus:outline-none"
          />

          <div className="mt-3 flex justify-between text-sm text-muted">
            <span>
              {words} word{words === 1 ? "" : "s"}
            </span>
            <span
              className={`transition-opacity duration-500 ${
                idle ? "opacity-100" : "opacity-0"
              }`}
            >
              Keep going. Don&apos;t stop to edit.
            </span>
          </div>
        </div>
      )}

      {phase === "done" && (
        <div className="animate-pop text-center">
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

          <h1 className="mt-5 font-serif text-4xl">Sprint complete</h1>

          {words > 0 ? (
            <>
              <p className="mt-2 text-muted">
                {words} words in {minutes} minutes · about{" "}
                {Math.round(words / minutes)} words a minute
              </p>
              <p className="mt-1 text-sm text-muted">Saved to My works.</p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link
                  href={`/compose/${id}`}
                  className="rounded-full bg-fg px-5 py-2 text-sm font-medium text-bg hover:opacity-80"
                >
                  Keep editing
                </Link>
                <Link
                  href="/history"
                  className="rounded-full border border-line px-5 py-2 text-sm hover:bg-soft"
                >
                  View my works
                </Link>
                <button
                  onClick={reset}
                  className="rounded-full border border-line px-5 py-2 text-sm hover:bg-soft"
                >
                  New sprint
                </button>
              </div>
              <button
                onClick={discard}
                className="mt-6 text-sm text-muted hover:text-fg"
              >
                Discard this sprint
              </button>
            </>
          ) : (
            <>
              <p className="mt-2 text-muted">
                Nothing written, so nothing was saved.
              </p>
              <button
                onClick={reset}
                className="mt-8 rounded-full bg-fg px-6 py-2 text-sm font-medium text-bg hover:opacity-80"
              >
                Try again
              </button>
            </>
          )}
        </div>
      )}
    </main>
  );
}