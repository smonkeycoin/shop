"use client";

import { BrandStrip } from "@/components/shop/BrandStrip";
import { BundleSection } from "@/components/shop/BundleSection";
import { CategoryGrid } from "@/components/shop/CategoryGrid";
import { FeaturedProducts } from "@/components/shop/FeaturedProducts";
import { Hero } from "@/components/shop/Hero";
import { Newsletter } from "@/components/shop/Newsletter";
import { ShopLayout } from "@/components/shop/ShopLayout";
import { TrustBar } from "@/components/shop/TrustBar";
import { featuredBundles, featuredProducts } from "@/data/products";

export default function Home() {
  return (
    <ShopLayout>
      <Hero />
      <TrustBar />
      <CategoryGrid />
      <FeaturedProducts products={featuredProducts} />
      <BundleSection bundles={featuredBundles} />
      <BrandStrip />
      <Newsletter />
    </ShopLayout>
  );
}
