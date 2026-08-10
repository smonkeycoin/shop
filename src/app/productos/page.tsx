import { Suspense } from "react";
import type { Metadata } from "next";
import { ProductListing } from "@/components/shop/ProductListing";
import { ShopLayout } from "@/components/shop/ShopLayout";
import { getStorefrontCatalog } from "@/lib/repositories/catalogRepository";

export const metadata: Metadata = {
  title: "Productos para terapia respiratoria | Shop NeumoPractice",
  description:
    "Catálogo preliminar de aerocámaras, nebulización, higiene nasal, monitoreo y accesorios respiratorios.",
};

export default async function ProductsPage() {
  const catalog = await getStorefrontCatalog();

  return (
    <ShopLayout>
      <Suspense fallback={<section className="section-shell catalog-loading">Cargando catálogo...</section>}>
        <ProductListing
          brands={catalog.brands}
          breadcrumbs={[{ label: "Productos" }]}
          categories={catalog.categories}
          title="Productos para respirar mejor"
          description="Encuentra aerocámaras, nebulización, higiene nasal, monitoreo y accesorios respiratorios seleccionados para el cuidado cotidiano."
          products={catalog.products}
        />
      </Suspense>
      <p className="sr-only">{catalog.products.length} productos publicados en catálogo preliminar.</p>
    </ShopLayout>
  );
}
