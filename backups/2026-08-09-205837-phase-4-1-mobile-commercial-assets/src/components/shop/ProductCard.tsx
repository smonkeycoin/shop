"use client";

import Link from "next/link";
import { useState } from "react";
import { Heart, ShoppingCart } from "lucide-react";
import type { Product } from "@/data/catalog";
import { formatPrice } from "@/data/catalog";
import { getProductAsset } from "@/data/product-assets";
import { getProductDisplayPrice, getPublicStockLabel, getVariantStockStatus } from "@/lib/commerce";
import { useShop } from "./ShopProvider";
import { ProductImage } from "./ProductImage";

type ProductCardProps = {
  product: Product;
  compact?: boolean;
};

export function ProductCard({ product, compact = false }: ProductCardProps) {
  const { addItem, isFavorite, toggleFavorite } = useShop();
  const [selectedVariantId, setSelectedVariantId] = useState(product.variants[0]?.id ?? "");
  const favorite = isFavorite(product.id);
  const selectedVariant =
    product.variants.find((variant) => variant.id === selectedVariantId) ?? product.variants[0];
  const stockStatus = getVariantStockStatus(product, selectedVariant);
  const stockLabel = getPublicStockLabel(stockStatus);
  const canAdd = stockStatus !== "out_of_stock";
  const displayPrice = getProductDisplayPrice(product, selectedVariant);
  const asset = getProductAsset(product.id);

  return (
    <article className={`product-card catalog-card ${compact ? "compact" : ""}`}>
      <Link className="catalog-card-link" href={`/productos/${product.slug}`} aria-label={product.name}>
        <div className="product-image catalog-card-image">
          <ProductImage src={asset?.localPath ?? product.images[0]} alt={product.name} status={asset?.status} />
          <div className="product-badges">
            {product.isNew ? <span>Nuevo</span> : null}
            {product.isBestSeller ? <span>Más vendido</span> : null}
            {product.ageGroup?.includes("Pediátrico") ? <span>Pediátrico</span> : null}
          </div>
        </div>
        <div className="product-body catalog-card-body">
          <span className="product-meta">{product.brand}</span>
          <h3>{product.name}</h3>
          <p className="product-subtitle">{product.shortDescription}</p>
          <span className={`stock-pill ${stockLabel.tone}`}>{stockLabel.label}</span>
          <p className="product-price">
            {product.compareAtPrice ? (
              <span className="compare-price">{formatPrice(product.compareAtPrice, product.currency)}</span>
            ) : null}
            {formatPrice(displayPrice, product.currency)}
            <span className="price-note">Precio placeholder</span>
          </p>
        </div>
      </Link>
      <div className="catalog-card-actions">
        {product.variants.length > 1 && !compact ? (
          <label className="quick-variant">
            <span>Opción</span>
            <select
              aria-label={`Variante para ${product.name}`}
              value={selectedVariant?.id}
              onChange={(event) => setSelectedVariantId(event.target.value)}
            >
              {product.variants.slice(0, 4).map((variant) => (
                <option value={variant.id} key={variant.id}>
                  {variant.name}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <button
          className="icon-favorite"
          type="button"
          aria-label={favorite ? "Quitar de favoritos" : "Guardar en favoritos"}
          aria-pressed={favorite}
          onClick={() => toggleFavorite(product.id)}
        >
          <Heart size={17} fill={favorite ? "currentColor" : "none"} aria-hidden="true" />
        </button>
        <button
          className="add-button compact-add"
          type="button"
          disabled={!canAdd}
          onClick={() => addItem({ product, variant: selectedVariant, quantity: 1 })}
        >
          <ShoppingCart size={15} aria-hidden="true" />
          {canAdd ? "Agregar" : "Agotado"}
        </button>
      </div>
    </article>
  );
}
