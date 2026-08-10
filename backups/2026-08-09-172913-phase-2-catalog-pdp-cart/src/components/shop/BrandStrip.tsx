import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { brands } from "@/data/brands";

export function BrandStrip() {
  return (
    <section className="section-shell brands-section">
      <div className="section-heading-row">
        <div>
          <h2>Marcas que distribuimos</h2>
        </div>
        <Link className="section-link" href="/marcas">
          Ver todas las marcas
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>

      <div className="brand-panel" aria-label={`Marcas preliminares: ${brands.join(", ")}`}>
        <Image
          src="/mockup-assets/brand-strip.png"
          alt=""
          width={919}
          height={69}
          sizes="(max-width: 900px) 100vw, 1280px"
        />
      </div>
    </section>
  );
}
