"use client";

import { useState, type FormEvent } from "react";
import { useAuth, type SyncStatus } from "@/components/SyncProvider";
import { supabase } from "@/lib/supabase";

const STATUS_TEXT: Record<SyncStatus, string> = {
  idle: "Not synced yet",
  syncing: "Syncing…",
  synced: "Up to date",
  error: "Sync failed. Your writing is safe on this device.",
};

export default function AccountPage() {
  const { configured, loading, user, status, lastSynced, syncNow, signOut } =
    useAuth();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [info, setInfo] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    setBusy(true);
    setErrorText("");
    setInfo("");

    const { data, error } =
      mode === "signup"
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password });

    setBusy(false);
    if (error) {
      setErrorText(error.message);
      return;
    }
    if (mode === "signup" && !data.session) {
      setInfo("Check your email to confirm your account, then sign in.");
    }
  }

  return (
    <main className="mx-auto max-w-md px-6 py-12">
      <p className="text-xs uppercase tracking-[0.2em] text-muted">Account</p>
      <h1 className="mt-2 font-serif text-4xl">
        {user ? "Your account" : mode === "signin" ? "Sign in" : "Create account"}
      </h1>

      {!configured && (
        <div className="mt-8 rounded-lg border border-line p-6 text-sm text-muted">
          Supabase isn&apos;t configured. Add your keys to <code>.env.local</code>{" "}
          and restart <code>npm run dev</code>.
        </div>
      )}

      {configured && loading && <p className="mt-8 text-muted">Loading…</p>}

      {configured && !loading && user && (
        <div className="mt-8 rounded-lg border border-line p-6">
          <p className="text-xs uppercase tracking-wider text-muted">
            Signed in as
          </p>
          <p className="mt-1 break-all text-lg">{user.email}</p>

          <p className="mt-5 text-sm text-muted">
            {STATUS_TEXT[status]}
            {lastSynced ? ` · ${lastSynced.toLocaleTimeString()}` : ""}
          </p>

          <div className="mt-6 flex gap-3">
            <button
              onClick={() => void syncNow()}
              disabled={status === "syncing"}
              className="rounded-full bg-fg px-5 py-2 text-sm font-medium text-bg hover:opacity-80 disabled:opacity-40"
            >
              Sync now
            </button>
            <button
              onClick={() => void signOut()}
              className="rounded-full border border-line px-5 py-2 text-sm hover:bg-soft"
            >
              Sign out
            </button>
          </div>
        </div>
      )}

      {configured && !loading && !user && (
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <p className="text-sm text-muted">
            Sign in to keep your writing safe and available on every device.
            Anything already saved on this device is uploaded to your account.
          </p>

          <label className="block text-sm text-muted">
            Email
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-md border border-line bg-bg px-3 py-2 text-fg focus:border-fg focus:outline-none"
            />
          </label>

          <label className="block text-sm text-muted">
            Password
            <input
              type="password"
              required
              minLength={8}
              autoComplete={
                mode === "signup" ? "new-password" : "current-password"
              }
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-md border border-line bg-bg px-3 py-2 text-fg focus:border-fg focus:outline-none"
            />
          </label>

          {errorText && <p className="text-sm text-red-500">{errorText}</p>}
          {info && <p className="text-sm text-muted">{info}</p>}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-full bg-fg px-6 py-2.5 text-sm font-medium text-bg hover:opacity-80 disabled:opacity-40"
          >
            {busy
              ? "Please wait…"
              : mode === "signin"
              ? "Sign in"
              : "Create account"}
          </button>

          <button
            type="button"
            onClick={() => {
              setMode(mode === "signin" ? "signup" : "signin");
              setErrorText("");
              setInfo("");
            }}
            className="w-full text-sm text-muted hover:text-fg"
          >
            {mode === "signin"
              ? "No account? Create one"
              : "Already have an account? Sign in"}
          </button>
        </form>
      )}
    </main>
  );
}