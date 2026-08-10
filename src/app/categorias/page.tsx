import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { Breadcrumbs } from "@/components/shop/Breadcrumbs";
import { CategoryVisual } from "@/components/shop/CategoryGrid";
import { ShopLayout } from "@/components/shop/ShopLayout";
import { categories, getProductsByCategory } from "@/data/catalog";

export const metadata: Metadata = {
  title: "Compra por categoría | Shop NeumoPractice",
  description:
    "Explora aerocámaras, nebulización, higiene nasal, monitoreo, terapia respiratoria y accesorios.",
};

export default function CategoriesPage() {
  return (
    <ShopLayout>
      <section className="section-shell directory-page">
        <Breadcrumbs items={[{ label: "Categorías" }]} />
        <header className="catalog-hero directory-hero">
          <div>
            <span className="catalog-eyebrow">CATEGORÍAS</span>
            <h1>Compra por categoría</h1>
            <p>Encuentra productos respiratorios desde una navegación clara para pacientes, padres y profesionales.</p>
          </div>
        </header>
        <div className="directory-grid">
          {categories.map((category) => {
            const productCount = getProductsByCategory(category.slug).length;

            return (
              <Link className="directory-card" href={`/categorias/${category.slug}`} key={category.slug}>
                <span className="directory-image">
                  <CategoryVisual slug={category.slug} />
                </span>
                <span className="directory-card-content">
                  <strong>{category.shortName}</strong>
                  <p>{category.description}</p>
                  <small>{productCount} productos</small>
                  <span className="directory-action">
                    Explorar <ArrowRight size={15} aria-hidden="true" />
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      </section>
    </ShopLayout>
  );
}
