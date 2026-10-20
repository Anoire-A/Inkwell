"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/SyncProvider";
import ThemeToggle from "@/components/ThemeToggle";

const LINKS = [
  { href: "/write", match: "/write", label: "Today" },
  { href: "/compose/new", match: "/compose", label: "Free write" },
  { href: "/sprint", match: "/sprint", label: "Sprint" },
  { href: "/stats", match: "/stats", label: "Stats" },
  { href: "/ideas", match: "/ideas", label: "Ideas" },
  { href: "/history", match: "/history", label: "My works" },
];

export default function Header() {
  const pathname = usePathname();
  const { loading, user } = useAuth();

  return (
    <header className="border-b border-line">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-y-2 px-6 py-4">
        <Link href="/" className="font-serif text-xl tracking-tight">
          Inkwell
        </Link>
        <nav className="flex flex-wrap items-center gap-4 text-sm sm:gap-6">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={
                pathname.startsWith(l.match)
                  ? "text-fg underline underline-offset-8"
                  : "text-muted hover:text-fg"
              }
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/account"
            className={`rounded-full border px-3 py-1 text-xs ${
              pathname.startsWith("/account")
                ? "border-fg text-fg"
                : "border-line text-muted hover:text-fg"
            } ${loading ? "opacity-0" : ""}`}
          >
            {user ? "Account" : "Sign in"}
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}