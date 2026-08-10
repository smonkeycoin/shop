"use client";

import Image from "next/image";
import Link from "next/link";
import { PackagePlus } from "lucide-react";
import type { Bundle } from "@/data/catalog";
import { formatPrice, getBundleProducts } from "@/data/catalog";
import { calculateBundleSavings, getPublicStockLabel, getStockStatus } from "@/lib/commerce";
import { Breadcrumbs } from "./Breadcrumbs";
import { ProductCard } from "./ProductCard";
import { useShop } from "./ShopProvider";

export function BundleDetail({ bundle }: { bundle: Bundle }) {
  const { addBundle, openCart } = useShop();
  const products = getBundleProducts(bundle);
  const savings = calculateBundleSavings(bundle);
  const stockLabel = getPublicStockLabel(getStockStatus({ stockStatus: bundle.stockStatus ?? "in_stock" }));

  function handleAdd(openAfterAdd = false) {
    addBundle({ bundle });
    if (openAfterAdd) {
      openCart();
    }
  }

  return (
    <section className="section-shell bundle-detail-page">
      <Breadcrumbs items={[{ label: "Kits", href: "/kits" }, { label: bundle.name }]} />
      <div className="bundle-detail-layout">
        <div className="bundle-detail-image">
          {bundle.image ? <Image src={bundle.image} alt={bundle.name} fill sizes="(max-width: 900px) 100vw, 48vw" priority /> : null}
        </div>
        <aside className="bundle-detail-info">
          {bundle.badge ? <span className="pill">{bundle.badge}</span> : null}
          <h1>{bundle.name}</h1>
          <p>{bundle.description}</p>
          <span className={`stock-pill ${stockLabel.tone}`}>{stockLabel.label}</span>
          <div className="pdp-price">
            <strong>{formatPrice(bundle.retailPrice, bundle.currency)} MXN</strong>
            {bundle.compareAtPrice ? <span>Precio individual estimado: {formatPrice(bundle.compareAtPrice)}</span> : null}
            {savings > 0 ? <span>Ahorra {formatPrice(savings)}</span> : null}
          </div>
          <div className="bundle-detail-actions">
            <button className="button-primary" type="button" onClick={() => handleAdd()}>
              <PackagePlus size={18} aria-hidden="true" />
              Agregar kit
            </button>
            <button className="button-secondary" type="button" onClick={() => handleAdd(true)}>
              Agregar y abrir carrito
            </button>
          </div>
        </aside>
      </div>

      <section className="related-section">
        <div className="section-heading-row">
          <div>
            <h2>Productos incluidos</h2>
            <p>Compatibilidad por confirmar antes de la compra final.</p>
          </div>
          <Link className="section-link" href="/kits">
            Ver kits
          </Link>
        </div>
        <div className="related-grid">
          {products.map((product) => (
            <ProductCard product={product} compact key={product.id} />
          ))}
        </div>
      </section>
    </section>
  );
}
