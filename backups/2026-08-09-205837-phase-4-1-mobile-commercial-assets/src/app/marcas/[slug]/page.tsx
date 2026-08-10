import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductListing } from "@/components/shop/ProductListing";
import { ShopLayout } from "@/components/shop/ShopLayout";
import { getBrandBySlug, getProductsByBrand } from "@/data/catalog";

type BrandPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: BrandPageProps): Promise<Metadata> {
  const { slug } = await params;
  const brand = getBrandBySlug(slug);

  if (!brand) {
    return {};
  }

  return {
    title: `${brand.name} | Shop NeumoPractice`,
    description: brand.description,
  };
}

export default async function BrandPage({ params }: BrandPageProps) {
  const { slug } = await params;
  const brand = getBrandBySlug(slug);

  if (!brand) {
    notFound();
  }

  const productCount = getProductsByBrand(brand.slug).length;

  return (
    <ShopLayout>
      <Suspense fallback={<section className="section-shell catalog-loading">Cargando marca...</section>}>
        <ProductListing
          breadcrumbs={[
            { label: "Marcas", href: "/marcas" },
            { label: brand.name },
          ]}
          description={`${brand.description} ${productCount} productos asociados al catálogo preliminar.`}
          eyebrow="MARCA"
          initialBrand={brand.slug}
          lockedFilters
          title={brand.name}
        />
      </Suspense>
    </ShopLayout>
  );
}
