import { supabaseProjectUrl } from "@/lib/supabase/env";

export function getStoragePublicUrl(path?: string | null) {
  if (!path) {
    return "";
  }

  if (path.startsWith("http") || path.startsWith("/")) {
    return path;
  }

  return `${supabaseProjectUrl}/storage/v1/object/public/product-images/${path}`;
}
