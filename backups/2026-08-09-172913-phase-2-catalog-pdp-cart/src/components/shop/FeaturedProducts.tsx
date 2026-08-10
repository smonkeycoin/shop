import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShoppingCart } from "lucide-react";
import type { Product } from "@/data/products";

type FeaturedProductsProps = {
  products: Product[];
  hasSearch: boolean;
  onAddToCart: () => void;
};

const pesoFormatter = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
});

export function FeaturedProducts({ products, hasSearch, onAddToCart }: FeaturedProductsProps) {
  return (
    <section className="section-shell products-section">
      <div className="section-heading-row">
        <div>
          <h2>{hasSearch ? "Resultados disponibles" : "Productos destacados"}</h2>
          {hasSearch ? <p>Resultados filtrados localmente con el catálogo preliminar.</p> : null}
        </div>
        <Link className="section-link" href="/productos">
          Ver todos los productos
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>

      <div className="products-grid">
        {products.map((product) => (
          <article className="product-card" key={product.id}>
            <div className="product-image" role="img" aria-label={product.name}>
              <Image
                src={product.image}
                alt=""
                fill
                sizes="(max-width: 680px) 70vw, 150px"
              />
            </div>
            <div className="product-body">
              <span className="product-meta">{product.brand}</span>
              <h3>{product.name}</h3>
              <p className="product-subtitle">{product.subtitle ?? product.category}</p>
              <p className="product-price">
                {pesoFormatter.format(product.price)}
                {product.placeholderPrice ? <span className="price-note">Precio placeholder</span> : null}
              </p>
              <button className="add-button" type="button" onClick={onAddToCart}>
                <ShoppingCart size={16} aria-hidden="true" />
                Agregar al carrito
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
