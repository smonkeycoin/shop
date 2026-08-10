import { commerceConfig } from "@/config/commerce";
import type { Bundle, Product, ProductVariant, StockStatus } from "@/types/commerce";

export function formatPrice(price: number, currency: Product["currency"] = commerceConfig.currency) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency,
  }).format(price);
}

export function calculateMargin(retailPrice?: number | null, cost?: number | null) {
  if (!retailPrice || cost == null || cost <= 0) {
    return null;
  }

  return ((retailPrice - cost) / retailPrice) * 100;
}

export function calculateMarkup(retailPrice?: number | null, cost?: number | null) {
  if (!retailPrice || cost == null || cost <= 0) {
    return null;
  }

  return ((retailPrice - cost) / cost) * 100;
}

export function calculateBundleSavings(bundle: Pick<Bundle, "retailPrice" | "compareAtPrice">) {
  if (!bundle.compareAtPrice || bundle.compareAtPrice <= bundle.retailPrice) {
    return 0;
  }

  return bundle.compareAtPrice - bundle.retailPrice;
}

export function getStockStatus(input: {
  stockStatus?: StockStatus;
  stockQuantity?: number;
  reorderPoint?: number;
}): StockStatus {
  if (input.stockStatus === "preorder") {
    return "preorder";
  }

  if (typeof input.stockQuantity !== "number") {
    return input.stockStatus ?? "preorder";
  }

  if (input.stockQuantity === 0) {
    return "out_of_stock";
  }

  if (input.stockQuantity <= (input.reorderPoint ?? 0)) {
    return "low_stock";
  }

  return "in_stock";
}

export function getVariantStockStatus(product: Product, variant?: ProductVariant): StockStatus {
  if (!variant) {
    return getStockStatus(product);
  }

  if (!variant.available) {
    return "out_of_stock";
  }

  return getStockStatus({
    stockStatus: product.stockStatus,
    stockQuantity: variant.stockQuantity ?? product.stockQuantity,
    reorderPoint: product.reorderPoint,
  });
}

export function getPublicStockLabel(status: StockStatus) {
  const labels: Record<StockStatus, { label: string; tone: "green" | "yellow" | "red" | "blue" }> = {
    in_stock: { label: "Disponible", tone: "green" },
    low_stock: { label: "Pocas piezas", tone: "yellow" },
    out_of_stock: { label: "Agotado", tone: "red" },
    preorder: { label: "Disponible sobre pedido", tone: "blue" },
  };

  return labels[status];
}

export function calculateShipping(subtotal: number) {
  const remainingForFreeShipping = Math.max(0, commerceConfig.freeShippingThreshold - subtotal);
  const qualifiesForFreeShipping = subtotal >= commerceConfig.freeShippingThreshold;
  const shippingCost = subtotal === 0 || qualifiesForFreeShipping ? 0 : commerceConfig.defaultShippingCost;

  return {
    qualifiesForFreeShipping,
    remainingForFreeShipping,
    shippingCost,
    total: subtotal + shippingCost,
    progress: Math.min(100, (subtotal / commerceConfig.freeShippingThreshold) * 100),
  };
}

export function getProductDisplayPrice(product: Product, variant?: ProductVariant) {
  return variant?.retailPrice ?? product.retailPrice;
}
