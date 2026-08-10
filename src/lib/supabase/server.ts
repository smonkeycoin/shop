import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database.generated.types";
import { assertSupabasePublicEnv, supabaseAnonKey, supabaseProjectUrl } from "./env";

export async function createClient() {
  assertSupabasePublicEnv();
  const cookieStore = await cookies();

  return createServerClient<Database>(supabaseProjectUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server Components cannot write cookies. Proxy handles refresh writes.
        }
      },
    },
  });
}
