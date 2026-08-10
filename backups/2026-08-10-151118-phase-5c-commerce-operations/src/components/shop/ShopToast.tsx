"use client";

import { useShop } from "./ShopProvider";

export function ShopToast() {
  const { openCart, toast } = useShop();

  if (!toast) {
    return null;
  }

  return (
    <div className="shop-toast" role="status" aria-live="polite">
      <span>{toast}</span>
      <button type="button" onClick={openCart}>
        Ver carrito
      </button>
    </div>
  );
}
