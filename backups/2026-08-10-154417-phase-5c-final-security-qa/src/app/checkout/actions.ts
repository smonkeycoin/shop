"use server";

import { createPublicServerClient } from "@/lib/supabase/public-server";
import type { CartItem } from "@/components/shop/ShopProvider";

type CheckoutCustomerInput = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
};

type CheckoutAddressInput = {
  street: string;
  exteriorNumber: string;
  interiorNumber?: string;
  neighborhood: string;
  postalCode: string;
  city: string;
  state: string;
  references?: string;
};

type CheckoutOrderInput = {
  customer: CheckoutCustomerInput;
  shippingAddress: CheckoutAddressInput;
  items: CartItem[];
  whatsappOptIn: boolean;
  customerNotes?: string;
  requiresInvoice: boolean;
};

export async function createCheckoutOrderAction(input: CheckoutOrderInput) {
  const supabase = createPublicServerClient();
  const checkoutMode = process.env.CHECKOUT_MODE || process.env.NEXT_PUBLIC_CHECKOUT_MODE || "demo";
  const isTest = process.env.NODE_ENV !== "production" || process.env.VERCEL_ENV !== "production" || checkoutMode !== "stripe";
  let items;
  try {
    items = await resolveCheckoutItems(supabase, input.items);
  } catch (error) {
    return {
      ok: false as const,
      error: getCheckoutErrorMessage(error instanceof Error ? error.message : "product_unavailable"),
      code: "cart_mapping_failed",
    };
  }
  const payload = {
    checkoutMode,
    isTest,
    customer: sanitizeCustomer(input.customer),
    shippingAddress: sanitizeAddress(input.shippingAddress),
    whatsappOptIn: Boolean(input.whatsappOptIn),
    customerNotes: input.customerNotes?.trim() || null,
    requiresInvoice: Boolean(input.requiresInvoice),
    items,
  };

  const { data, error } = await supabase.rpc("create_order_transaction_v2", { payload });

  if (error) {
    return {
      ok: false as const,
      error: getCheckoutErrorMessage(error.message),
      code: error.code,
    };
  }

  const result = data as { orderNumber?: string; orderId?: string; lookupToken?: string; total?: number } | null;

  if (!result?.orderNumber || !result.lookupToken) {
    return {
      ok: false as const,
      error: "No pudimos crear tu pedido. Intenta nuevamente.",
      code: "missing_order_reference",
    };
  }

  return {
    ok: true as const,
    orderNumber: result.orderNumber,
    orderId: result.orderId ?? "",
    lookupToken: result.lookupToken,
    total: result.total ?? 0,
  };
}

async function resolveCheckoutItems(
  supabase: ReturnType<typeof createPublicServerClient>,
  items: CartItem[],
) {
  const resolved = [];

  for (const item of items) {
    const quantity = Math.max(1, Number(item.quantity) || 1);

    if (item.type === "bundle") {
      const bundleId = await resolveBundleId(supabase, item);
      resolved.push({
        type: "bundle",
        bundleId,
        quantity,
      });
      continue;
    }

    const productReference = await resolveProductReference(supabase, item);
    resolved.push({
      type: "product",
      productId: productReference.productId,
      variantId: productReference.variantId,
      variantName: item.variantName,
      quantity,
    });
  }

  return resolved;
}

async function resolveProductReference(
  supabase: ReturnType<typeof createPublicServerClient>,
  item: CartItem,
) {
  if (isUuid(item.productId)) {
    return {
      productId: item.productId,
      variantId: isUuid(item.variantId) ? item.variantId : undefined,
    };
  }

  if (item.sku) {
    const { data: variant } = await supabase
      .from("storefront_product_variants")
      .select("id,product_id,sku")
      .eq("sku", item.sku)
      .maybeSingle();

    if (variant?.product_id) {
      return {
        productId: variant.product_id,
        variantId: variant.id,
      };
    }
  }

  const { data: productBySlug } = await supabase
    .from("storefront_products")
    .select("id,sku,slug")
    .eq("slug", item.slug)
    .maybeSingle();
  const product = productBySlug ?? (await supabase
    .from("storefront_products")
    .select("id,sku,slug")
    .eq("sku", item.sku)
    .maybeSingle()).data;

  if (!product?.id) {
    throw new Error("product_unavailable");
  }

  return {
    productId: product.id,
    variantId: undefined,
  };
}

async function resolveBundleId(
  supabase: ReturnType<typeof createPublicServerClient>,
  item: CartItem,
) {
  const candidate = item.bundleId ?? item.productId;
  if (isUuid(candidate)) {
    return candidate;
  }

  const { data: bundle } = await supabase
    .from("storefront_bundles")
    .select("id,slug")
    .eq("slug", item.slug)
    .maybeSingle();

  if (!bundle?.id) {
    throw new Error("bundle_unavailable");
  }

  return bundle.id;
}

function isUuid(value?: string) {
  return Boolean(value?.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i));
}


function sanitizeCustomer(customer: CheckoutCustomerInput) {
  return {
    firstName: customer.firstName.trim(),
    lastName: customer.lastName.trim(),
    phone: customer.phone.trim(),
    email: customer.email.trim().toLowerCase(),
  };
}

function sanitizeAddress(address: CheckoutAddressInput) {
  return {
    street: address.street.trim(),
    exteriorNumber: address.exteriorNumber.trim(),
    interiorNumber: address.interiorNumber?.trim() || "",
    neighborhood: address.neighborhood.trim(),
    postalCode: address.postalCode.trim(),
    city: address.city.trim(),
    state: address.state.trim(),
    references: address.references?.trim() || "",
  };
}

function getCheckoutErrorMessage(message: string) {
  if (message.includes("checkout_disabled")) {
    return "La compra en linea estara disponible proximamente.";
  }

  if (message.includes("insufficient_stock")) {
    return "Uno de los productos ya no tiene stock suficiente.";
  }

  if (message.includes("product_unavailable") || message.includes("bundle_unavailable")) {
    return "Uno de los productos ya no esta disponible.";
  }

  if (message.includes("cart_empty")) {
    return "Tu carrito esta vacio.";
  }

  return "No pudimos crear tu pedido. Revisa tu carrito e intenta nuevamente.";
}
