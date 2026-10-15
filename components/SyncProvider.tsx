"use client";

import {
  createContext,
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import {
  CHANGE_EVENT,
  clearLocalEntries,
  loadEntries,
  type ChangeDetail,
  type Entry,
} from "@/lib/storage";
import { deleteRemote, pullAndMerge, pushEntries } from "@/lib/sync";

export type SyncStatus = "idle" | "syncing" | "synced" | "error";

interface AuthValue {
  configured: boolean;
  loading: boolean;
  user: User | null;
  status: SyncStatus;
  lastSynced: Date | null;
  syncNow: () => Promise<boolean>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthValue | null>(null);

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <SyncProvider>");
  return ctx;
}

export default function SyncProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<SyncStatus>("idle");
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  // Changing this remounts the page, so it re-reads freshly synced data.
  const [version, setVersion] = useState(0);

  const userIdRef = useRef<string | null>(null);
  const pending = useRef(new Map<string, ChangeDetail["type"]>());
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const userId = user?.id ?? null;

  // Follow the signed-in user.
  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session) setStatus("idle");
      setLoading(false);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  // Upload whatever changed locally since the last upload.
  const flush = useCallback(async (): Promise<boolean> => {
    const uid = userIdRef.current;
    if (!supabase || !uid) {
      pending.current.clear();
      return true;
    }
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    if (pending.current.size === 0) return true;

    const batch = new Map(pending.current);
    pending.current.clear();
    setStatus("syncing");

    try {
      const local = loadEntries();
      const saves: Entry[] = [];
      const removals: string[] = [];
      for (const [id, op] of batch) {
        const entry = op === "save" ? local.find((e) => e.id === id) : undefined;
        // A "save" with no local entry means the text was cleared: remove it.
        if (entry) saves.push(entry);
        else removals.push(id);
      }
      await pushEntries(uid, saves);
      await deleteRemote(uid, removals);
      setStatus("synced");
      setLastSynced(new Date());
      return true;
    } catch {
      for (const [id, op] of batch) {
        if (!pending.current.has(id)) pending.current.set(id, op);
      }
      setStatus("error");
      return false;
    }
  }, []);

  // Upload pending changes, then merge in anything newer from the cloud.
  const syncNow = useCallback(async (): Promise<boolean> => {
    const uid = userIdRef.current;
    if (!supabase || !uid) return false;
    if (!(await flush())) return false;

    setStatus("syncing");
    try {
      const changed = await pullAndMerge(uid);
      if (changed) setVersion((v) => v + 1);
      setStatus("synced");
      setLastSynced(new Date());
      return true;
    } catch {
      setStatus("error");
      return false;
    }
  }, [flush]);

  // Sync once whenever someone signs in or the app loads signed in.
  useEffect(() => {
    userIdRef.current = userId;
    if (userId) void syncNow();
  }, [userId, syncNow]);

  // Queue uploads when the user writes; flush when the tab is hidden.
  useEffect(() => {
    function onChange(e: Event) {
      if (!userIdRef.current) return;
      const { type, id } = (e as CustomEvent<ChangeDetail>).detail;
      pending.current.set(id, type);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => void flush(), 1500);
    }
    function onVisibility() {
      if (document.visibilityState === "hidden") void flush();
    }
    window.addEventListener(CHANGE_EVENT, onChange);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener(CHANGE_EVENT, onChange);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [flush]);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    const ok = await syncNow();
    if (
      !ok &&
      !window.confirm(
        "Your latest changes couldn't be synced. Sign out anyway? Unsynced writing on this device will be lost."
      )
    ) {
      return;
    }
    // The cloud now has everything, so clear this device's copy.
    // That way the next person to sign in here doesn't inherit it.
    clearLocalEntries();
    pending.current.clear();
    await supabase.auth.signOut();
    setLastSynced(null);
    setVersion((v) => v + 1);
  }, [syncNow]);

  const value = useMemo<AuthValue>(
    () => ({
      configured: supabase !== null,
      loading,
      user,
      status,
      lastSynced,
      syncNow,
      signOut,
    }),
    [loading, user, status, lastSynced, syncNow, signOut]
  );

  return (
    <AuthContext.Provider value={value}>
      <Fragment key={version}>{children}</Fragment>
    </AuthContext.Provider>
  );
}