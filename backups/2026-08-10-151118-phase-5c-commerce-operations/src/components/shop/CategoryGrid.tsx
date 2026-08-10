import Image from "next/image";
import Link from "next/link";
import { ArrowRight, PackageSearch } from "lucide-react";
import { allCategoryOption, categories } from "@/data/categories";

const categoryAssets: Record<string, { src?: string; alt: string; className?: string }[]> = {
  aerocamaras: [
    { src: "/products/pari/pari-vortex-child-mask-front.webp", alt: "PARI VORTEX", className: "wide" },
  ],
  nebulizacion: [{ alt: "Nebulización pendiente de imagen", className: "pending" }],
  "higiene-nasal": [
    { src: "/products/neilmed/neilmed-pediamist-front.webp", alt: "NeilMed" },
    { src: "/products/sterimar/sterimar-breathe-easy-daily-front.webp", alt: "Stérimar" },
  ],
  monitoreo: [{ alt: "Flujómetro pendiente de imagen", className: "pending" }],
  "terapia-respiratoria": [{ alt: "Terapia respiratoria pendiente de imagen", className: "pending" }],
  accesorios: [{ alt: "Accesorio pendiente de imagen", className: "pending" }],
};

export function CategoryGrid() {
  const displayedCategories = [...categories, allCategoryOption];

  return (
    <section className="section-shell categories-section">
      <div className="section-heading-row">
        <div>
          <h2>Categorías destacadas</h2>
        </div>
        <Link className="section-link" href="/categorias">
          Ver todas las categorías
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>

      <div className="category-grid">
        {displayedCategories.map((category) => {
          const Icon = category.icon;

          return (
            <Link
              className="category-card"
              href={category.id === "todas" ? "/categorias" : `/categorias/${category.slug}`}
              key={category.id}
            >
              <span className="category-visual" aria-hidden="true">
                {category.id === "todas" ? (
                  <Icon size={45} strokeWidth={1.65} />
                ) : (
                  <CategoryVisual slug={category.slug} />
                )}
              </span>
              <h3>{category.name}</h3>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export function CategoryVisual({ slug }: { slug: string }) {
  const assets = categoryAssets[slug] ?? [];

  return (
    <span className={`category-composition count-${assets.length}`}>
      {assets.map((asset, index) =>
        asset.src ? (
          <span className={`category-product ${asset.className ?? ""}`} key={asset.src}>
            <Image src={asset.src} alt={asset.alt} fill sizes="(max-width: 680px) 36vw, 115px" />
          </span>
        ) : (
          <span className={`category-pending ${asset.className ?? ""}`} key={`${slug}-${index}`}>
            <PackageSearch size={22} aria-hidden="true" />
          </span>
        ),
      )}
    </span>
  );
}
