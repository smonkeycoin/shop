import Link from "next/link";
import type { Metadata } from "next";
import { CheckCircle2, ShoppingBag } from "lucide-react";
import { ShopLayout } from "@/components/shop/ShopLayout";

export const metadata: Metadata = {
  title: "Checkout próximamente | Shop NeumoPractice",
  description: "Página temporal de checkout para Shop NeumoPractice.",
};

export default function CheckoutPage() {
  return (
    <ShopLayout>
      <section className="section-shell checkout-placeholder">
        <div className="checkout-card">
          <span className="checkout-icon" aria-hidden="true">
            <ShoppingBag size={34} />
            <CheckCircle2 size={18} />
          </span>
          <h1>Checkout próximamente</h1>
          <p>
            Estamos terminando la experiencia de pago de Shop NeumoPractice. Tu carrito se
            conservará durante esta sesión.
          </p>
          <Link className="button-primary" href="/productos">
            Volver a productos
          </Link>
        </div>
      </section>
    </ShopLayout>
  );
}
