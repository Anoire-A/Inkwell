import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-4 text-center">
      <h1 className="text-5xl font-bold">Inkwell</h1>
      <p className="mt-4 text-lg opacity-80">
        A daily writing habit. One prompt, a few words, every day.
      </p>
      <Link
        href="/write"
        className="mt-8 rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white hover:bg-indigo-500"
      >
        Start writing
      </Link>
    </main>
  );
}