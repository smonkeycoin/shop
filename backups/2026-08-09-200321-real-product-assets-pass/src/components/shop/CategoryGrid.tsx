import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { allCategoryOption, categories } from "@/data/categories";

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
                  <Image
                    src={category.image}
                    alt=""
                    fill
                    sizes="(max-width: 680px) 42vw, 120px"
                  />
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
