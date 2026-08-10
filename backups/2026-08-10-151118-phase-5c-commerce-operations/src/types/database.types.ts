export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type AdminRole = "owner" | "admin" | "operations" | "catalog" | "readonly";

export type Database = {
  public: {
    Tables: {
      admin_profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          role: AdminRole;
          is_active: boolean;
          created_at: string;
          updated_at: string;
          last_login_at: string | null;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          role: AdminRole;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          last_login_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["admin_profiles"]["Insert"]>;
      };
    };
    Views: {
      storefront_brands: { Row: StorefrontBrandRow };
      storefront_categories: { Row: StorefrontCategoryRow };
      storefront_products: { Row: StorefrontProductRow };
      storefront_product_variants: { Row: StorefrontProductVariantRow };
      storefront_product_images: { Row: StorefrontProductImageRow };
      storefront_bundles: { Row: StorefrontBundleRow };
      storefront_bundle_items: { Row: StorefrontBundleItemRow };
    };
    Functions: {
      claim_admin_profile: {
        Args: Record<PropertyKey, never>;
        Returns: Database["public"]["Tables"]["admin_profiles"]["Row"][];
      };
    };
  };
};

export type StorefrontBrandRow = {
  id: string;
  slug: string;
  name: string;
  manufacturer_name: string | null;
  description: string | null;
  logo_path: string | null;
  is_active: boolean;
  is_featured: boolean;
  sort_order: number;
};

export type StorefrontCategoryRow = {
  id: string;
  parent_id: string | null;
  slug: string;
  name: string;
  description: string | null;
  image_path: string | null;
  is_active: boolean;
  sort_order: number;
};

export type StorefrontProductRow = {
  id: string;
  slug: string;
  sku: string;
  name: string;
  short_name: string | null;
  brand_slug: string | null;
  brand_name: string | null;
  category_slug: string | null;
  category_name: string | null;
  subcategory_slug: string | null;
  subcategory_name: string | null;
  short_description: string | null;
  description: string | null;
  retail_price: number;
  compare_at_price: number | null;
  currency: "MXN";
  stock_status: "in_stock" | "low_stock" | "out_of_stock" | "preorder";
  shipping_class: "small" | "standard" | "bulky" | "special" | null;
  weight_grams: number | null;
  length_cm: number | null;
  width_cm: number | null;
  height_cm: number | null;
  featured: boolean;
  is_new: boolean;
  is_best_seller: boolean;
  usage_notes: string | null;
  age_group: Json;
  tags: Json;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
};

export type StorefrontProductVariantRow = {
  id: string;
  product_id: string;
  sku: string;
  name: string;
  attributes: Record<string, string>;
  retail_price: number | null;
  stock_quantity: number | null;
  available: boolean;
  sort_order: number;
};

export type StorefrontProductImageRow = {
  id: string;
  product_id: string;
  variant_id: string | null;
  storage_path: string;
  alt_text: string | null;
  sort_order: number;
  is_primary: boolean;
  source_type: string | null;
  production_approved: boolean;
  width: number | null;
  height: number | null;
};

export type StorefrontBundleRow = {
  id: string;
  slug: string;
  name: string;
  short_description: string | null;
  description: string | null;
  retail_price: number;
  compare_at_price: number | null;
  currency: "MXN";
  featured: boolean;
  image_path: string | null;
  created_at: string;
  updated_at: string;
};

export type StorefrontBundleItemRow = {
  id: string;
  bundle_id: string;
  product_id: string;
  variant_id: string | null;
  quantity: number;
};
