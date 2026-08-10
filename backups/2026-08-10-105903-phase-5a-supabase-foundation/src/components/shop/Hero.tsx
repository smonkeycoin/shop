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
            Tienda en línea de cuidado respiratorio
          </span>
          <h1>Equipamiento y productos para terapia respiratoria</h1>
          <p>
            Productos seleccionados para hacer más simple el cuidado respiratorio cotidiano.
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
          <div className="hero-pedestal" aria-hidden="true" />
          <div className="hero-product hero-product-vortex">
            <Image
              src="/products/vortex/vortex-spacer-baby-mask-cutout-reference.png"
              alt="VORTEX Cámara Espaciadora"
              fill
              sizes="(max-width: 900px) 78vw, 34vw"
              priority
            />
          </div>
          <div className="hero-product hero-product-aero">
            <Image
              src="/products/aerochamber/aerochamber-flowvu-lineup-cutout-reference.png"
              alt="AeroChamber Plus Flow-Vu"
              fill
              sizes="(max-width: 900px) 58vw, 25vw"
            />
          </div>
          <div className="hero-product hero-product-neilmed">
            <Image
              src="/products/neilmed/neilmed-pediamist-front-cutout-reference.png"
              alt="NeilMed Pedia Mist"
              fill
              sizes="(max-width: 900px) 24vw, 10vw"
            />
          </div>
          <div className="hero-product hero-product-sterimar">
            <Image
              src="/products/sterimar/sterimar-breathe-easy-daily-front-reference.png"
              alt="Stérimar Higiene Nasal"
              fill
              sizes="(max-width: 900px) 24vw, 10vw"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
