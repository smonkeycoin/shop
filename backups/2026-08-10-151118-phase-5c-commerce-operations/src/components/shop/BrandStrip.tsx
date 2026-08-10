import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { publicBrands as localPublicBrands } from "@/data/brands";
import type { Brand } from "@/types/commerce";

export function BrandStrip({ brands = localPublicBrands }: { brands?: Brand[] }) {
  return (
    <section className="section-shell brands-section">
      <div className="section-heading-row">
        <div>
          <h2>Marcas seleccionadas</h2>
          <p>Productos de fabricantes especializados en cuidado respiratorio.</p>
        </div>
        <Link className="section-link" href="/marcas">
          Ver todas las marcas
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>

      <div className="brand-panel" aria-label={`Marcas seleccionadas: ${brands.map((brand) => brand.name).join(", ")}`}>
        {brands.map((brand) => (
          <Link className="brand-wordmark" href={`/marcas/${brand.slug}`} key={brand.id}>
            {brand.name}
          </Link>
        ))}
      </div>
    </section>
  );
}
