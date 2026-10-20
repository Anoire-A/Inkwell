import {
  dateKey,
  getGeneratedPrompt,
  type Category,
} from "@/lib/daily-prompt";
import { supabase } from "@/lib/supabase";

export const IDEA_MIN = 20;
export const IDEA_MAX = 200;
export const IDEAS_PER_DAY = 3;
export const QUARANTINE_MS = 24 * 60 * 60 * 1000;

export interface Idea {
  id: string;
  category: Category;
  text: string;
  status: "approved" | "removed";
  createdAt: Date;
}

// ---- Today's prompt ----

function readCache(key: string): string | null | undefined {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return undefined;
    return (JSON.parse(raw) as { text: string | null }).text;
  } catch {
    return undefined;
  }
}

function writeCache(key: string, text: string | null): void {
  try {
    localStorage.setItem(key, JSON.stringify({ text }));
  } catch {
    // storage blocked; we'll just ask the server again next time
  }
}

// One prompt per day and category, the same for everyone.
// A community idea if there is one for that day, otherwise a generated prompt.
export async function getTodaysPrompt(
  category: Category,
  date: Date
): Promise<string> {
  const cacheKey = `inkwell:prompt:${dateKey(date)}:${category}`;
  let community = readCache(cacheKey); // undefined = not known yet

  if (community === undefined && supabase) {
    try {
      const { data, error } = await supabase.rpc("get_daily_prompt", {
        p_date: dateKey(date),
        p_category: category,
      });
      const row = (data as { prompt_text: string | null; source: string }[] | null)?.[0];
      if (!error && row) {
        community = row.source === "community" ? row.prompt_text : null;
        writeCache(cacheKey, community);
      }
    } catch {
      // offline; fall through to the generated prompt
    }
  }

  return community ?? getGeneratedPrompt(category, date);
}

// ---- Prompt ideas ----

const LINK = /(https?:\/\/|www\.|\b[a-z0-9-]+\.(com|net|org|io|ru|xyz)\b|@[a-z0-9_]+)/i;

export function normalizeIdea(raw: string): string {
  return raw.trim().replace(/\s+/g, " ");
}

// Returns a message if the idea isn't valid, or null if it is.
// The database enforces the same rules, so this is only for friendly feedback.
export function validateIdea(raw: string): string | null {
  const text = normalizeIdea(raw);
  if (text.length < IDEA_MIN) {
    return `Use at least ${IDEA_MIN} characters so it gives a writer something to work with.`;
  }
  if (text.length > IDEA_MAX) return `Keep it under ${IDEA_MAX} characters.`;
  if (text.split(" ").length < 4) return "Use at least four words.";
  if (LINK.test(text)) return "No links, emails or @handles, please.";
  if (/(.)\1{4,}/.test(text)) return "That has a long run of repeated characters.";
  return null;
}

// Returns an error message, or null on success.
export async function submitIdea(
  userId: string,
  category: Category,
  raw: string
): Promise<string | null> {
  if (!supabase) return "Supabase isn't configured.";
  const problem = validateIdea(raw);
  if (problem) return problem;

  const { error } = await supabase
    .from("prompt_ideas")
    .insert({ user_id: userId, category, text: normalizeIdea(raw) });

  if (!error) return null;
  if (error.code === "23505") return "That idea has already been submitted.";
  if (error.message.includes("Daily limit")) return error.message;
  if (error.code === "23514") return "That didn't pass the checks. Try rewording it.";
  return "Couldn't save it. Try again in a moment.";
}

interface IdeaRow {
  id: string;
  category: Category;
  text: string;
  status: "approved" | "removed";
  created_at: string;
}

// Row Level Security means this only ever returns your own ideas.
export async function listMyIdeas(): Promise<Idea[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("prompt_ideas")
    .select("id, category, text, status, created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as IdeaRow[]).map((r) => ({
    id: r.id,
    category: r.category,
    text: r.text,
    status: r.status,
    createdAt: new Date(r.created_at),
  }));
}