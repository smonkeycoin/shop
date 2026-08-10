import { createClient } from "@supabase/supabase-js";
import { brands, bundles, categories, products, subcategories } from "../src/data/catalog";
import { getProductAsset } from "../src/data/product-assets";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function main() {
  const brandIds = new Map<string, string>();
  const categoryIds = new Map<string, string>();
  const productIds = new Map<string, string>();
  const variantIds = new Map<string, string>();
  const bundleIds = new Map<string, string>();

  for (const brand of brands) {
    const row = await upsertOne("brands", {
      slug: brand.slug,
      name: brand.name,
      description: brand.description,
      is_featured: brand.featured,
      is_active: true,
    });
    brandIds.set(brand.slug, row.id);
  }

  for (const category of categories) {
    const row = await upsertOne("categories", {
      slug: category.slug,
      name: category.name,
      description: category.description,
      image_path: category.image || null,
      is_active: true,
      sort_order: categories.findIndex((item) => item.slug === category.slug),
    });
    categoryIds.set(category.slug, row.id);
  }

  for (const subcategory of subcategories) {
    const row = await upsertOne("categories", {
      parent_id: categoryIds.get(subcategory.categorySlug) ?? null,
      slug: subcategory.slug,
      name: subcategory.name,
      description: null,
      image_path: null,
      is_active: true,
      sort_order: subcategories.findIndex((item) => item.slug === subcategory.slug),
    });
    categoryIds.set(subcategory.slug, row.id);
  }

  for (const product of products) {
    const row = await upsertOne("products", {
      slug: product.slug,
      sku: product.sku,
      name: product.name,
      short_name: product.shortName ?? null,
      brand_id: brandIds.get(product.brandSlug) ?? null,
      category_id: categoryIds.get(product.categorySlug) ?? null,
      subcategory_id: product.subcategorySlug ? categoryIds.get(product.subcategorySlug) ?? null : null,
      short_description: product.shortDescription,
      description: product.description,
      retail_price: product.retailPrice,
      compare_at_price: product.compareAtPrice ?? null,
      cost: null,
      currency: product.currency,
      stock_status: product.stockStatus,
      shipping_class: product.shippingClass ?? null,
      weight_grams: product.weightGrams ?? null,
      length_cm: product.lengthCm ?? null,
      width_cm: product.widthCm ?? null,
      height_cm: product.heightCm ?? null,
      featured: product.featured,
      is_new: product.isNew ?? false,
      is_best_seller: product.isBestSeller ?? false,
      published: product.published !== false,
      active: true,
      usage_notes: product.usageNotes ?? null,
      age_group: product.ageGroup ?? null,
      tags: product.tags ?? null,
      seo_title: product.seoTitle ?? null,
      seo_description: product.seoDescription ?? null,
      market_reference_price: null,
      market_reference_source: null,
      market_reference_updated_at: null,
    });
    productIds.set(product.id, row.id);

    const asset = getProductAsset(product.id);
    const images = [asset?.localPath, ...product.images].filter(Boolean) as string[];
    for (const [index, image] of [...new Set(images)].entries()) {
      await upsertOne(
        "product_images",
        {
          product_id: row.id,
          storage_path: image,
          alt_text: product.name,
          sort_order: index,
          is_primary: index === 0,
          source_type: product.imageSource,
          production_approved: asset?.status === "real",
        },
        "product_id,storage_path",
      );
    }

    for (const [index, variant] of product.variants.entries()) {
      const variantRow = await upsertOne(
        "product_variants",
        {
          product_id: row.id,
          sku: variant.sku,
          name: variant.name,
          attributes: variant.attributes,
          retail_price: variant.retailPrice ?? null,
          cost: null,
          stock_quantity: variant.stockQuantity ?? product.stockQuantity ?? null,
          reorder_point: product.reorderPoint ?? null,
          available: variant.available,
          sort_order: index,
        },
        "sku",
      );
      variantIds.set(variant.id, variantRow.id);

      await upsertOne("inventory", {
        product_id: row.id,
        variant_id: variantRow.id,
        quantity_on_hand: variant.stockQuantity ?? product.stockQuantity ?? 0,
        quantity_reserved: 0,
        reorder_point: product.reorderPoint ?? 0,
      }, "product_id,variant_id");
    }
  }

  for (const bundle of bundles) {
    const row = await upsertOne("bundles", {
      slug: bundle.slug,
      name: bundle.name,
      short_description: bundle.shortDescription,
      description: bundle.description,
      retail_price: bundle.retailPrice,
      compare_at_price: bundle.compareAtPrice ?? null,
      currency: bundle.currency,
      published: true,
      featured: bundle.featured,
      active: true,
      image_path: bundle.image ?? null,
    });
    bundleIds.set(bundle.id, row.id);

    for (const productId of bundle.productIds) {
      const remoteProductId = productIds.get(productId);
      if (!remoteProductId) continue;
      await upsertOne(
        "bundle_items",
        {
          bundle_id: row.id,
          product_id: remoteProductId,
          variant_id: null,
          quantity: 1,
        },
        "bundle_id,product_id,variant_id",
      );
    }
  }

  console.log(
    JSON.stringify(
      {
        products: productIds.size,
        variants: variantIds.size,
        categories: categoryIds.size,
        brands: brandIds.size,
        bundles: bundleIds.size,
      },
      null,
      2,
    ),
  );
}

async function upsertOne(table: string, values: Record<string, unknown>, onConflict = "slug") {
  const { data, error } = await supabase.from(table).upsert(values, { onConflict }).select("id").single();

  if (error) {
    throw new Error(`${table} seed failed: ${error.message}`);
  }

  return data as { id: string };
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
