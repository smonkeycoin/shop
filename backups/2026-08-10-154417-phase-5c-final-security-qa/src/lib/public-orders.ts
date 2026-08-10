import "server-only";

import { createPublicServerClient } from "@/lib/supabase/public-server";
import type { Order } from "@/types/orders";

export type PublicOrderLookup = Order & {
  events?: Array<{
    id: string;
    eventType: string;
    fromStatus?: string | null;
    toStatus?: string | null;
    notes?: string | null;
    createdAt: string;
    metadata?: Record<string, unknown>;
  }>;
};

export async function getPublicOrder(orderNumber: string, lookupToken?: string): Promise<PublicOrderLookup | null> {
  if (!lookupToken) {
    return null;
  }

  const supabase = createPublicServerClient();
  const { data, error } = await supabase.rpc("get_public_order", {
    order_number_input: orderNumber,
    lookup_token_input: lookupToken,
  });

  if (error || !data) {
    return null;
  }

  return data as PublicOrderLookup;
}
