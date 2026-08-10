"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentAdminProfile } from "@/lib/repositories/adminRepository";
import { slugify, toBool, toNumber } from "./format";
import type { AdminRole } from "@/types/database.types";

const storefrontPaths = ["/", "/productos", "/kits", "/categorias", "/marcas"];

export async function saveProductAction(formData: FormData) {
  await requireRole(["owner", "admin", "catalog"]);
  const supabase = await createClient();
  const id = stringValue(formData, "id");
  const name = requiredString(formData, "name");
  const slug = stringValue(formData, "slug") || slugify(name);
  const sku = requiredString(formData, "sku");
  const publishIntent = stringValue(formData, "intent") === "publish";
  const payload = {
    name,
    slug,
    sku,
    brand_id: nullableString(formData, "brand_id"),
    category_id: nullableString(formData, "category_id"),
    subcategory_id: nullableString(formData, "subcategory_id"),
    short_description: nullableString(formData, "short_description"),
    description: nullableString(formData, "description"),
    retail_price: toNumber(formData.get("retail_price")) ?? 0,
    compare_at_price: toNumber(formData.get("compare_at_price")),
    cost: toNumber(formData.get("cost")),
    market_reference_price: toNumber(formData.get("market_reference_price")),
    market_reference_source: nullableString(formData, "market_reference_source"),
    shipping_class: nullableString(formData, "shipping_class"),
    weight_grams: toNumber(formData.get("weight_grams")),
    length_cm: toNumber(formData.get("length_cm")),
    width_cm: toNumber(formData.get("width_cm")),
    height_cm: toNumber(formData.get("height_cm")),
    tags: splitTags(stringValue(formData, "tags")),
    published: publishIntent || toBool(formData.get("published")),
    featured: toBool(formData.get("featured")),
    is_new: toBool(formData.get("is_new")),
    is_best_seller: toBool(formData.get("is_best_seller")),
    active: toBool(formData.get("active")),
    stock_status: stringValue(formData, "stock_status") || "in_stock",
  };

  const result = id
    ? await supabase.from("products").update(payload).eq("id", id).select("id,slug").single()
    : await supabase.from("products").insert(payload).select("id,slug").single();

  if (result.error) throw result.error;

  const productId = result.data.id;
  const stock = toNumber(formData.get("stock_initial"));
  const reorderPoint = toNumber(formData.get("reorder_point"));
  if (!id || stock != null || reorderPoint != null) {
    const { data: existingInventory } = await supabase
      .from("inventory")
      .select("id,quantity_on_hand,reorder_point")
      .eq("product_id", productId)
      .is("variant_id", null)
      .maybeSingle();
    const inventoryPayload = {
      product_id: productId,
      variant_id: null,
      quantity_on_hand: stock ?? existingInventory?.quantity_on_hand ?? 0,
      quantity_reserved: 0,
      reorder_point: reorderPoint ?? existingInventory?.reorder_point ?? 0,
    };
    const inventoryResult = existingInventory
      ? await supabase.from("inventory").update(inventoryPayload).eq("id", existingInventory.id)
      : await supabase.from("inventory").insert(inventoryPayload);
    if (inventoryResult.error) throw inventoryResult.error;
  }

  await logAdminEvent(id ? "product.update" : "product.create", "product", productId, null, payload);
  revalidateAdminAndStorefront();

  if (!id) {
    redirect(`/admin/products/${productId}`);
  }
}

export async function setProductPublishedAction(formData: FormData) {
  await requireRole(["owner", "admin", "catalog"]);
  const id = requiredString(formData, "id");
  const published = stringValue(formData, "published") === "true";
  const supabase = await createClient();
  const { error } = await supabase.from("products").update({ published }).eq("id", id);
  if (error) throw error;
  await logAdminEvent(published ? "product.publish" : "product.unpublish", "product", id, null, { published });
  revalidateAdminAndStorefront();
}

export async function archiveProductAction(formData: FormData) {
  await requireRole(["owner", "admin", "catalog"]);
  const id = requiredString(formData, "id");
  const supabase = await createClient();
  const { error } = await supabase.from("products").update({ active: false, published: false }).eq("id", id);
  if (error) throw error;
  await logAdminEvent("product.archive", "product", id, null, { active: false, published: false });
  revalidateAdminAndStorefront();
}

export async function uploadProductImageAction(formData: FormData) {
  await requireRole(["owner", "admin", "catalog"]);
  const productId = requiredString(formData, "product_id");
  const altText = nullableString(formData, "alt_text");
  const file = formData.get("image");
  if (!(file instanceof File) || file.size === 0) {
    return;
  }

  const supabase = await createClient();
  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `products/${productId}/original/${Date.now()}-${slugify(file.name.replace(/\.[^.]+$/, ""))}.${extension}`;
  const { error: uploadError } = await supabase.storage.from("product-images").upload(path, file, { upsert: false });
  if (uploadError) throw uploadError;

  const { data: existingImages } = await supabase.from("product_images").select("id").eq("product_id", productId).limit(1);
  const { error } = await supabase.from("product_images").insert({
    product_id: productId,
    storage_path: path,
    alt_text: altText,
    is_primary: !existingImages?.length,
    source_type: "admin_upload",
    production_approved: false,
  });
  if (error) throw error;
  await logAdminEvent("image.upload", "product", productId, null, { path });
  revalidateAdminAndStorefront();
}

export async function setPrimaryImageAction(formData: FormData) {
  await requireRole(["owner", "admin", "catalog"]);
  const productId = requiredString(formData, "product_id");
  const imageId = requiredString(formData, "image_id");
  const supabase = await createClient();
  await supabase.from("product_images").update({ is_primary: false }).eq("product_id", productId);
  const { error } = await supabase.from("product_images").update({ is_primary: true }).eq("id", imageId);
  if (error) throw error;
  await logAdminEvent("image.primary", "product", productId, null, { imageId });
  revalidateAdminAndStorefront();
}

export async function approveImageAction(formData: FormData) {
  await requireRole(["owner", "admin", "catalog"]);
  const imageId = requiredString(formData, "image_id");
  const supabase = await createClient();
  const { error } = await supabase.from("product_images").update({ production_approved: true }).eq("id", imageId);
  if (error) throw error;
  await logAdminEvent("image.production_approved", "product_image", imageId, null, null);
  revalidateAdminAndStorefront();
}

export async function deleteImageAction(formData: FormData) {
  await requireRole(["owner", "admin", "catalog"]);
  const imageId = requiredString(formData, "image_id");
  const storagePath = requiredString(formData, "storage_path");
  const supabase = await createClient();
  await supabase.storage.from("product-images").remove([storagePath]);
  const { error } = await supabase.from("product_images").delete().eq("id", imageId);
  if (error) throw error;
  await logAdminEvent("image.delete", "product_image", imageId, { storagePath }, null);
  revalidateAdminAndStorefront();
}

export async function adjustStockAction(formData: FormData) {
  const profile = await requireRole(["owner", "admin", "operations", "catalog"]);
  const inventoryId = requiredString(formData, "inventory_id");
  const delta = toNumber(formData.get("delta")) ?? 0;
  const reason = stringValue(formData, "reason") || "Correccion";
  const notes = nullableString(formData, "notes");
  const supabase = await createClient();
  const { data: inventory, error: inventoryError } = await supabase.from("inventory").select("*").eq("id", inventoryId).single();
  if (inventoryError) throw inventoryError;
  const previous = inventory.quantity_on_hand;
  const next = Math.max(0, previous + delta);
  const { error } = await supabase.from("inventory").update({ quantity_on_hand: next }).eq("id", inventoryId);
  if (error) throw error;
  const movement = {
    product_id: inventory.product_id,
    variant_id: inventory.variant_id,
    quantity: delta,
    previous_quantity: previous,
    new_quantity: next,
    type: "adjustment",
    reason: notes ? `${reason}: ${notes}` : reason,
    created_by: profile.id,
  };
  const { error: movementError } = await supabase.from("inventory_movements").insert(movement);
  if (movementError) throw movementError;
  await logAdminEvent("stock.adjust", "inventory", inventoryId, { previous }, { next, reason });
  revalidateAdminAndStorefront();
}

export async function saveCategoryAction(formData: FormData) {
  await saveSimpleCatalogEntity("categories", formData, ["owner", "admin", "catalog"]);
}

export async function saveBrandAction(formData: FormData) {
  await requireRole(["owner", "admin", "catalog"]);
  const id = stringValue(formData, "id");
  const name = requiredString(formData, "name");
  const payload = {
    name,
    slug: stringValue(formData, "slug") || slugify(name),
    manufacturer_name: nullableString(formData, "manufacturer_name"),
    website_url: nullableString(formData, "website_url"),
    description: nullableString(formData, "description"),
    logo_path: nullableString(formData, "logo_path"),
    is_featured: toBool(formData.get("is_featured")),
    is_active: toBool(formData.get("is_active")),
    sort_order: toNumber(formData.get("sort_order")) ?? 0,
  };
  const supabase = await createClient();
  const result = id ? await supabase.from("brands").update(payload).eq("id", id) : await supabase.from("brands").insert(payload);
  if (result.error) throw result.error;
  await logAdminEvent(id ? "brand.update" : "brand.create", "brand", id || null, null, payload);
  revalidateAdminAndStorefront();
}

export async function saveSupplierAction(formData: FormData) {
  await requireRole(["owner", "admin", "catalog"]);
  const id = stringValue(formData, "id");
  const name = requiredString(formData, "name");
  const payload = {
    name,
    contact_name: nullableString(formData, "contact_name"),
    email: nullableString(formData, "email"),
    phone: nullableString(formData, "phone"),
    whatsapp: nullableString(formData, "whatsapp"),
    website: nullableString(formData, "website"),
    notes: nullableString(formData, "notes"),
    active: toBool(formData.get("active")),
  };
  const supabase = await createClient();
  const result = id ? await supabase.from("suppliers").update(payload).eq("id", id) : await supabase.from("suppliers").insert(payload);
  if (result.error) throw result.error;
  await logAdminEvent(id ? "supplier.update" : "supplier.create", "supplier", id || null, null, payload);
  revalidatePath("/admin/suppliers");
}

export async function saveProductSupplierAction(formData: FormData) {
  const profile = await requireRole(["owner", "admin", "catalog"]);
  const id = stringValue(formData, "id");
  const productId = requiredString(formData, "product_id");
  const supplierCost = toNumber(formData.get("supplier_cost"));
  const payload = {
    product_id: productId,
    supplier_id: requiredString(formData, "supplier_id"),
    supplier_sku: nullableString(formData, "supplier_sku"),
    supplier_cost: supplierCost,
    minimum_order_quantity: toNumber(formData.get("minimum_order_quantity")),
    lead_time_days: toNumber(formData.get("lead_time_days")),
    preferred: toBool(formData.get("preferred")),
    last_cost_update_at: supplierCost == null ? null : new Date().toISOString(),
  };
  const supabase = await createClient();
  const result = id
    ? await supabase.from("product_suppliers").update(payload).eq("id", id).select("id,supplier_cost").single()
    : await supabase.from("product_suppliers").insert(payload).select("id,supplier_cost").single();
  if (result.error) throw result.error;
  if (supplierCost != null) {
    await supabase.from("supplier_cost_history").insert({
      product_supplier_id: result.data.id,
      cost: supplierCost,
      recorded_by: profile.id,
    });
    await logAdminEvent("supplier.cost_change", "product_supplier", result.data.id, null, { supplierCost });
  }
  revalidateAdminAndStorefront();
}

export async function saveKitAction(formData: FormData) {
  await requireRole(["owner", "admin", "catalog"]);
  const id = stringValue(formData, "id");
  const name = requiredString(formData, "name");
  const supabase = await createClient();
  const payload = {
    name,
    slug: stringValue(formData, "slug") || slugify(name),
    short_description: nullableString(formData, "short_description"),
    description: nullableString(formData, "description"),
    retail_price: toNumber(formData.get("retail_price")) ?? 0,
    compare_at_price: toNumber(formData.get("compare_at_price")),
    featured: toBool(formData.get("featured")),
    published: toBool(formData.get("published")),
    active: toBool(formData.get("active")),
    image_path: nullableString(formData, "image_path"),
  };
  const result = id ? await supabase.from("bundles").update(payload).eq("id", id).select("id").single() : await supabase.from("bundles").insert(payload).select("id").single();
  if (result.error) throw result.error;
  const bundleId = result.data.id;
  const productId = stringValue(formData, "product_id");
  if (productId) {
    await supabase.from("bundle_items").insert({ bundle_id: bundleId, product_id: productId, quantity: toNumber(formData.get("quantity")) ?? 1 });
  }
  await logAdminEvent(id ? "kit.update" : "kit.create", "bundle", bundleId, null, payload);
  revalidateAdminAndStorefront();
}

export async function updateOrderStatusAction(formData: FormData) {
  await requireRole(["owner", "admin", "operations"]);
  const id = requiredString(formData, "id");
  const status = requiredString(formData, "status");
  const supabase = await createClient();
  const { error } = await supabase.rpc("transition_order_status", {
    target_order_id: id,
    target_status: status,
    carrier_input: nullableString(formData, "carrier") ?? undefined,
    tracking_number_input: nullableString(formData, "tracking_number") ?? undefined,
    tracking_url_input: nullableString(formData, "tracking_url") ?? undefined,
    notes_input: nullableString(formData, "notes") ?? undefined,
  });
  if (error) throw error;
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/admin/analytics");
}

export async function saveCustomerNotesAction(formData: FormData) {
  const profile = await requireRole(["owner", "admin", "operations"]);
  const id = requiredString(formData, "id");
  const notes = nullableString(formData, "notes");
  const tags = splitTags(stringValue(formData, "tags"));
  const supabase = await createClient();
  const { error } = await supabase.from("customers").update({ tags }).eq("id", id);
  if (error) throw error;
  if (notes) {
    const { error: noteError } = await supabase.from("customer_notes").insert({
      customer_id: id,
      author_id: profile.id,
      note: notes,
      tags,
      activity_type: "note",
    });
    if (noteError) throw noteError;
  }
  await logAdminEvent("customer.update", "customer", id, null, { noteAdded: Boolean(notes), tags });
  revalidatePath("/admin/customers");
  revalidatePath(`/admin/customers/${id}`);
}

export async function saveSettingsAction(formData: FormData) {
  const profile = await requireRole(["owner", "admin"]);
  const supabase = await createClient();
  const keys = [
    "shop_name",
    "support_email",
    "support_whatsapp",
    "whatsapp_business_number",
    "free_shipping_threshold",
    "default_shipping_cost",
    "currency",
    "storefront_enabled",
    "checkout_enabled",
    "orders_enabled",
    "checkout_mode",
  ];
  for (const key of keys) {
    const numeric = key.includes("threshold") || key.includes("cost");
    const boolean = key === "storefront_enabled" || key === "checkout_enabled" || key === "orders_enabled";
    const raw = formData.get(key);
    await supabase.from("shop_settings").upsert(
      {
        key,
        value: boolean ? toBool(raw) : numeric ? toNumber(raw) ?? 0 : stringValue(formData, key),
        is_public: key !== "support_email",
        updated_by: profile.id,
      },
      { onConflict: "key" },
    );
  }
  await logAdminEvent("settings.update", "shop_settings", null, null, { keys });
  revalidateAdminAndStorefront();
}

async function saveSimpleCatalogEntity(table: "categories", formData: FormData, roles: AdminRole[]) {
  await requireRole(roles);
  const id = stringValue(formData, "id");
  const name = requiredString(formData, "name");
  const payload = {
    name,
    slug: stringValue(formData, "slug") || slugify(name),
    description: nullableString(formData, "description"),
    parent_id: nullableString(formData, "parent_id"),
    sort_order: toNumber(formData.get("sort_order")) ?? 0,
    is_active: toBool(formData.get("is_active")),
    image_path: nullableString(formData, "image_path"),
  };
  const supabase = await createClient();
  const result = id ? await supabase.from(table).update(payload).eq("id", id) : await supabase.from(table).insert(payload);
  if (result.error) throw result.error;
  await logAdminEvent(id ? "category.update" : "category.create", "category", id || null, null, payload);
  revalidateAdminAndStorefront();
}

async function requireRole(roles: AdminRole[]) {
  const { profile, status } = await getCurrentAdminProfile();
  if (status !== "authorized" || !profile || !roles.includes(profile.role)) {
    redirect("/admin/login?error=unauthorized");
  }

  return profile;
}

async function logAdminEvent(action: string, entityType: string, entityId: string | null, beforeData: unknown, afterData: unknown) {
  const { profile } = await getCurrentAdminProfile();
  const supabase = await createClient();
  await supabase.from("admin_audit_log").insert({
    actor_id: profile?.id ?? null,
    action,
    entity_type: entityType,
    entity_id: entityId,
    before_data: beforeData == null ? null : JSON.parse(JSON.stringify(beforeData)),
    after_data: afterData == null ? null : JSON.parse(JSON.stringify(afterData)),
  });
}

function revalidateAdminAndStorefront() {
  revalidatePath("/admin");
  revalidatePath("/admin/products");
  revalidatePath("/admin/inventory");
  revalidatePath("/admin/assets");
  revalidateTag("storefront-catalog", "max");
  storefrontPaths.forEach((path) => revalidatePath(path));
}

function stringValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function nullableString(formData: FormData, key: string) {
  const value = stringValue(formData, key);
  return value || null;
}

function requiredString(formData: FormData, key: string) {
  const value = stringValue(formData, key);
  if (!value) {
    throw new Error(`Missing ${key}`);
  }
  return value;
}

function splitTags(value: string) {
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}
