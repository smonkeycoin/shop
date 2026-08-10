import "server-only";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentAdminProfile } from "@/lib/repositories/adminRepository";
import type { Database } from "@/types/database.generated.types";

type Tables = Database["public"]["Tables"];
export type ProductRow = Tables["products"]["Row"];
export type BrandRow = Tables["brands"]["Row"];
export type CategoryRow = Tables["categories"]["Row"];
export type InventoryRow = Tables["inventory"]["Row"];
export type ProductImageRow = Tables["product_images"]["Row"];
export type ProductVariantRow = Tables["product_variants"]["Row"];
export type SupplierRow = Tables["suppliers"]["Row"];
export type ProductSupplierRow = Tables["product_suppliers"]["Row"];
export type SupplierCostHistoryRow = Tables["supplier_cost_history"]["Row"];
export type BundleRow = Tables["bundles"]["Row"];
export type BundleItemRow = Tables["bundle_items"]["Row"];
export type OrderRow = Tables["orders"]["Row"];
export type OrderItemRow = Tables["order_items"]["Row"];
export type OrderAddressRow = Tables["order_addresses"]["Row"];
export type OrderEventRow = Tables["order_events"]["Row"];
export type OrderInventoryAllocationRow = Tables["order_inventory_allocations"]["Row"];
export type CustomerRow = Tables["customers"]["Row"];
export type CustomerNoteRow = Tables["customer_notes"]["Row"];
export type ShopSettingRow = Tables["shop_settings"]["Row"];
export type AuditRow = Tables["admin_audit_log"]["Row"];

export type ProductListItem = ProductRow & {
  brandName: string;
  categoryName: string;
  imagePath: string | null;
  stockOnHand: number;
  stockReserved: number;
  reorderPoint: number;
};

export type InventoryListItem = InventoryRow & {
  sku: string;
  productName: string;
  variantName: string | null;
  imagePath?: string | null;
};

export type SupplierListItem = SupplierRow & {
  productCount: number;
  lastCostUpdate: string | null;
};

export type OrderListItem = OrderRow & {
  customerName: string;
  customerEmail: string | null;
  customerPhone: string | null;
  itemCount: number;
};

export type CustomerListItem = CustomerRow & {
  orderCount: number;
  totalPurchased: number;
};

export type AnalyticsData = {
  rangeDays: number;
  includeTest: boolean;
  kpis: {
    revenue: number;
    orders: number;
    units: number;
    averageTicket: number;
    grossProfit: number;
    grossMargin: number;
    newCustomers: number;
    repeatRate: number;
  };
  daily: Array<{ date: string; revenue: number; orders: number }>;
  topProducts: Array<{ name: string; sku: string; quantity: number; revenue: number; grossProfit: number }>;
  topCategories: Array<{ name: string; quantity: number; revenue: number }>;
};

export type AdminShellSearchItem = {
  type: "order" | "customer" | "product";
  label: string;
  meta: string;
  href: string;
  keywords: string;
};

export type AdminShellData = {
  counters: {
    actionableOrders: number;
    inventoryAttention: number;
  };
  searchItems: AdminShellSearchItem[];
};

export async function getAdminShellData(): Promise<AdminShellData> {
  const supabase = await createAdminDataClient();
  const [orders, customers, products, inventory] = await Promise.all([
    supabase.from("orders").select("id,order_number,status,total,customer_id,created_at").order("created_at", { ascending: false }).limit(40),
    supabase.from("customers").select("id,first_name,last_name,email,phone").order("updated_at", { ascending: false }).limit(40),
    supabase.from("products").select("id,sku,name,slug,active,published").eq("active", true).order("updated_at", { ascending: false }).limit(60),
    supabase.from("inventory").select("id,quantity_on_hand,quantity_reserved,reorder_point"),
  ]);
  throwFirstError([orders.error, customers.error, products.error, inventory.error]);

  const customerMap = new Map((customers.data ?? []).map((customer) => [customer.id, customer]));
  const actionableOrders = (orders.data ?? []).filter((order) => order.status === "confirmed" || order.status === "preparing").length;
  const inventoryAttention = (inventory.data ?? []).filter((row) => {
    const available = row.quantity_on_hand - row.quantity_reserved;
    return available <= row.reorder_point;
  }).length;

  const searchItems: AdminShellSearchItem[] = [
    ...(orders.data ?? []).map((order) => {
      const customer = order.customer_id ? customerMap.get(order.customer_id) : null;
      const customerName = customer ? `${customer.first_name} ${customer.last_name}`.trim() : "";
      return {
        type: "order" as const,
        label: order.order_number,
        meta: `${customerName || "Cliente"} · ${order.status}`,
        href: `/admin/orders/${order.id}`,
        keywords: `${order.order_number} ${customerName} ${customer?.email ?? ""} ${customer?.phone ?? ""}`,
      };
    }),
    ...(customers.data ?? []).map((customer) => {
      const name = `${customer.first_name} ${customer.last_name}`.trim() || "Cliente";
      return {
        type: "customer" as const,
        label: name,
        meta: customer.email ?? customer.phone ?? "Cliente",
        href: `/admin/customers/${customer.id}`,
        keywords: `${name} ${customer.email ?? ""} ${customer.phone ?? ""}`,
      };
    }),
    ...(products.data ?? []).map((product) => ({
      type: "product" as const,
      label: product.name,
      meta: product.sku,
      href: `/admin/products/${product.id}`,
      keywords: `${product.name} ${product.sku} ${product.slug}`,
    })),
  ];

  return {
    counters: {
      actionableOrders,
      inventoryAttention,
    },
    searchItems,
  };
}

export async function getDashboardData(options?: { includeTest?: boolean }) {
  const supabase = await createAdminDataClient();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayIso = today.toISOString();
  const includeTest = Boolean(options?.includeTest);
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);

  let todayOrdersQuery = supabase.from("orders").select("id,total,payment_status,status,created_at,is_test").gte("created_at", todayIso);
  let paidOrdersQuery = supabase.from("orders").select("id,total,payment_status,created_at,is_test").eq("payment_status", "paid").gte("created_at", todayIso);
  let preparingOrdersQuery = supabase.from("orders").select("id,is_test").in("status", ["confirmed", "preparing"]);
  let latestOrdersQuery = supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(8);
  let salesOrdersQuery = supabase
    .from("orders")
    .select("id,total,payment_status,status,created_at,is_test")
    .gte("created_at", thirtyDaysAgo.toISOString())
    .neq("status", "cancelled");
  if (!includeTest) {
    todayOrdersQuery = todayOrdersQuery.eq("is_test", false);
    paidOrdersQuery = paidOrdersQuery.eq("is_test", false);
    preparingOrdersQuery = preparingOrdersQuery.eq("is_test", false);
    latestOrdersQuery = latestOrdersQuery.eq("is_test", false);
    salesOrdersQuery = salesOrdersQuery.eq("is_test", false).eq("payment_status", "paid");
  }

  const [products, images, suppliers, inventory, customers, todayOrders, paidOrders, preparingOrders, latestOrders, salesOrders, audit] = await Promise.all([
    supabase.from("products").select("id,sku,name,published,active,cost"),
    supabase.from("product_images").select("id,product_id,production_approved,is_primary,storage_path"),
    supabase.from("product_suppliers").select("id,last_cost_update_at"),
    supabase.from("inventory").select("*"),
    supabase.from("customers").select("id", { count: "exact", head: true }),
    todayOrdersQuery,
    paidOrdersQuery,
    preparingOrdersQuery,
    latestOrdersQuery,
    salesOrdersQuery,
    supabase.from("admin_audit_log").select("*").order("created_at", { ascending: false }).limit(8),
  ]);

  throwFirstError([
    products.error,
    images.error,
    suppliers.error,
    inventory.error,
    customers.error,
    todayOrders.error,
    paidOrders.error,
    preparingOrders.error,
    latestOrders.error,
    salesOrders.error,
    audit.error,
  ]);

  const paid = paidOrders.data ?? [];
  const paidTotal = paid.reduce((sum, order) => sum + Number(order.total ?? 0), 0);
  const inventoryRows = inventory.data ?? [];
  const productRows = products.data ?? [];
  const imageRows = images.data ?? [];
  const activePublished = productRows.filter((product) => product.active && product.published);
  const imageProductIds = new Set(imageRows.map((image) => image.product_id));
  const approvedImageProductIds = new Set(imageRows.filter((image) => image.production_approved).map((image) => image.product_id));
  const lowStockRows = inventoryRows.filter((row) => row.quantity_on_hand - row.quantity_reserved <= row.reorder_point && row.quantity_on_hand - row.quantity_reserved > 0);
  const outOfStockRows = inventoryRows.filter((row) => row.quantity_on_hand - row.quantity_reserved <= 0);
  const noCost = activePublished.filter((product) => product.cost == null).length;
  const noApprovedImage = activePublished.filter((product) => !approvedImageProductIds.has(product.id)).length;
  const supplierCostNeedsUpdate = (suppliers.data ?? []).filter((supplier) => !supplier.last_cost_update_at).length;
  const salesSeries30 = buildDailySalesSeries(salesOrders.data ?? [], 30);
  const salesSeries7 = salesSeries30.slice(-7);

  return {
    kpis: {
      salesToday: paidTotal,
      ordersToday: todayOrders.data?.length ?? 0,
      averageTicket: paid.length ? paidTotal / paid.length : 0,
      preparing: preparingOrders.data?.length ?? 0,
      publishedProducts: (products.data ?? []).filter((product) => product.published && product.active).length,
      lowStock: lowStockRows.length,
      outOfStock: outOfStockRows.length,
      customers: customers.count ?? 0,
    },
    hasPaidSales: paid.length > 0,
    includeTest,
    attention: [
      { id: "orders", label: "Pedidos por preparar", count: preparingOrders.data?.length ?? 0, tone: "warning" as const, href: "/admin/orders?status=preparing" },
      { id: "stock", label: "Productos con stock bajo", count: lowStockRows.length + outOfStockRows.length, tone: outOfStockRows.length ? ("critical" as const) : ("warning" as const), href: "/admin/inventory?status=low" },
      { id: "cost", label: "Productos sin costo", count: noCost, tone: "info" as const, href: "/admin/products?filter=no-cost" },
      { id: "assets", label: "Sin imagen aprobada", count: noApprovedImage, tone: "info" as const, href: "/admin/assets" },
      { id: "suppliers", label: "Costos de proveedor pendientes", count: supplierCostNeedsUpdate, tone: "info" as const, href: "/admin/suppliers" },
    ].filter((item) => item.count > 0),
    sales: {
      sevenDays: salesSeries7,
      thirtyDays: salesSeries30,
      hasSales: salesSeries30.some((day) => day.revenue > 0 || day.orders > 0),
    },
    catalogHealth: {
      published: activePublished.length,
      withImage: activePublished.filter((product) => imageProductIds.has(product.id)).length,
      withCost: activePublished.filter((product) => product.cost != null).length,
      lowStock: lowStockRows.length + outOfStockRows.length,
    },
    latestOrders: await hydrateOrders(latestOrders.data ?? []),
    inventoryCritical: await hydrateInventory([...outOfStockRows, ...lowStockRows].slice(0, 5)),
    lowStock: await hydrateInventory([...outOfStockRows, ...lowStockRows].slice(0, 8)),
    audit: audit.data ?? [],
  };
}

export async function getAnalyticsData(options?: { rangeDays?: number; includeTest?: boolean }): Promise<AnalyticsData> {
  const supabase = await createAdminDataClient();
  const rangeDays = Math.min(Math.max(options?.rangeDays ?? 30, 7), 90);
  const includeTest = Boolean(options?.includeTest);
  const since = new Date();
  since.setDate(since.getDate() - (rangeDays - 1));
  since.setHours(0, 0, 0, 0);

  let ordersQuery = supabase
    .from("orders")
    .select("id,total,payment_status,status,created_at,is_test,customer_id")
    .gte("created_at", since.toISOString())
    .order("created_at", { ascending: true });
  if (!includeTest) {
    ordersQuery = ordersQuery.eq("is_test", false);
  }

  const orders = await ordersQuery;
  if (orders.error) throw orders.error;
  const orderRows = orders.data ?? [];
  const orderIds = orderRows.map((order) => order.id);

  const [items, products, categories, customers] = await Promise.all([
    orderIds.length ? supabase.from("order_items").select("*").in("order_id", orderIds) : Promise.resolve({ data: [], error: null }),
    supabase.from("products").select("id,sku,name,category_id,cost"),
    supabase.from("categories").select("id,name"),
    supabase.from("customers").select("id,created_at"),
  ]);
  throwFirstError([items.error, products.error, categories.error, customers.error]);

  const effectiveOrders = orderRows.filter((order) => order.status !== "cancelled" && (order.payment_status === "paid" || includeTest));
  const effectiveIds = new Set(effectiveOrders.map((order) => order.id));
  const effectiveItems = (items.data ?? []).filter((item) => effectiveIds.has(item.order_id));
  const revenue = effectiveOrders.reduce((sum, order) => sum + Number(order.total ?? 0), 0);
  const units = effectiveItems.reduce((sum, item) => sum + item.quantity, 0);
  const grossProfit = effectiveItems.reduce(
    (sum, item) => sum + (Number(item.unit_price ?? 0) - Number(item.cost_snapshot ?? 0)) * item.quantity,
    0,
  );
  const customerCounts = new Map<string, number>();
  for (const order of effectiveOrders) {
    if (order.customer_id) {
      customerCounts.set(order.customer_id, (customerCounts.get(order.customer_id) ?? 0) + 1);
    }
  }

  const productMap = new Map((products.data ?? []).map((product) => [product.id, product]));
  const categoryMap = new Map((categories.data ?? []).map((category) => [category.id, category.name]));
  const byProduct = new Map<string, { name: string; sku: string; quantity: number; revenue: number; grossProfit: number }>();
  const byCategory = new Map<string, { name: string; quantity: number; revenue: number }>();
  for (const item of effectiveItems) {
    const product = item.product_id ? productMap.get(item.product_id) : null;
    const productKey = item.product_id ?? item.bundle_id ?? item.id;
    const productBucket = byProduct.get(productKey) ?? {
      name: item.name,
      sku: item.sku,
      quantity: 0,
      revenue: 0,
      grossProfit: 0,
    };
    productBucket.quantity += item.quantity;
    productBucket.revenue += Number(item.total ?? 0);
    productBucket.grossProfit += (Number(item.unit_price ?? 0) - Number(item.cost_snapshot ?? product?.cost ?? 0)) * item.quantity;
    byProduct.set(productKey, productBucket);

    const categoryKey = product?.category_id ?? "uncategorized";
    const categoryBucket = byCategory.get(categoryKey) ?? {
      name: product?.category_id ? categoryMap.get(product.category_id) ?? "Sin categoria" : "Kits / sin categoria",
      quantity: 0,
      revenue: 0,
    };
    categoryBucket.quantity += item.quantity;
    categoryBucket.revenue += Number(item.total ?? 0);
    byCategory.set(categoryKey, categoryBucket);
  }

  const dailyMap = new Map<string, { date: string; revenue: number; orders: number }>();
  for (let index = rangeDays - 1; index >= 0; index -= 1) {
    const date = new Date();
    date.setDate(date.getDate() - index);
    const key = date.toISOString().slice(0, 10);
    dailyMap.set(key, { date: key, revenue: 0, orders: 0 });
  }
  for (const order of effectiveOrders) {
    const key = order.created_at.slice(0, 10);
    const bucket = dailyMap.get(key);
    if (bucket) {
      bucket.orders += 1;
      bucket.revenue += Number(order.total ?? 0);
    }
  }

  return {
    rangeDays,
    includeTest,
    kpis: {
      revenue,
      orders: effectiveOrders.length,
      units,
      averageTicket: effectiveOrders.length ? revenue / effectiveOrders.length : 0,
      grossProfit,
      grossMargin: revenue > 0 ? (grossProfit / revenue) * 100 : 0,
      newCustomers: (customers.data ?? []).filter((customer) => new Date(customer.created_at) >= since).length,
      repeatRate: customerCounts.size ? ([...customerCounts.values()].filter((count) => count > 1).length / customerCounts.size) * 100 : 0,
    },
    daily: [...dailyMap.values()],
    topProducts: [...byProduct.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 8),
    topCategories: [...byCategory.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 6),
  };
}

export async function getAdminProducts(params?: {
  search?: string;
  filter?: string;
  brand?: string;
  category?: string;
}) {
  const supabase = await createAdminDataClient();
  const [products, brands, categories, images, inventory] = await Promise.all([
    supabase.from("products").select("*").order("updated_at", { ascending: false }),
    supabase.from("brands").select("*"),
    supabase.from("categories").select("*"),
    supabase.from("product_images").select("*").order("sort_order"),
    supabase.from("inventory").select("*"),
  ]);

  throwFirstError([products.error, brands.error, categories.error, images.error, inventory.error]);

  const brandMap = new Map((brands.data ?? []).map((brand) => [brand.id, brand]));
  const categoryMap = new Map((categories.data ?? []).map((category) => [category.id, category]));
  const imageMap = new Map<string, ProductImageRow>();
  for (const image of images.data ?? []) {
    if (!imageMap.has(image.product_id) || image.is_primary) {
      imageMap.set(image.product_id, image);
    }
  }
  const inventoryMap = new Map<string, InventoryRow>();
  for (const row of inventory.data ?? []) {
    if (!row.variant_id) {
      inventoryMap.set(row.product_id, row);
    }
  }

  const search = params?.search?.trim().toLowerCase();
  const filtered = (products.data ?? []).filter((product) => {
    const brand = product.brand_id ? brandMap.get(product.brand_id) : null;
    const inv = inventoryMap.get(product.id);
    const hasImage = imageMap.has(product.id);
    const matchesSearch =
      !search ||
      product.name.toLowerCase().includes(search) ||
      product.sku.toLowerCase().includes(search) ||
      brand?.name.toLowerCase().includes(search);
    const matchesBrand = !params?.brand || product.brand_id === params.brand;
    const matchesCategory = !params?.category || product.category_id === params.category;
    const matchesFilter =
      !params?.filter ||
      params.filter === "all" ||
      (params.filter === "published" && product.published) ||
      (params.filter === "draft" && !product.published) ||
      (params.filter === "no-photo" && !hasImage) ||
      (params.filter === "no-cost" && product.cost == null) ||
      (params.filter === "low-stock" && inv != null && inv.quantity_on_hand <= inv.reorder_point && inv.quantity_on_hand > 0) ||
      (params.filter === "out-of-stock" && inv != null && inv.quantity_on_hand <= 0);

    return matchesSearch && matchesBrand && matchesCategory && matchesFilter;
  });

  return {
    products: filtered.map<ProductListItem>((product) => {
      const inv = inventoryMap.get(product.id);
      return {
        ...product,
        brandName: product.brand_id ? brandMap.get(product.brand_id)?.name ?? "-" : "-",
        categoryName: product.category_id ? categoryMap.get(product.category_id)?.name ?? "-" : "-",
        imagePath: imageMap.get(product.id)?.storage_path ?? null,
        stockOnHand: inv?.quantity_on_hand ?? 0,
        stockReserved: inv?.quantity_reserved ?? 0,
        reorderPoint: inv?.reorder_point ?? 0,
      };
    }),
    brands: brands.data ?? [],
    categories: categories.data ?? [],
  };
}

export async function getProductEditorData(id?: string) {
  const supabase = await createAdminDataClient();
  const [brands, categories, suppliers, product, variants, images, inventory, productSuppliers, costHistory] = await Promise.all([
    supabase.from("brands").select("*").order("name"),
    supabase.from("categories").select("*").order("sort_order"),
    supabase.from("suppliers").select("*").order("name"),
    id ? supabase.from("products").select("*").eq("id", id).maybeSingle() : Promise.resolve({ data: null, error: null }),
    id ? supabase.from("product_variants").select("*").eq("product_id", id).order("sort_order") : Promise.resolve({ data: [], error: null }),
    id ? supabase.from("product_images").select("*").eq("product_id", id).order("sort_order") : Promise.resolve({ data: [], error: null }),
    id ? supabase.from("inventory").select("*").eq("product_id", id).order("variant_id") : Promise.resolve({ data: [], error: null }),
    id ? supabase.from("product_suppliers").select("*").eq("product_id", id).order("preferred", { ascending: false }) : Promise.resolve({ data: [], error: null }),
    supabase.from("supplier_cost_history").select("*").order("recorded_at", { ascending: false }).limit(20),
  ]);

  throwFirstError([brands.error, categories.error, suppliers.error, product.error, variants.error, images.error, inventory.error, productSuppliers.error, costHistory.error]);

  return {
    brands: brands.data ?? [],
    categories: categories.data ?? [],
    suppliers: suppliers.data ?? [],
    product: product.data,
    variants: variants.data ?? [],
    images: images.data ?? [],
    inventory: inventory.data ?? [],
    productSuppliers: productSuppliers.data ?? [],
    costHistory: costHistory.data ?? [],
  };
}

export async function getInventoryRows() {
  const supabase = await createAdminDataClient();
  const [inventory, products, variants, images] = await Promise.all([
    supabase.from("inventory").select("*").order("updated_at", { ascending: false }),
    supabase.from("products").select("id,sku,name"),
    supabase.from("product_variants").select("id,sku,name,product_id"),
    supabase.from("product_images").select("product_id,storage_path,is_primary").order("is_primary", { ascending: false }),
  ]);

  throwFirstError([inventory.error, products.error, variants.error, images.error]);

  const productMap = new Map((products.data ?? []).map((product) => [product.id, product]));
  const variantMap = new Map((variants.data ?? []).map((variant) => [variant.id, variant]));
  const imageMap = new Map<string, string>();
  for (const image of images.data ?? []) {
    if (!imageMap.has(image.product_id) || image.is_primary) {
      imageMap.set(image.product_id, image.storage_path);
    }
  }

  return (inventory.data ?? []).map<InventoryListItem>((row) => {
    const product = productMap.get(row.product_id);
    const variant = row.variant_id ? variantMap.get(row.variant_id) : null;

    return {
      ...row,
      sku: variant?.sku ?? product?.sku ?? "-",
      productName: product?.name ?? "Producto",
      variantName: variant?.name ?? null,
      imagePath: imageMap.get(row.product_id) ?? null,
    };
  });
}

export async function getCategories() {
  const supabase = await createAdminDataClient();
  const { data, error } = await supabase.from("categories").select("*").order("sort_order").order("name");
  if (error) throw error;
  return data ?? [];
}

export async function getBrands() {
  const supabase = await createAdminDataClient();
  const { data, error } = await supabase.from("brands").select("*").order("sort_order").order("name");
  if (error) throw error;
  return data ?? [];
}

export async function getKits() {
  const supabase = await createAdminDataClient();
  const [bundles, items, products] = await Promise.all([
    supabase.from("bundles").select("*").order("updated_at", { ascending: false }),
    supabase.from("bundle_items").select("*"),
    supabase.from("products").select("id,name,retail_price"),
  ]);
  throwFirstError([bundles.error, items.error, products.error]);
  return { bundles: bundles.data ?? [], items: items.data ?? [], products: products.data ?? [] };
}

export async function getAssets() {
  const supabase = await createAdminDataClient();
  const [images, products] = await Promise.all([
    supabase.from("product_images").select("*").order("created_at", { ascending: false }),
    supabase.from("products").select("id,name,sku"),
  ]);
  throwFirstError([images.error, products.error]);
  const productMap = new Map((products.data ?? []).map((product) => [product.id, product]));
  return (images.data ?? []).map((image) => ({ ...image, product: productMap.get(image.product_id) ?? null }));
}

export async function getSuppliers() {
  const supabase = await createAdminDataClient();
  const [suppliers, links] = await Promise.all([
    supabase.from("suppliers").select("*").order("updated_at", { ascending: false }),
    supabase.from("product_suppliers").select("*"),
  ]);
  throwFirstError([suppliers.error, links.error]);
  return (suppliers.data ?? []).map<SupplierListItem>((supplier) => {
    const supplierLinks = (links.data ?? []).filter((link) => link.supplier_id === supplier.id);
    return {
      ...supplier,
      productCount: supplierLinks.length,
      lastCostUpdate: supplierLinks.map((link) => link.last_cost_update_at).filter(Boolean).sort().at(-1) ?? null,
    };
  });
}

export async function getOrders() {
  const supabase = await createAdminDataClient();
  const [orders, items] = await Promise.all([
    supabase.from("orders").select("*").order("created_at", { ascending: false }),
    supabase.from("order_items").select("*"),
  ]);
  throwFirstError([orders.error, items.error]);
  return hydrateOrders(orders.data ?? [], items.data ?? []);
}

export async function getOrderDetail(id: string) {
  const supabase = await createAdminDataClient();
  const [order, items, address, events, allocations] = await Promise.all([
    supabase.from("orders").select("*").eq("id", id).maybeSingle(),
    supabase.from("order_items").select("*").eq("order_id", id),
    supabase.from("order_addresses").select("*").eq("order_id", id),
    supabase.from("order_events").select("*").eq("order_id", id).order("created_at", { ascending: false }),
    supabase.from("order_inventory_allocations").select("*").eq("order_id", id),
  ]);
  throwFirstError([order.error, items.error, address.error, events.error, allocations.error]);
  return {
    order: order.data,
    items: items.data ?? [],
    addresses: address.data ?? [],
    events: events.data ?? [],
    allocations: allocations.data ?? [],
  };
}

export async function getCustomers() {
  const supabase = await createAdminDataClient();
  const [customers, orders] = await Promise.all([
    supabase.from("customers").select("*").order("updated_at", { ascending: false }),
    supabase.from("orders").select("id,customer_id,total,payment_status"),
  ]);
  throwFirstError([customers.error, orders.error]);
  return (customers.data ?? []).map<CustomerListItem>((customer) => {
    const customerOrders = (orders.data ?? []).filter((order) => order.customer_id === customer.id);
    return {
      ...customer,
      orderCount: customerOrders.length,
      totalPurchased: customerOrders.filter((order) => order.payment_status === "paid").reduce((sum, order) => sum + Number(order.total ?? 0), 0),
    };
  });
}

export async function getCustomerDetail(id: string) {
  const supabase = await createAdminDataClient();
  const [customer, orders, notes] = await Promise.all([
    supabase.from("customers").select("*").eq("id", id).maybeSingle(),
    supabase.from("orders").select("*").eq("customer_id", id).order("created_at", { ascending: false }),
    supabase.from("customer_notes").select("*").eq("customer_id", id).order("created_at", { ascending: false }),
  ]);
  throwFirstError([customer.error, orders.error, notes.error]);
  return { customer: customer.data, orders: await hydrateOrders(orders.data ?? []), notes: notes.data ?? [] };
}

export async function getSettings() {
  const supabase = await createAdminDataClient();
  const { data, error } = await supabase.from("shop_settings").select("*").order("key");
  if (error) throw error;
  return data ?? [];
}

async function hydrateOrders(orders: OrderRow[], providedItems?: OrderItemRow[]): Promise<OrderListItem[]> {
  const supabase = await createAdminDataClient();
  const customerIds = orders.map((order) => order.customer_id).filter(Boolean) as string[];
  const [customers, items] = await Promise.all([
    customerIds.length ? supabase.from("customers").select("*").in("id", customerIds) : Promise.resolve({ data: [], error: null }),
    providedItems ? Promise.resolve({ data: providedItems, error: null }) : supabase.from("order_items").select("*").in("order_id", orders.map((order) => order.id)),
  ]);
  throwFirstError([customers.error, items.error]);
  const customerMap = new Map((customers.data ?? []).map((customer) => [customer.id, customer]));
  return orders.map((order) => {
    const customer = order.customer_id ? customerMap.get(order.customer_id) : null;
    const orderItems = (items.data ?? []).filter((item) => item.order_id === order.id);
    return {
      ...order,
      customerName: customer ? `${customer.first_name} ${customer.last_name}`.trim() || "Cliente" : "Cliente por asignar",
      customerEmail: customer?.email ?? null,
      customerPhone: customer?.phone ?? null,
      itemCount: orderItems.reduce((sum, item) => sum + item.quantity, 0),
    };
  });
}

async function hydrateInventory(rows: InventoryRow[]): Promise<InventoryListItem[]> {
  const supabase = await createAdminDataClient();
  const ids = rows.map((row) => row.product_id);
  const [products, images] = await Promise.all([
    ids.length ? supabase.from("products").select("id,sku,name").in("id", ids) : Promise.resolve({ data: [], error: null }),
    ids.length ? supabase.from("product_images").select("product_id,storage_path,is_primary").in("product_id", ids).order("is_primary", { ascending: false }) : Promise.resolve({ data: [], error: null }),
  ]);
  throwFirstError([products.error, images.error]);
  const productMap = new Map((products.data ?? []).map((product) => [product.id, product]));
  const imageMap = new Map<string, string>();
  for (const image of images.data ?? []) {
    if (!imageMap.has(image.product_id) || image.is_primary) {
      imageMap.set(image.product_id, image.storage_path);
    }
  }
  return rows.map((row) => {
    const product = productMap.get(row.product_id);
    return {
      ...row,
      sku: product?.sku ?? "-",
      productName: product?.name ?? "Producto",
      variantName: null,
      imagePath: imageMap.get(row.product_id) ?? null,
    };
  });
}

function buildDailySalesSeries(
  orders: Array<{ total: number | string | null; created_at: string; payment_status: string; status: string }>,
  days: number,
) {
  const map = new Map<string, { date: string; revenue: number; orders: number }>();
  for (let index = days - 1; index >= 0; index -= 1) {
    const date = new Date();
    date.setDate(date.getDate() - index);
    const key = date.toISOString().slice(0, 10);
    map.set(key, { date: key, revenue: 0, orders: 0 });
  }

  for (const order of orders) {
    if (order.status === "cancelled") {
      continue;
    }
    const key = order.created_at.slice(0, 10);
    const bucket = map.get(key);
    if (bucket) {
      bucket.orders += 1;
      bucket.revenue += Number(order.total ?? 0);
    }
  }

  return [...map.values()];
}

function throwFirstError(errors: Array<{ message: string } | null | undefined>) {
  const error = errors.find(Boolean);
  if (error) {
    throw error;
  }
}

async function createAdminDataClient() {
  const { status } = await getCurrentAdminProfile();

  if (status === "unconfigured") {
    redirect("/admin/login?error=oauth_unavailable");
  }

  if (status === "unauthenticated") {
    redirect("/admin/login");
  }

  if (status !== "authorized") {
    redirect("/admin/login?error=unauthorized");
  }

  return createClient();
}
