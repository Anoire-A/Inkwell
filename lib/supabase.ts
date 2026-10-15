import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

// null when the env vars are missing, so the app still works offline-only.
export const supabase = url && key ? createClient(url, key) : null;