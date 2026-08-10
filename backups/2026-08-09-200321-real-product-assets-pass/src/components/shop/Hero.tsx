import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck } from "lucide-react";

export function Hero() {
  return (
    <section className="hero-section">
      <div className="section-shell hero-inner">
        <div className="hero-copy">
          <span className="pill">
            <BadgeCheck size={16} aria-hidden="true" />
            Tienda en línea para profesionales de la salud
          </span>
          <h1>Equipamiento y productos para terapia respiratoria</h1>
          <p>
            Productos especializados para el manejo de enfermedades respiratorias.
            Calidad, confianza y respaldo profesional.
          </p>
          <div className="hero-actions">
            <Link className="button-primary" href="/productos">
              Ver productos
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <Link className="button-secondary" href="/marcas">
              Marcas destacadas
            </Link>
          </div>
        </div>

        <div className="hero-product-stage" aria-label="Composición editorial de productos respiratorios">
          <Image
            src="/mockup-assets/hero-products.png"
            alt="Productos respiratorios destacados sobre pedestal blanco"
            width={585}
            height={312}
            sizes="(max-width: 900px) 100vw, 58vw"
            priority
          />
        </div>
      </div>
    </section>
  );
}
