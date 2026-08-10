import { createClient } from "@/lib/supabase/server";

export async function getInventoryFoundationStatus() {
  const supabase = await createClient();
  const { count, error } = await supabase.from("storefront_products").select("id", { count: "exact", head: true });

  if (error) {
    throw error;
  }

  return { catalogProductsVisibleToStorefront: count ?? 0 };
}
