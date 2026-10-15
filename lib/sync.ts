import type { Category } from "@/lib/daily-prompt";
import { supabase } from "@/lib/supabase";
import { loadEntries, replaceEntries, type Entry } from "@/lib/storage";

interface EntryRow {
  user_id: string;
  id: string;
  kind: "daily" | "free";
  entry_date: string;
  category: Category | null;
  title: string;
  prompt: string;
  body: string;
  words: number;
  goal: number;
  completed: boolean;
  submitted: boolean;
  sprint_minutes: number | null;
  updated_at: string;
}

function client() {
  if (!supabase) throw new Error("Supabase is not configured");
  return supabase;
}

function toRow(userId: string, e: Entry): EntryRow {
  return {
    user_id: userId,
    id: e.id,
    kind: e.kind,
    entry_date: e.date,
    category: e.category,
    title: e.title,
    prompt: e.prompt,
    body: e.text,
    words: e.words,
    goal: e.goal,
    completed: e.completed,
    submitted: e.submitted,
    sprint_minutes: e.sprintMinutes ?? null,
    updated_at: new Date(e.updatedAt ?? 0).toISOString(),
  };
}

function fromRow(r: EntryRow): Entry {
  return {
    id: r.id,
    kind: r.kind,
    date: r.entry_date,
    category: r.category,
    title: r.title,
    prompt: r.prompt,
    text: r.body,
    words: r.words,
    goal: r.goal,
    completed: r.completed,
    submitted: r.submitted,
    sprintMinutes: r.sprint_minutes ?? undefined,
    updatedAt: new Date(r.updated_at).getTime(),
  };
}

function byId(list: Entry[]): Map<string, Entry> {
  const map = new Map<string, Entry>();
  for (const e of list) map.set(e.id, e);
  return map;
}

// Supabase returns at most 1000 rows per request, so we page through.
async function fetchRemote(userId: string): Promise<Entry[]> {
  const db = client();
  const size = 1000;
  const all: Entry[] = [];
  for (let from = 0; ; from += size) {
    const { data, error } = await db
      .from("entries")
      .select("*")
      .eq("user_id", userId)
      .order("id")
      .range(from, from + size - 1);
    if (error) throw error;
    const rows = (data ?? []) as EntryRow[];
    all.push(...rows.map(fromRow));
    if (rows.length < size) break;
  }
  return all;
}

export async function pushEntries(
  userId: string,
  entries: Entry[]
): Promise<void> {
  const rows = entries.filter((e) => e.date).map((e) => toRow(userId, e));
  for (let i = 0; i < rows.length; i += 100) {
    const { error } = await client()
      .from("entries")
      .upsert(rows.slice(i, i + 100), { onConflict: "user_id,id" });
    if (error) throw error;
  }
}

export async function deleteRemote(
  userId: string,
  ids: string[]
): Promise<void> {
  if (ids.length === 0) return;
  const { error } = await client()
    .from("entries")
    .delete()
    .eq("user_id", userId)
    .in("id", ids);
  if (error) throw error;
}

// Two-way merge. Returns true if the local copy changed.
export async function pullAndMerge(userId: string): Promise<boolean> {
  const remote = await fetchRemote(userId);
  const local = loadEntries();
  const remoteById = byId(remote);
  const localById = byId(local);

  const toPush = local.filter((e) => {
    const r = remoteById.get(e.id);
    return !r || (e.updatedAt ?? 0) > (r.updatedAt ?? 0);
  });
  const toPull = remote.filter((r) => {
    const l = localById.get(r.id);
    return !l || (r.updatedAt ?? 0) > (l.updatedAt ?? 0);
  });

  await pushEntries(userId, toPush);

  if (toPull.length === 0) return false;
  const merged = new Map(localById);
  for (const r of toPull) merged.set(r.id, r);
  replaceEntries(Array.from(merged.values()));
  return true;
}