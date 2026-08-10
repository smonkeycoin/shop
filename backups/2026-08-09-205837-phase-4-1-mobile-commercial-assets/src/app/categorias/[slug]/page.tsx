import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductListing } from "@/components/shop/ProductListing";
import { ShopLayout } from "@/components/shop/ShopLayout";
import { getCategoryBySlug, getProductsByCategory } from "@/data/catalog";

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);

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
  const category = getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const productCount = getProductsByCategory(category.slug).length;

  return (
    <ShopLayout>
      <Suspense fallback={<section className="section-shell catalog-loading">Cargando categoría...</section>}>
        <ProductListing
          breadcrumbs={[
            { label: "Categorías", href: "/categorias" },
            { label: category.shortName },
          ]}
          description={`${category.description} ${productCount} productos disponibles en el catálogo preliminar.`}
          eyebrow="CATEGORÍA"
          initialCategory={category.slug}
          lockedFilters
          title={category.name}
        />
      </Suspense>
    </ShopLayout>
  );
}
