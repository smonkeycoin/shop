import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductListing } from "@/components/shop/ProductListing";
import { ShopLayout } from "@/components/shop/ShopLayout";
import { getCategoryBySlug, getPublicProductsByCategory } from "@/data/catalog";
import { getStorefrontCatalog } from "@/lib/repositories/catalogRepository";

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const catalog = await getStorefrontCatalog();
  const category = catalog.categories.find((item) => item.slug === slug) ?? getCategoryBySlug(slug);

  if (!category) {
    return {};
  }

  return {
    title: `${category.shortName} | Shop NeumoPractice`,
    description: category.description,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const catalog = await getStorefrontCatalog();
  const category = catalog.categories.find((item) => item.slug === slug) ?? getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const scopedProducts = catalog.products.filter((product) => product.categorySlug === category.slug);
  const productCount = scopedProducts.length || getPublicProductsByCategory(category.slug).length;

  return (
    <ShopLayout>
      <Suspense fallback={<section className="section-shell catalog-loading">Cargando categoría...</section>}>
        <ProductListing
          brands={catalog.brands}
          breadcrumbs={[
            { label: "Categorías", href: "/categorias" },
            { label: category.shortName },
          ]}
          categories={catalog.categories}
          description={`${category.description} ${productCount} productos disponibles en el catálogo preliminar.`}
          eyebrow="CATEGORÍA"
          initialCategory={category.slug}
          lockedFilters
          products={catalog.products}
          title={category.name}
        />
      </Suspense>
    </ShopLayout>
  );
}
