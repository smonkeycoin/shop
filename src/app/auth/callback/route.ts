import { NextResponse } from "next/server";
import { hasSupabasePublicEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { provisionAdminProfileForUser } from "@/lib/repositories/adminRepository";

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

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    await supabase.auth.signOut();
    return NextResponse.redirect(new URL("/admin/login?error=unauthorized", requestUrl.origin));
  }

  const { status } = await provisionAdminProfileForUser(user);

  if (status === "unauthorized_email") {
    await supabase.auth.signOut();
    return NextResponse.redirect(new URL("/admin/login?error=unauthorized_email", requestUrl.origin));
  }

  if (status === "profile_inactive") {
    await supabase.auth.signOut();
    return NextResponse.redirect(new URL("/admin/login?error=profile_inactive", requestUrl.origin));
  }

  if (status === "profile_conflict") {
    await supabase.auth.signOut();
    return NextResponse.redirect(new URL("/admin/login?error=profile_conflict", requestUrl.origin));
  }

  if (status === "provisioning_failed") {
    await supabase.auth.signOut();
    return NextResponse.redirect(new URL("/admin/login?error=provisioning_failed", requestUrl.origin));
  }

  return NextResponse.redirect(new URL(safeNextPath(next), requestUrl.origin));
}

function safeNextPath(value: string) {
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("://")) {
    return "/admin";
  }

  if (!value.startsWith("/admin")) {
    return "/admin";
  }

  return value;
}
