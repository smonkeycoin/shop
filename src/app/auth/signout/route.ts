import { NextResponse } from "next/server";
import { hasSupabasePublicEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const requestUrl = new URL(request.url);
  if (!hasSupabasePublicEnv()) {
    return NextResponse.redirect(new URL("/admin/login", requestUrl.origin), { status: 303 });
  }

  const supabase = await createClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/admin/login", requestUrl.origin), { status: 303 });
}
