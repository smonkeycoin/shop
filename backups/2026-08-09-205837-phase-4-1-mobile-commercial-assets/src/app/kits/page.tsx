import type { Metadata } from "next";
import { BundleCard } from "@/components/shop/BundleCard";
import { Breadcrumbs } from "@/components/shop/Breadcrumbs";
import { ShopLayout } from "@/components/shop/ShopLayout";
import { bundles } from "@/data/catalog";

export const metadata: Metadata = {
  title: "Kits respiratorios | Shop NeumoPractice",
  description: "Kits conceptuales para simplificar compras respiratorias en Shop NeumoPractice.",
};

export default function KitsPage() {
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
            <strong>{bundles.length}</strong>
            <span>kits preparados</span>
          </div>
        </header>
        <div className="bundle-grid full">
          {bundles.map((bundle) => (
            <BundleCard bundle={bundle} key={bundle.id} />
          ))}
        </div>
      </section>
    </ShopLayout>
  );
}
