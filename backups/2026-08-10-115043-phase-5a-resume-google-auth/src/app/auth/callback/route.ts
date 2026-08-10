import { NextResponse } from "next/server";
import { hasSupabasePublicEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/admin";

  if (!hasSupabasePublicEnv()) {
    return NextResponse.redirect(new URL("/admin/login?error=oauth_unavailable", requestUrl.origin));
  }

  if (!code) {
    return NextResponse.redirect(new URL("/admin/login?error=oauth_unavailable", requestUrl.origin));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(new URL("/admin/login?error=oauth_unavailable", requestUrl.origin));
  }

  const { data, error: profileError } = await supabase.rpc("claim_admin_profile");
  const profile = data?.[0];

  if (profileError || !profile) {
    await supabase.auth.signOut();
    return NextResponse.redirect(new URL("/admin/login?error=unauthorized", requestUrl.origin));
  }

  if (!profile.is_active) {
    await supabase.auth.signOut();
    return NextResponse.redirect(new URL("/admin/login?error=disabled", requestUrl.origin));
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
