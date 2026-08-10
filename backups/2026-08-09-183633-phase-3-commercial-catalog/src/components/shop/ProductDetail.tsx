"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  CheckCircle,
  ChevronDown,
  Headphones,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingCart,
  Truck,
} from "lucide-react";
import type { Product } from "@/data/catalog";
import { formatPrice, getRelatedProducts } from "@/data/catalog";
import { Breadcrumbs } from "./Breadcrumbs";
import { ProductCard } from "./ProductCard";
import { useShop } from "./ShopProvider";

type ProductDetailProps = {
  product: Product;
};

export function ProductDetail({ product }: ProductDetailProps) {
  const [selectedImage, setSelectedImage] = useState(product.images[0]);
  const [selectedVariantId, setSelectedVariantId] = useState(product.variants[0]?.id ?? "");
  const [quantity, setQuantity] = useState(1);
  const { addItem, openCart } = useShop();

  const selectedVariant = useMemo(
    () => product.variants.find((variant) => variant.id === selectedVariantId) ?? product.variants[0],
    [product.variants, selectedVariantId],
  );

  const price = selectedVariant?.price ?? product.price;
  const galleryImages = product.images.length > 1 ? product.images : createGalleryPlaceholders(product);
  const relatedProducts = getRelatedProducts(product, 4);

  function handleAddToCart(openAfterAdd = false) {
    addItem({ product, variant: selectedVariant, quantity });
    if (openAfterAdd) {
      openCart();
    }
  }

  return (
    <>
      <section className="section-shell pdp-page">
        <Breadcrumbs
          items={[
            { label: "Productos", href: "/productos" },
            { label: product.category, href: `/categorias/${product.categorySlug}` },
            { label: product.name },
          ]}
        />

        <div className="pdp-layout">
          <div className="pdp-gallery">
            <div className="pdp-main-image">
              <Image src={selectedImage} alt={product.name} fill sizes="(max-width: 900px) 100vw, 54vw" priority />
            </div>
            <div className="pdp-thumbnails" aria-label="Galería de producto">
              {galleryImages.map((image, index) => (
                <button
                  className={image === selectedImage ? "active" : undefined}
                  type="button"
                  key={`${image}-${index}`}
                  aria-label={`Ver imagen ${index + 1}`}
                  onClick={() => setSelectedImage(image)}
                >
                  <Image src={image} alt="" fill sizes="76px" />
                </button>
              ))}
            </div>
          </div>

          <aside className="pdp-info">
            <Link className="pdp-brand" href={`/marcas/${product.brandSlug}`}>
              {product.brand}
            </Link>
            <h1>{product.name}</h1>
            <div className="pdp-badges">
              {product.ageGroup ? <span>{product.ageGroup}</span> : null}
              {product.featured ? <span>Destacado</span> : null}
              {product.isNew ? <span>Nuevo</span> : null}
            </div>
            <p className="pdp-short-description">{product.shortDescription}</p>
            <div className="pdp-price">
              <strong>{formatPrice(price, product.currency)} MXN</strong>
              <span>Precio de demostración · sujeto a actualización</span>
            </div>

            {product.variants.length > 0 ? (
              <fieldset className="variant-selector">
                <legend>Selecciona una opción</legend>
                <div>
                  {product.variants.map((variant) => (
                    <button
                      className={variant.id === selectedVariantId ? "active" : undefined}
                      type="button"
                      key={variant.id}
                      disabled={!variant.available}
                      onClick={() => setSelectedVariantId(variant.id)}
                    >
                      {variant.name}
                    </button>
                  ))}
                </div>
                <p>SKU: {selectedVariant?.sku ?? product.sku}</p>
              </fieldset>
            ) : null}

            <div className="pdp-purchase-row">
              <div className="quantity-stepper">
                <button type="button" aria-label="Disminuir cantidad" onClick={() => setQuantity((current) => Math.max(1, current - 1))}>
                  <Minus size={16} aria-hidden="true" />
                </button>
                <span>{quantity}</span>
                <button type="button" aria-label="Incrementar cantidad" onClick={() => setQuantity((current) => current + 1)}>
                  <Plus size={16} aria-hidden="true" />
                </button>
              </div>
              <button className="button-primary pdp-add" type="button" onClick={() => handleAddToCart()}>
                <ShoppingCart size={18} aria-hidden="true" />
                Agregar al carrito
              </button>
            </div>

            <button className="button-secondary pdp-secondary" type="button" onClick={() => handleAddToCart(true)}>
              Agregar y seguir comprando
            </button>

            <div className="pdp-trust-list">
              <span>
                <Truck size={17} aria-hidden="true" /> Envíos a todo México
              </span>
              <span>
                <ShieldCheck size={17} aria-hidden="true" /> Productos seleccionados
              </span>
              <span>
                <Headphones size={17} aria-hidden="true" /> Soporte para tu compra
              </span>
            </div>
          </aside>
        </div>

        <div className="pdp-accordions">
          <Accordion title="Descripción">{product.description}</Accordion>
          <Accordion title="Características">
            <List items={product.features} />
          </Accordion>
          <Accordion title="Qué incluye">
            <List items={product.includes} />
          </Accordion>
          <Accordion title="Compatibilidad">
            {product.compatibleWith.length > 0
              ? "Productos relacionados disponibles en la sección inferior. Validar compatibilidad final antes de compra."
              : "Compatibilidad pendiente de validación comercial."}
          </Accordion>
          <Accordion title="Uso y cuidados">
            {product.usageNotes ?? "Consultar instrucciones del fabricante y orientación profesional antes de usar."}
          </Accordion>
          <Accordion title="Envíos y devoluciones">
            Envíos a México en preparación. Las condiciones finales se publicarán antes del lanzamiento comercial.
          </Accordion>
        </div>

        <section className="related-section">
          <div className="section-heading-row">
            <div>
              <h2>También podría interesarte</h2>
            </div>
          </div>
          <div className="related-grid">
            {relatedProducts.map((relatedProduct) => (
              <ProductCard product={relatedProduct} compact key={relatedProduct.id} />
            ))}
          </div>
        </section>
      </section>

      <div className="mobile-sticky-add">
        <span>{formatPrice(price, product.currency)}</span>
        <button type="button" onClick={() => handleAddToCart()}>
          Agregar
        </button>
      </div>
    </>
  );
}

function createGalleryPlaceholders(product: Product) {
  return [product.images[0], product.images[0], product.images[0]];
}

function Accordion({ children, title }: { children: ReactNode; title: string }) {
  return (
    <details className="pdp-accordion">
      <summary>
        <span>{title}</span>
        <ChevronDown size={18} aria-hidden="true" />
      </summary>
      <div>{children}</div>
    </details>
  );
}

function List({ items }: { items: string[] }) {
  return (
    <ul className="pdp-list">
      {items.map((item) => (
        <li key={item}>
          <CheckCircle size={16} aria-hidden="true" />
          {item}
        </li>
      ))}
    </ul>
  );
}
