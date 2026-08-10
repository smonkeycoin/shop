import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { Breadcrumbs } from "@/components/shop/Breadcrumbs";
import { ShopLayout } from "@/components/shop/ShopLayout";
import { getStorefrontCatalog } from "@/lib/repositories/catalogRepository";

export const metadata: Metadata = {
  title: "Marcas seleccionadas | Shop NeumoPractice",
  description: "Marcas y fabricantes respiratorios en catálogo preliminar de Shop NeumoPractice.",
};

export default async function BrandsPage() {
  const catalog = await getStorefrontCatalog();
  const publicBrands = catalog.brands.filter((brand) => brand.featured);

  return (
    <ShopLayout>
      <section className="section-shell directory-page">
        <Breadcrumbs items={[{ label: "Marcas" }]} />
        <header className="catalog-hero directory-hero">
          <div>
            <span className="catalog-eyebrow">MARCAS</span>
            <h1>Marcas seleccionadas</h1>
            <p>Productos de fabricantes especializados en cuidado respiratorio.</p>
          </div>
        </header>
        <div className="brand-directory-grid">
          {publicBrands.map((brand) => (
            <Link className="brand-directory-card" href={`/marcas/${brand.slug}`} key={brand.slug}>
              <span className="brand-directory-wordmark">{brand.name}</span>
              <p>{brand.description}</p>
              <small>{catalog.products.filter((product) => product.brandSlug === brand.slug).length} productos</small>
              <span className="directory-action">
                Ver productos <ArrowRight size={15} aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </ShopLayout>
  );
}
