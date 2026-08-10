import { createClient } from "@/lib/supabase/server";
import { hasSupabasePublicEnv } from "@/lib/supabase/env";
import { createAdminClient, hasSupabaseAdminEnv } from "@/lib/supabase/admin";
import { getBootstrapAdminRole, normalizeAdminEmail } from "@/config/admin-access";
import type { AdminRole } from "@/types/database.types";

type AdminProfileRow = {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  is_active: boolean;
  last_login_at: string | null;
};

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

  const email = normalizeAdminEmail(user.email);

  if (!getBootstrapAdminRole(email)) {
    return { profile: null, user, status: "unauthorized_email" as const };
  }

  const { data: profile, error } = await supabase
    .from("admin_profiles")
    .select("id,email,full_name,role,is_active,last_login_at")
    .eq("id", user.id)
    .eq("email", email)
    .maybeSingle();

  if (error || !profile) {
    return { profile: null, user, status: "unauthorized" as const };
  }

  if (!profile.is_active) {
    return { profile: toAdminProfile(profile), user, status: "profile_inactive" as const };
  }

  return { profile: toAdminProfile(profile), user, status: "authorized" as const };
}

export async function provisionAdminProfileForUser(user: {
  id: string;
  email?: string | null;
  user_metadata?: { full_name?: string; name?: string };
}) {
  const email = normalizeAdminEmail(user.email);
  const role = getBootstrapAdminRole(email);

  if (!role) {
    return { profile: null, status: "unauthorized_email" as const };
  }

  const fullName = user.user_metadata?.full_name ?? user.user_metadata?.name ?? null;

  if (!hasSupabaseAdminEnv()) {
    return provisionAdminProfileWithRpc();
  }

  const supabase = createAdminClient();
  const { data: existingProfile, error: existingError } = await supabase
    .from("admin_profiles")
    .select("id,email,full_name,role,is_active,last_login_at")
    .eq("email", email)
    .maybeSingle();

  if (existingError) {
    return { profile: null, status: "provisioning_failed" as const };
  }

  if (existingProfile && existingProfile.id !== user.id) {
    return { profile: null, status: "profile_conflict" as const };
  }

  if (!existingProfile) {
    const { data: profile, error } = await supabase
      .from("admin_profiles")
      .insert({
        id: user.id,
        email,
        full_name: fullName,
        role,
        is_active: true,
        last_login_at: new Date().toISOString(),
      })
      .select("id,email,full_name,role,is_active,last_login_at")
      .single();

    if (error || !profile) {
      return { profile: null, status: "provisioning_failed" as const };
    }

    return { profile: toAdminProfile(profile), status: "authorized" as const };
  }

  if (!existingProfile.is_active) {
    return { profile: toAdminProfile(existingProfile), status: "profile_inactive" as const };
  }

  const { data: profile, error } = await supabase
    .from("admin_profiles")
    .update({
      full_name: existingProfile.full_name ?? fullName,
      last_login_at: new Date().toISOString(),
    })
    .eq("id", user.id)
    .select("id,email,full_name,role,is_active,last_login_at")
    .single();

  if (error || !profile) {
    return { profile: null, status: "provisioning_failed" as const };
  }

  return { profile: toAdminProfile(profile), status: "authorized" as const };
}

async function provisionAdminProfileWithRpc() {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("claim_admin_profile");
  const profile = data?.[0];

  if (error) {
    const isConflict = error.code === "23505";
    return { profile: null, status: isConflict ? ("profile_conflict" as const) : ("provisioning_failed" as const) };
  }

  if (!profile) {
    return { profile: null, status: "unauthorized_email" as const };
  }

  if (!profile.is_active) {
    return { profile: toAdminProfile(profile), status: "profile_inactive" as const };
  }

  return { profile: toAdminProfile(profile), status: "authorized" as const };
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

function toAdminProfile(profile: AdminProfileRow): AdminProfile {
  return {
    id: profile.id,
    email: profile.email,
    fullName: profile.full_name,
    role: profile.role as AdminRole,
    isActive: profile.is_active,
    lastLoginAt: profile.last_login_at,
  };
}
