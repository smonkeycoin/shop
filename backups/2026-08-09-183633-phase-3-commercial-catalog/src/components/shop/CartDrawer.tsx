"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, PackageSearch, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { formatPrice } from "@/data/catalog";
import { useShop } from "./ShopProvider";

export function CartDrawer() {
  const {
    cartItems,
    cartCount,
    closeCart,
    isCartOpen,
    removeItem,
    resolveCartProduct,
    subtotal,
    updateQuantity,
  } = useShop();

  return (
    <div className={`cart-layer ${isCartOpen ? "open" : ""}`} aria-hidden={!isCartOpen}>
      <button className="cart-backdrop" type="button" aria-label="Cerrar carrito" onClick={closeCart} />
      <aside
        className="cart-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
        tabIndex={-1}
      >
        <header className="cart-drawer-header">
          <div>
            <h2 id="cart-title">Tu carrito</h2>
            <p>{cartCount} producto{cartCount === 1 ? "" : "s"}</p>
          </div>
          <button type="button" className="icon-button" aria-label="Cerrar carrito" onClick={closeCart}>
            <X size={20} aria-hidden="true" />
          </button>
        </header>

        {cartItems.length === 0 ? (
          <div className="empty-cart">
            <ShoppingBag size={42} aria-hidden="true" />
            <h3>Tu carrito está vacío</h3>
            <p>Explora nuestros productos respiratorios.</p>
            <Link className="button-primary" href="/productos" onClick={closeCart}>
              Ver productos
            </Link>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {cartItems.map((item) => {
                const product = resolveCartProduct(item);
                const itemSubtotal = item.price * item.quantity;

                return (
                  <article className="cart-item" key={`${item.productId}-${item.variantId}`}>
                    <div className="cart-item-image">
                      {product?.images[0] ? (
                        <Image src={product.images[0]} alt="" fill sizes="74px" />
                      ) : (
                        <PackageSearch size={22} aria-hidden="true" />
                      )}
                    </div>
                    <div className="cart-item-info">
                      <h3>{product?.shortName ?? item.slug}</h3>
                      <p>{item.variantName}</p>
                      <span>{formatPrice(item.price)}</span>
                    </div>
                    <div className="cart-item-controls">
                      <div className="quantity-stepper small">
                        <button
                          type="button"
                          aria-label="Disminuir cantidad"
                          onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)}
                        >
                          <Minus size={14} aria-hidden="true" />
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          type="button"
                          aria-label="Incrementar cantidad"
                          onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}
                        >
                          <Plus size={14} aria-hidden="true" />
                        </button>
                      </div>
                      <strong>{formatPrice(itemSubtotal)}</strong>
                      <button
                        type="button"
                        className="remove-item"
                        aria-label="Eliminar producto"
                        onClick={() => removeItem(item.productId, item.variantId)}
                      >
                        <Trash2 size={15} aria-hidden="true" />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
            <footer className="cart-summary">
              <div>
                <span>Subtotal</span>
                <strong>{formatPrice(subtotal)}</strong>
              </div>
              <div>
                <span>Shipping</span>
                <span>Calculado al finalizar</span>
              </div>
              <div className="cart-total">
                <span>Total estimado</span>
                <strong>{formatPrice(subtotal)} MXN</strong>
              </div>
              <p>Los precios mostrados actualmente son demostrativos.</p>
              <Link className="button-primary cart-checkout" href="/checkout" onClick={closeCart}>
                Continuar
              </Link>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}
