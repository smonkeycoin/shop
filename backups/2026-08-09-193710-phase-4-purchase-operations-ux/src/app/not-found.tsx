import Link from "next/link";
import { SearchX } from "lucide-react";
import { ShopLayout } from "@/components/shop/ShopLayout";

export default function NotFound() {
  return (
    <ShopLayout>
      <section className="section-shell not-found-page">
        <div className="checkout-card">
          <span className="checkout-icon" aria-hidden="true">
            <SearchX size={36} />
          </span>
          <h1>No encontramos esta página.</h1>
          <p>La ruta puede haber cambiado o todavía no está disponible en esta versión de la tienda.</p>
          <div className="not-found-actions">
            <Link className="button-primary" href="/">
              Ir al inicio
            </Link>
            <Link className="button-secondary" href="/productos">
              Ver productos
            </Link>
          </div>
        </div>
      </section>
    </ShopLayout>
  );
}
