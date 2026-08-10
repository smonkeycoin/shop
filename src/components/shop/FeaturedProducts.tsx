import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Product } from "@/data/products";
import { ProductCard } from "./ProductCard";

type FeaturedProductsProps = {
  products: Product[];
};

export function FeaturedProducts({ products }: FeaturedProductsProps) {
  return (
    <section className="section-shell products-section">
      <div className="section-heading-row">
        <div>
          <h2>Productos destacados</h2>
        </div>
        <Link className="section-link" href="/productos">
          Ver todos los productos
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>

      <div className="products-grid">
        {products.map((product) => (
          <ProductCard product={product} compact key={product.id} />
        ))}
      </div>
    </section>
  );
}
