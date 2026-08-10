import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductListing } from "@/components/shop/ProductListing";
import { ShopLayout } from "@/components/shop/ShopLayout";
import { getBrandBySlug, getPublicProductsByBrand } from "@/data/catalog";
import { getStorefrontCatalog } from "@/lib/repositories/catalogRepository";

type BrandPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: BrandPageProps): Promise<Metadata> {
  const { slug } = await params;
  const brand = getBrandBySlug(slug);

  if (!brand || !brand.featured) {
    return {};
  }

  return {
    title: `${brand.name} | Shop NeumoPractice`,
    description: brand.description,
  };
}

export default async function BrandPage({ params }: BrandPageProps) {
  const { slug } = await params;
  const catalog = await getStorefrontCatalog();
  const brand = catalog.brands.find((item) => item.slug === slug) ?? getBrandBySlug(slug);

  if (!brand || !brand.featured) {
    notFound();
  }

  const scopedProducts = catalog.products.filter((product) => product.brandSlug === brand.slug);
  const productCount = scopedProducts.length || getPublicProductsByBrand(brand.slug).length;

  return (
    <ShopLayout>
      <Suspense fallback={<section className="section-shell catalog-loading">Cargando marca...</section>}>
        <ProductListing
          brands={catalog.brands}
          breadcrumbs={[
            { label: "Marcas", href: "/marcas" },
            { label: brand.name },
          ]}
          categories={catalog.categories}
          description={`${brand.description} ${productCount} productos asociados al catálogo preliminar.`}
          eyebrow="MARCA"
          initialBrand={brand.slug}
          lockedFilters
          products={catalog.products}
          title={brand.name}
        />
      </Suspense>
    </ShopLayout>
  );
}
