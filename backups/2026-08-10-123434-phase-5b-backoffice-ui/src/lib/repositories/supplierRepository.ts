import { createClient } from "@/lib/supabase/server";

export async function assertSupplierDataIsServerOnly() {
  const supabase = await createClient();
  return supabase;
}
