import type { Product, ShippingClass } from "@/types/commerce";

export type CatalogImportRow = {
  sku: string;
  slug: string;
  name: string;
  brand: string;
  category: string;
  subcategory?: string;
  retail_price: string | number;
  cost?: string | number | null;
  stock_quantity?: string | number | null;
  reorder_point?: string | number | null;
  supplier?: string | null;
  weight_grams?: string | number | null;
  shipping_class?: ShippingClass | "";
};

export type NormalizedCatalogImport = Pick<
  Product,
  | "sku"
  | "slug"
  | "name"
  | "brand"
  | "category"
  | "subcategory"
  | "retailPrice"
  | "cost"
  | "stockQuantity"
  | "reorderPoint"
  | "supplier"
  | "weightGrams"
  | "shippingClass"
>;

export function normalizeCatalogImport(rows: CatalogImportRow[]) {
  return rows.map((row) => ({
    sku: row.sku.trim(),
    slug: row.slug.trim(),
    name: row.name.trim(),
    brand: row.brand.trim(),
    category: row.category.trim(),
    subcategory: row.subcategory?.trim(),
    retailPrice: toNumber(row.retail_price) ?? 0,
    cost: toNumber(row.cost),
    stockQuantity: toNumber(row.stock_quantity) ?? undefined,
    reorderPoint: toNumber(row.reorder_point) ?? undefined,
    supplier: row.supplier?.trim() || null,
    weightGrams: toNumber(row.weight_grams) ?? undefined,
    shippingClass: row.shipping_class || undefined,
  })) satisfies NormalizedCatalogImport[];
}

function toNumber(value: string | number | null | undefined) {
  if (value == null || value === "") {
    return null;
  }

  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}
