import { Suspense } from "react";
import type { Metadata } from "next";
import { ProductListing } from "@/components/shop/ProductListing";
import { ShopLayout } from "@/components/shop/ShopLayout";
import { products } from "@/data/catalog";

export const metadata: Metadata = {
  title: "Productos para terapia respiratoria | Shop NeumoPractice",
  description:
    "Catálogo preliminar de aerocámaras, nebulización, higiene nasal, monitoreo y accesorios respiratorios.",
};

export default function ProductsPage() {
  return (
    <ShopLayout>
      <Suspense fallback={<section className="section-shell catalog-loading">Cargando catálogo...</section>}>
        <ProductListing
          breadcrumbs={[{ label: "Productos" }]}
          title="Productos para respirar mejor"
          description="Encuentra aerocámaras, nebulización, higiene nasal, monitoreo y accesorios respiratorios seleccionados para el cuidado cotidiano."
        />
      </Suspense>
      <p className="sr-only">{products.length} productos en catálogo preliminar.</p>
    </ShopLayout>
  );
}
