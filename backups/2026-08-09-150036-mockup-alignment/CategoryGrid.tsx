import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { categories } from "@/data/categories";

export function CategoryGrid() {
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
        {categories.map((category) => {
          const Icon = category.icon;

          return (
            <Link className="category-card" href={`/categorias/${category.slug}`} key={category.id}>
              <span className="category-visual" aria-hidden="true">
                <Icon size={29} strokeWidth={1.7} />
              </span>
              <h3>{category.name}</h3>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
