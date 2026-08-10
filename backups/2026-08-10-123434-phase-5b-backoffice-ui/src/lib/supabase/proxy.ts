import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { supabaseAnonKey, supabaseProjectUrl } from "./env";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  if (!supabaseProjectUrl || !supabaseAnonKey) {
    return protectAdmin(request, response, false);
  }

  const supabase = createServerClient(supabaseProjectUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
      },
    },
  });

  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;

  if (isProtectedAdminPath(request.nextUrl.pathname) && claims?.sub) {
    const { data: profile } = await supabase
      .from("admin_profiles")
      .select("id,is_active")
      .eq("id", claims.sub)
      .eq("is_active", true)
      .maybeSingle();

    if (!profile) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("error", "unauthorized");
      return NextResponse.redirect(url);
    }
  }

  return protectAdmin(request, response, Boolean(claims));
}

function protectAdmin(request: NextRequest, response: NextResponse, hasSession: boolean) {
  const pathname = request.nextUrl.pathname;

  if (isProtectedAdminPath(pathname) && !hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return response;
}

function isProtectedAdminPath(pathname: string) {
  return pathname.startsWith("/admin") && pathname !== "/admin/login";
}
