import "server-only";

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.generated.types";
import { supabaseProjectUrl } from "./env";

export function hasSupabaseAdminEnv() {
  return Boolean(supabaseProjectUrl && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseProjectUrl || !serviceRoleKey) {
    throw new Error("Missing server-only Supabase admin credentials.");
  }

  return createClient<Database>(supabaseProjectUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
