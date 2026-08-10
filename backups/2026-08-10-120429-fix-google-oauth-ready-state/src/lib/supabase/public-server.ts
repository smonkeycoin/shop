import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.generated.types";
import { assertSupabasePublicEnv, supabaseAnonKey, supabaseProjectUrl } from "./env";

export function createPublicServerClient() {
  assertSupabasePublicEnv();
  return createSupabaseClient<Database>(supabaseProjectUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
