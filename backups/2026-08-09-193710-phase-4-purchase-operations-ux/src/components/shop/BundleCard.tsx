"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, PackagePlus } from "lucide-react";
import type { Bundle } from "@/data/catalog";
import { formatPrice, getBundleProducts } from "@/data/catalog";
import { calculateBundleSavings, getPublicStockLabel, getStockStatus } from "@/lib/commerce";
import { useShop } from "./ShopProvider";

type BundleCardProps = {
  bundle: Bundle;
  compact?: boolean;
};

export function BundleCard({ bundle, compact = false }: BundleCardProps) {
  const { addBundle } = useShop();
  const products = getBundleProducts(bundle);
  const savings = calculateBundleSavings(bundle);
  const stockLabel = getPublicStockLabel(getStockStatus({ stockStatus: bundle.stockStatus ?? "in_stock" }));

  return (
    <article className={`bundle-card ${compact ? "compact" : ""}`}>
      <Link href={`/kits/${bundle.slug}`} className="bundle-card-main">
        <div className="bundle-image">
          {bundle.image ? <Image src={bundle.image} alt="" fill sizes="(max-width: 700px) 100vw, 360px" /> : null}
          {bundle.badge ? <span>{bundle.badge}</span> : null}
        </div>
        <div className="bundle-copy">
          <span className={`stock-pill ${stockLabel.tone}`}>{stockLabel.label}</span>
          <h3>{bundle.name}</h3>
          <p>{bundle.shortDescription}</p>
          <small>{products.length} productos incluidos</small>
          <strong>
            {bundle.compareAtPrice ? <span className="compare-price">{formatPrice(bundle.compareAtPrice)}</span> : null}
            {formatPrice(bundle.retailPrice)}
          </strong>
          {savings > 0 ? <em>Ahorra {formatPrice(savings)}</em> : null}
        </div>
      </Link>
      <div className="bundle-actions">
        <button className="add-button" type="button" onClick={() => addBundle({ bundle })}>
          <PackagePlus size={16} aria-hidden="true" />
          Agregar kit
        </button>
        <Link className="section-link" href={`/kits/${bundle.slug}`}>
          Ver kit
          <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
