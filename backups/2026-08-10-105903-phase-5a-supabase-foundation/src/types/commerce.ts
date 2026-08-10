import type { LucideIcon } from "lucide-react";

export type Currency = "MXN";
export type ImageSource = "placeholder" | "authorized" | "manufacturer" | "internal" | "reference" | "pending";
export type ShippingClass = "small" | "standard" | "bulky" | "special";
export type StockStatus = "in_stock" | "low_stock" | "out_of_stock" | "preorder";

export type ProductVariant = {
  id: string;
  sku: string;
  name: string;
  attributes: Record<string, string>;
  retailPrice?: number;
  cost?: number | null;
  stockQuantity?: number;
  available: boolean;
  image?: string;
};

export type Product = {
  id: string;
  slug: string;
  sku: string;
  name: string;
  shortName?: string;
  brand: string;
  brandSlug: string;
  category: string;
  categorySlug: string;
  subcategory?: string;
  subcategorySlug?: string;
  shortDescription: string;
  description: string;
  images: string[];
  imageSource: ImageSource;
  currency: Currency;
  retailPrice: number;
  compareAtPrice?: number;
  priceIsPlaceholder: boolean;
  cost?: number | null;
  estimatedMargin?: number | null;
  featured: boolean;
  isNew?: boolean;
  isBestSeller?: boolean;
  stockStatus: StockStatus;
  stockQuantity?: number;
  reorderPoint?: number;
  supplier?: string | null;
  variants: ProductVariant[];
  compatibleWith: string[];
  relatedProductIds?: string[];
  upsellProductIds?: string[];
  features: string[];
  includes: string[];
  usageNotes?: string;
  ageGroup?: string[];
  tags?: string[];
  shippingClass?: ShippingClass;
  weightGrams?: number;
  lengthCm?: number;
  widthCm?: number;
  heightCm?: number;
  seoTitle?: string;
  seoDescription?: string;
  skuIsTemporary?: boolean;
  published?: boolean;
};

export type Category = {
  id: string;
  name: string;
  shortName: string;
  slug: string;
  description: string;
  image: string;
  icon: LucideIcon;
  featured: boolean;
};

export type Brand = {
  id: string;
  name: string;
  slug: string;
  description: string;
  featured: boolean;
};

export type Subcategory = {
  id: string;
  name: string;
  slug: string;
  categorySlug: string;
};

export type Bundle = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  productIds: string[];
  retailPrice: number;
  compareAtPrice?: number;
  currency: Currency;
  priceIsPlaceholder: boolean;
  featured: boolean;
  image?: string;
  badge?: string;
  stockStatus?: StockStatus;
  shippingClass?: ShippingClass;
  associatedProductIds?: string[];
};
