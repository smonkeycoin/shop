import { BrandStrip } from "@/components/shop/BrandStrip";
import { BundleSection } from "@/components/shop/BundleSection";
import { CategoryGrid } from "@/components/shop/CategoryGrid";
import { FeaturedProducts } from "@/components/shop/FeaturedProducts";
import { Hero } from "@/components/shop/Hero";
import { Newsletter } from "@/components/shop/Newsletter";
import { ShopLayout } from "@/components/shop/ShopLayout";
import { TrustBar } from "@/components/shop/TrustBar";
import { getStorefrontCatalog } from "@/lib/repositories/catalogRepository";

export default async function Home() {
  const catalog = await getStorefrontCatalog();
  const featuredProducts = catalog.products.filter((product) => product.featured).slice(0, 6);
  const featuredBundles = catalog.bundles.filter((bundle) => bundle.featured).slice(0, 3);

  return (
    <ShopLayout>
      <Hero />
      <TrustBar />
      <CategoryGrid />
      <FeaturedProducts products={featuredProducts} />
      <BundleSection bundles={featuredBundles} />
      <BrandStrip brands={catalog.brands.filter((brand) => brand.featured)} />
      <Newsletter />
    </ShopLayout>
  );
}
