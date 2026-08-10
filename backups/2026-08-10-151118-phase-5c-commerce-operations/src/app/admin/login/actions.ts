"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { hasSupabasePublicEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export async function signInWithGoogle() {
  if (!hasSupabasePublicEnv()) {
    redirect("/admin/login?error=oauth_unavailable");
  }

  const headerStore = await headers();
  const origin = headerStore.get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  });

  if (error || !data.url) {
    redirect("/admin/login?error=oauth_unavailable");
  }

  redirect(data.url);
}
