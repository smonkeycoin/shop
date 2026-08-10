"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { Breadcrumbs } from "@/components/shop/Breadcrumbs";
import { ProductCard } from "@/components/shop/ProductCard";
import { ShopLayout } from "@/components/shop/ShopLayout";
import { useShop } from "@/components/shop/ShopProvider";
import { publicProducts } from "@/data/catalog";

export default function FavoritesPage() {
  const { favoriteIds } = useShop();
  const favoriteProducts = publicProducts.filter((product) => favoriteIds.includes(product.id));

  return (
    <ShopLayout>
      <section className="section-shell directory-page">
        <Breadcrumbs items={[{ label: "Favoritos" }]} />
        <header className="catalog-hero directory-hero">
          <div>
            <span className="catalog-eyebrow">FAVORITOS</span>
            <h1>Productos guardados</h1>
            <p>Favoritos locales guardados en este navegador.</p>
          </div>
        </header>
        {favoriteProducts.length > 0 ? (
          <div className="catalog-products-grid favorites-grid">
            {favoriteProducts.map((product) => (
              <ProductCard product={product} key={product.id} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <Heart size={38} aria-hidden="true" />
            <h2>Aún no tienes favoritos.</h2>
            <p>Guarda productos desde el catálogo para encontrarlos rápido después.</p>
            <Link className="button-primary" href="/productos">
              Ver productos
            </Link>
          </div>
        )}
      </section>
    </ShopLayout>
  );
}
