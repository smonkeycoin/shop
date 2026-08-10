import { createClient } from "@/lib/supabase/server";
import { hasSupabasePublicEnv } from "@/lib/supabase/env";
import type { AdminRole } from "@/types/database.types";

export type AdminProfile = {
  id: string;
  email: string;
  fullName: string | null;
  role: AdminRole;
  isActive: boolean;
  lastLoginAt: string | null;
};

export async function getCurrentAdminProfile() {
  if (!hasSupabasePublicEnv()) {
    return { profile: null, user: null, status: "unconfigured" as const };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user?.email) {
    return { profile: null, user: null, status: "unauthenticated" as const };
  }

  const { data, error } = await supabase.rpc("claim_admin_profile");
  const profile = data?.[0];

  if (error || !profile || profile.email.toLowerCase() !== user.email.toLowerCase()) {
    return { profile: null, user, status: "unauthorized" as const };
  }

  if (!profile.is_active) {
    return { profile: toAdminProfile(profile), user, status: "disabled" as const };
  }

  return { profile: toAdminProfile(profile), user, status: "authorized" as const };
}

export async function getAdminFoundationStats() {
  const supabase = await createClient();
  const [products, variants, categories, brands] = await Promise.all([
    supabase.from("storefront_products").select("id", { count: "exact", head: true }),
    supabase.from("storefront_product_variants").select("id", { count: "exact", head: true }),
    supabase.from("storefront_categories").select("id", { count: "exact", head: true }),
    supabase.from("storefront_brands").select("id", { count: "exact", head: true }),
  ]);

  return {
    products: products.count ?? 0,
    variants: variants.count ?? 0,
    categories: categories.count ?? 0,
    brands: brands.count ?? 0,
  };
}

function toAdminProfile(profile: {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  is_active: boolean;
  last_login_at: string | null;
}): AdminProfile {
  return {
    id: profile.id,
    email: profile.email,
    fullName: profile.full_name,
    role: profile.role as AdminRole,
    isActive: profile.is_active,
    lastLoginAt: profile.last_login_at,
  };
}
