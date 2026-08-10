"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { products } from "@/data/catalog";
import { getAssetStatusLabel, getAssetWarnings, getProductAsset } from "@/data/product-assets";
import { ProductImage } from "./ProductImage";

export function DevAssetsClient() {
  return (
    <section className="section-shell dev-assets-page">
      <header className="catalog-hero">
        <div>
          <span className="catalog-eyebrow">ASSET AUDIT</span>
          <h1>Product assets</h1>
          <p>Revisión local de fotografías, procedencia y pendientes de SKU antes de aprobar producción.</p>
        </div>
        <Link className="button-secondary" href="/dev/catalog">
          Volver a catálogo
        </Link>
      </header>

      <div className="asset-audit-grid">
        {products.map((product) => {
          const asset = getProductAsset(product.id);
          const warnings = getAssetWarnings(asset);

          return (
            <article className="asset-audit-card" key={product.id}>
              <div className="asset-audit-image">
                <ProductImage src={asset?.localPath} alt={product.name} status={asset?.status} sizes="260px" />
              </div>
              <div className="asset-audit-copy">
                <span className={`asset-status ${asset?.status ?? "placeholder"}`}>
                  {asset ? getAssetStatusLabel(asset.status) : "Placeholder"}
                </span>
                <h2>{product.name}</h2>
                <p>{product.sku}</p>
                <dl>
                  <div>
                    <dt>Source</dt>
                    <dd>{asset?.sourceType ?? "placeholder"}</dd>
                  </div>
                  <div>
                    <dt>Resolution</dt>
                    <dd>{asset?.width && asset.height ? `${asset.width}×${asset.height}` : "Pendiente"}</dd>
                  </div>
                  <div>
                    <dt>Approved</dt>
                    <dd>{asset?.productionApproved ? "Sí" : "No"}</dd>
                  </div>
                </dl>
                {asset?.sourceUrl ? (
                  <a href={asset.sourceUrl} target="_blank" rel="noreferrer">
                    Source URL
                    <ExternalLink size={14} aria-hidden="true" />
                  </a>
                ) : null}
                <div className="warning-row">
                  {warnings.map((warning) => (
                    <span key={warning}>{warning}</span>
                  ))}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
