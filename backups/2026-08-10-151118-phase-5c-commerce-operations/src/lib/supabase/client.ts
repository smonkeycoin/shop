import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database.generated.types";
import { assertSupabasePublicEnv, supabaseAnonKey, supabaseProjectUrl } from "./env";

export function createClient() {
  assertSupabasePublicEnv();
  return createBrowserClient<Database>(supabaseProjectUrl, supabaseAnonKey);
}
