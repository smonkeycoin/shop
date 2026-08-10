"use client";

import { FormEvent, useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { BrandStrip } from "@/components/shop/BrandStrip";
import { CategoryGrid } from "@/components/shop/CategoryGrid";
import { FeaturedProducts } from "@/components/shop/FeaturedProducts";
import { Footer } from "@/components/shop/Footer";
import { Header } from "@/components/shop/Header";
import { Hero } from "@/components/shop/Hero";
import { Newsletter } from "@/components/shop/Newsletter";
import { TrustBar } from "@/components/shop/TrustBar";
import { featuredProducts } from "@/data/products";

export default function Home() {
  const [cartCount, setCartCount] = useState(0);
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");

  const filteredProducts = useMemo(() => {
    const cleanQuery = submittedQuery.trim().toLowerCase();

    if (!cleanQuery) {
      return featuredProducts;
    }

    return featuredProducts.filter((product) =>
      [product.name, product.subtitle, product.category, product.brand]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(cleanQuery),
    );
  }, [submittedQuery]);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmittedQuery(query);
  }

  return (
    <main className="shop-page">
      <Header
        cartCount={cartCount}
        query={query}
        onQueryChange={setQuery}
        onSearch={handleSearch}
      />
      <Hero />
      <TrustBar />
      <CategoryGrid />
      <FeaturedProducts
        products={filteredProducts}
        hasSearch={Boolean(submittedQuery.trim())}
        onAddToCart={() => setCartCount((current) => current + 1)}
      />
      {submittedQuery.trim() && filteredProducts.length === 0 ? (
        <section className="section-shell search-empty" aria-live="polite">
          <p>No encontramos productos para &quot;{submittedQuery}&quot;.</p>
          <button
            type="button"
            className="inline-action"
            onClick={() => {
              setQuery("");
              setSubmittedQuery("");
            }}
          >
            Ver productos destacados
            <ArrowRight size={16} aria-hidden="true" />
          </button>
        </section>
      ) : null}
      <BrandStrip />
      <Newsletter />
      <Footer />
    </main>
  );
}
