import type { Metadata } from "next";
import { BundleCard } from "@/components/shop/BundleCard";
import { Breadcrumbs } from "@/components/shop/Breadcrumbs";
import { ShopLayout } from "@/components/shop/ShopLayout";
import { getStorefrontCatalog } from "@/lib/repositories/catalogRepository";

export const metadata: Metadata = {
  title: "Kits respiratorios | Shop NeumoPractice",
  description: "Kits conceptuales para simplificar compras respiratorias en Shop NeumoPractice.",
};

export default async function KitsPage() {
  const catalog = await getStorefrontCatalog();

  return (
    <ShopLayout>
      <section className="section-shell catalog-page">
        <Breadcrumbs items={[{ label: "Kits" }]} />
        <header className="catalog-hero">
          <div>
            <span className="catalog-eyebrow">KITS</span>
            <h1>Kits para hacerlo más simple</h1>
            <p>Bundles conceptuales para agrupar productos frecuentes sin sustituir validación profesional.</p>
          </div>
          <div className="catalog-count">
            <strong>{catalog.bundles.length}</strong>
            <span>kits preparados</span>
          </div>
        </header>
        <div className="bundle-grid full">
          {catalog.bundles.map((bundle) => (
            <BundleCard bundle={bundle} key={bundle.id} />
          ))}
        </div>
      </section>
    </ShopLayout>
  );
}
