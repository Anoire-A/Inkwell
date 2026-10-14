"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [dark, setDark] = useState<boolean | null>(null);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("inkwell:theme", next ? "dark" : "light");
    } catch {
      // storage blocked; the theme just won't be remembered
    }
  }

  return (
    <button
      onClick={toggle}
      aria-label="Toggle light and dark mode"
      className="w-14 rounded-full border border-line px-3 py-1 text-xs text-muted hover:text-fg"
    >
      {dark === null ? "" : dark ? "Light" : "Dark"}
    </button>
  );
}