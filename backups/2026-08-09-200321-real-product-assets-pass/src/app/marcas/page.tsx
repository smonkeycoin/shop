import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { Breadcrumbs } from "@/components/shop/Breadcrumbs";
import { ShopLayout } from "@/components/shop/ShopLayout";
import { brands, getProductsByBrand } from "@/data/catalog";

export const metadata: Metadata = {
  title: "Marcas seleccionadas | Shop NeumoPractice",
  description: "Marcas y fabricantes respiratorios en catálogo preliminar de Shop NeumoPractice.",
};

export default function BrandsPage() {
  return (
    <ShopLayout>
      <section className="section-shell directory-page">
        <Breadcrumbs items={[{ label: "Marcas" }]} />
        <header className="catalog-hero directory-hero">
          <div>
            <span className="catalog-eyebrow">MARCAS</span>
            <h1>Marcas seleccionadas</h1>
            <p>Equipamiento y soluciones respiratorias de fabricantes especializados.</p>
          </div>
        </header>
        <div className="brand-directory-grid">
          {brands.slice(0, 7).map((brand) => (
            <Link className="brand-directory-card" href={`/marcas/${brand.slug}`} key={brand.slug}>
              <span className="brand-directory-wordmark">{brand.name}</span>
              <p>{brand.description}</p>
              <small>{getProductsByBrand(brand.slug).length} productos</small>
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
