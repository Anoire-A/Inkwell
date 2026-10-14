import Link from "next/link";

const FEATURES = [
  {
    title: "Daily prompt",
    body: "One prompt a day in fiction, poetry, or reflection. Choose your word goal and write.",
  },
  {
    title: "My works",
    body: "Everything you finish is kept in one place, with your word counts and your streak.",
  },
  {
    title: "Coming soon",
    body: "Publish your work, share prompt ideas, and write from prompts other writers submit.",
  },
];

export default function Home() {
  return (
    <main>
      <section className="mx-auto max-w-3xl px-6 pb-20 pt-24 text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-muted">
          A daily writing habit
        </p>
        <h1 className="mt-6 font-serif text-5xl leading-tight sm:text-7xl">
          Write a little.
          <br />
          Every day.
        </h1>
        <p className="mx-auto mt-6 max-w-md text-lg text-muted">
          One prompt, a word goal you choose, and a streak to keep you coming
          back.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link
            href="/write"
            className="rounded-full bg-fg px-7 py-3 text-sm font-medium text-bg hover:opacity-80"
          >
            Begin today&apos;s prompt
          </Link>
          <Link
            href="/history"
            className="rounded-full border border-line px-7 py-3 text-sm hover:bg-soft"
          >
            Read my works
          </Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-px border-y border-line bg-line px-0 sm:grid-cols-3">
        {FEATURES.map((f) => (
          <div key={f.title} className="bg-bg p-8">
            <h2 className="font-serif text-2xl">{f.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">{f.body}</p>
          </div>
        ))}
      </section>
    </main>
  );
}