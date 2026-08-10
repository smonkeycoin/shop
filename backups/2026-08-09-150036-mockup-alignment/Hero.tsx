import Link from "next/link";
import { ArrowRight, BadgeCheck, Droplets, Shield, Wind } from "lucide-react";

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
          <div className="product-orbit" aria-hidden="true" />
          <div className="hero-pedestal" aria-hidden="true" />
          <div className="hero-product primary">
            <span className="product-shape">
              <Shield size={76} strokeWidth={1.45} aria-hidden="true" />
            </span>
            <span className="product-caption">AeroChamber</span>
          </div>
          <div className="hero-product tall">
            <span className="mock-bottle" aria-hidden="true" />
            <span className="product-caption">NeilMed</span>
          </div>
          <div className="hero-product round">
            <span className="product-shape">
              <Wind size={54} strokeWidth={1.55} aria-hidden="true" />
            </span>
            <span className="product-caption">Vortex</span>
          </div>
          <div className="hero-product small">
            <span className="product-shape">
              <Droplets size={44} strokeWidth={1.55} aria-hidden="true" />
            </span>
            <span className="product-caption">Solución nasal</span>
          </div>
          <div className="hero-product mist">
            <span className="mock-bottle" aria-hidden="true" />
            <span className="product-caption">Pedia Mist</span>
          </div>
        </div>
      </div>
    </section>
  );
}
