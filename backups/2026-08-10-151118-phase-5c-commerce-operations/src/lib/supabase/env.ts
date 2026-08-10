export const supabaseProjectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
export const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";

export function hasSupabasePublicEnv() {
  return Boolean(supabaseProjectUrl && supabaseAnonKey);
}

export function assertSupabasePublicEnv() {
  if (!hasSupabasePublicEnv()) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.");
  }
}
