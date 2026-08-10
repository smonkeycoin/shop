import { unstable_cache } from "next/cache";
import { createPublicServerClient } from "@/lib/supabase/public-server";
import {
  brands as localBrands,
  bundles as localBundles,
  categories as localCategories,
  products as localProducts,
} from "@/data/catalog";
import type { Brand, Bundle, Category, Product, ProductVariant, ShippingClass, StockStatus } from "@/types/commerce";
import type {
  StorefrontBrandRow,
  StorefrontBundleItemRow,
  StorefrontBundleRow,
  StorefrontCategoryRow,
  StorefrontProductImageRow,
  StorefrontProductRow,
  StorefrontProductVariantRow,
} from "@/types/database.types";

export type CatalogSource = "local" | "supabase";

export type StorefrontCatalog = {
  source: CatalogSource;
  products: Product[];
  categories: Category[];
  brands: Brand[];
  bundles: Bundle[];
};

export const getStorefrontCatalog = unstable_cache(loadStorefrontCatalog, ["storefront-catalog"], {
  revalidate: 60,
  tags: ["storefront-catalog"],
});

async function loadStorefrontCatalog(): Promise<StorefrontCatalog> {
  if (process.env.NEXT_PUBLIC_CATALOG_SOURCE !== "supabase") {
    return getLocalCatalog();
  }

  try {
    return await getSupabaseCatalog();
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[catalog] Supabase catalog unavailable. Falling back to local catalog.", error);
      return getLocalCatalog();
    }

    throw error;
  }
}

function getLocalCatalog(): StorefrontCatalog {
  return {
    source: "local",
    products: localProducts.filter((product) => product.published !== false),
    categories: localCategories,
    brands: localBrands.filter((brand) => brand.featured),
    bundles: localBundles,
  };
}

async function getSupabaseCatalog(): Promise<StorefrontCatalog> {
  const supabase = createPublicServerClient();
  const [productsResult, variantsResult, imagesResult, categoriesResult, brandsResult, bundlesResult, bundleItemsResult] =
    await Promise.all([
      supabase.from("storefront_products").select("*").order("featured", { ascending: false }).order("name"),
      supabase.from("storefront_product_variants").select("*").order("sort_order"),
      supabase.from("storefront_product_images").select("*").order("sort_order"),
      supabase.from("storefront_categories").select("*").order("sort_order"),
      supabase.from("storefront_brands").select("*").order("sort_order"),
      supabase.from("storefront_bundles").select("*").order("featured", { ascending: false }).order("name"),
      supabase.from("storefront_bundle_items").select("*"),
    ]);

  const errors = [
    productsResult.error,
    variantsResult.error,
    imagesResult.error,
    categoriesResult.error,
    brandsResult.error,
    bundlesResult.error,
    bundleItemsResult.error,
  ].filter(Boolean);

  if (errors.length > 0) {
    throw errors[0];
  }

  return {
    source: "supabase",
    products: mapProducts(
      (productsResult.data ?? []) as StorefrontProductRow[],
      (variantsResult.data ?? []) as StorefrontProductVariantRow[],
      (imagesResult.data ?? []) as StorefrontProductImageRow[],
    ),
    categories: mapCategories((categoriesResult.data ?? []) as StorefrontCategoryRow[]),
    brands: mapBrands((brandsResult.data ?? []) as StorefrontBrandRow[]),
    bundles: mapBundles((bundlesResult.data ?? []) as StorefrontBundleRow[], (bundleItemsResult.data ?? []) as StorefrontBundleItemRow[]),
  };
}

function mapProducts(
  rows: StorefrontProductRow[],
  variants: StorefrontProductVariantRow[],
  images: StorefrontProductImageRow[],
): Product[] {
  return rows.map((row) => {
    const productVariants = variants.filter((variant) => variant.product_id === row.id).map(mapVariant);
    const productImages = images
      .filter((image) => image.product_id === row.id)
      .sort((a, b) => Number(b.is_primary) - Number(a.is_primary) || a.sort_order - b.sort_order)
      .map((image) => image.storage_path);

    return {
      id: row.id,
      slug: row.slug,
      sku: row.sku,
      name: row.name,
      shortName: row.short_name ?? undefined,
      brand: row.brand_name ?? "Marca por confirmar",
      brandSlug: row.brand_slug ?? "marca-por-confirmar",
      category: row.category_name ?? "Categoría",
      categorySlug: row.category_slug ?? "categoria",
      subcategory: row.subcategory_name ?? undefined,
      subcategorySlug: row.subcategory_slug ?? undefined,
      shortDescription: row.short_description ?? "",
      description: row.description ?? "",
      images: productImages,
      imageSource: "authorized",
      currency: row.currency,
      retailPrice: Number(row.retail_price),
      compareAtPrice: row.compare_at_price == null ? undefined : Number(row.compare_at_price),
      priceIsPlaceholder: false,
      cost: null,
      featured: row.featured,
      isNew: row.is_new,
      isBestSeller: row.is_best_seller,
      stockStatus: row.stock_status as StockStatus,
      variants: productVariants,
      compatibleWith: [],
      features: [],
      includes: [],
      usageNotes: row.usage_notes ?? undefined,
      ageGroup: Array.isArray(row.age_group) ? (row.age_group as string[]) : undefined,
      tags: Array.isArray(row.tags) ? (row.tags as string[]) : undefined,
      shippingClass: (row.shipping_class ?? undefined) as ShippingClass | undefined,
      weightGrams: row.weight_grams ?? undefined,
      lengthCm: row.length_cm == null ? undefined : Number(row.length_cm),
      widthCm: row.width_cm == null ? undefined : Number(row.width_cm),
      heightCm: row.height_cm == null ? undefined : Number(row.height_cm),
      seoTitle: row.seo_title ?? undefined,
      seoDescription: row.seo_description ?? undefined,
      published: true,
    };
  });
}

function mapVariant(row: StorefrontProductVariantRow): ProductVariant {
  return {
    id: row.id,
    sku: row.sku,
    name: row.name,
    attributes: row.attributes ?? {},
    retailPrice: row.retail_price == null ? undefined : Number(row.retail_price),
    stockQuantity: row.stock_quantity ?? undefined,
    available: row.available,
  };
}

function mapCategories(rows: StorefrontCategoryRow[]): Category[] {
  return rows
    .filter((row) => !row.parent_id)
    .map((row) => {
      const fallback = localCategories.find((category) => category.slug === row.slug) ?? localCategories[0];
      return {
        ...fallback,
        id: row.id,
        slug: row.slug,
        name: row.name,
        shortName: fallback?.shortName ?? row.name,
        description: row.description ?? "",
        image: row.image_path ?? fallback?.image ?? "",
        featured: true,
      };
    });
}

function mapBrands(rows: StorefrontBrandRow[]): Brand[] {
  return rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description ?? "",
    featured: row.is_featured,
  }));
}

function mapBundles(rows: StorefrontBundleRow[], items: StorefrontBundleItemRow[]): Bundle[] {
  return rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    shortDescription: row.short_description ?? "",
    description: row.description ?? "",
    productIds: items.filter((item) => item.bundle_id === row.id).map((item) => item.product_id),
    retailPrice: Number(row.retail_price),
    compareAtPrice: row.compare_at_price == null ? undefined : Number(row.compare_at_price),
    currency: row.currency,
    priceIsPlaceholder: false,
    featured: row.featured,
    image: row.image_path ?? undefined,
  }));
}
