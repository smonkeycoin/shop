"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Filter, Search } from "lucide-react";
import { brands, categories, products, searchProducts, subcategories } from "@/data/catalog";
import type { StockStatus } from "@/types/commerce";
import { getStockStatus } from "@/lib/commerce";
import { Breadcrumbs } from "./Breadcrumbs";
import { ProductCard } from "./ProductCard";

type SortOption = "recommended" | "newest" | "price-asc" | "price-desc" | "az";

const useFilters = ["Pediátrico", "Adulto", "Uso domiciliario", "Accesorios"];
const priceRanges = [
  { id: "under-500", label: "Hasta $500", test: (price: number) => price <= 500 },
  { id: "500-1000", label: "$500-$1,000", test: (price: number) => price > 500 && price <= 1000 },
  { id: "1000-2000", label: "$1,000-$2,000", test: (price: number) => price > 1000 && price <= 2000 },
  { id: "over-2000", label: "Más de $2,000", test: (price: number) => price > 2000 },
];
const availabilityFilters: { id: StockStatus; label: string }[] = [
  { id: "in_stock", label: "Disponible" },
  { id: "low_stock", label: "Pocas piezas" },
  { id: "preorder", label: "Sobre pedido" },
  { id: "out_of_stock", label: "Agotado" },
];

type ProductListingProps = {
  initialCategory?: string;
  initialBrand?: string;
  title?: string;
  description?: string;
  eyebrow?: string;
  breadcrumbs?: { label: string; href?: string }[];
  lockedFilters?: boolean;
};

export function ProductListing({
  initialCategory,
  initialBrand,
  title = "Productos para respirar mejor",
  description = "Encuentra aerocámaras, nebulización, higiene nasal, monitoreo y accesorios respiratorios seleccionados para el cuidado cotidiano.",
  eyebrow = "CATÁLOGO",
  breadcrumbs = [{ label: "Productos" }],
  lockedFilters = false,
}: ProductListingProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [categorySlug, setCategorySlug] = useState(
    initialCategory ?? searchParams.get("categoria") ?? "todos",
  );
  const [brandSlug, setBrandSlug] = useState(initialBrand ?? searchParams.get("marca") ?? "todos");
  const [subcategorySlug, setSubcategorySlug] = useState(searchParams.get("subcategoria") ?? "todos");
  const [availability, setAvailability] = useState("todos");
  const [useTag, setUseTag] = useState("todos");
  const [priceRange, setPriceRange] = useState("todos");
  const [sort, setSort] = useState<SortOption>("recommended");
  const query = searchParams.get("q") ?? "";

  function syncUrl(nextCategory = categorySlug, nextBrand = brandSlug) {
    const params = new URLSearchParams(searchParams.toString());

    if (nextCategory !== "todos") {
      params.set("categoria", nextCategory);
    } else {
      params.delete("categoria");
    }

    if (nextBrand !== "todos") {
      params.set("marca", nextBrand);
    } else {
      params.delete("marca");
    }

    router.replace(`/productos${params.toString() ? `?${params.toString()}` : ""}`, { scroll: false });
  }

  const filteredProducts = useMemo(() => {
    const baseProducts = query ? searchProducts(query) : products;

    const nextProducts = baseProducts.filter((product) => {
      const categoryMatches = categorySlug === "todos" || product.categorySlug === categorySlug;
      const brandMatches = brandSlug === "todos" || product.brandSlug === brandSlug;
      const subcategoryMatches = subcategorySlug === "todos" || product.subcategorySlug === subcategorySlug;
      const availabilityMatches =
        availability === "todos" || getStockStatus(product) === availability;
      const useMatches =
        useTag === "todos" ||
        product.tags?.includes(useTag) ||
        product.ageGroup?.includes(useTag) ||
        (useTag === "Uso domiciliario" && product.tags?.includes("uso domiciliario")) ||
        (useTag === "Accesorios" && product.categorySlug === "accesorios");
      const priceMatches =
        priceRange === "todos" ||
        priceRanges.find((range) => range.id === priceRange)?.test(product.retailPrice) ||
        false;

      return categoryMatches && brandMatches && subcategoryMatches && availabilityMatches && useMatches && priceMatches;
    });

    return [...nextProducts].sort((a, b) => {
      if (sort === "newest") return Number(Boolean(b.isNew)) - Number(Boolean(a.isNew));
      if (sort === "price-asc") return a.retailPrice - b.retailPrice;
      if (sort === "price-desc") return b.retailPrice - a.retailPrice;
      if (sort === "az") return a.name.localeCompare(b.name, "es");
      return Number(b.featured) - Number(a.featured) || Number(b.isBestSeller) - Number(a.isBestSeller);
    });
  }, [availability, brandSlug, categorySlug, priceRange, query, sort, subcategorySlug, useTag]);

  function clearFilters() {
    setCategorySlug(initialCategory ?? "todos");
    setBrandSlug(initialBrand ?? "todos");
    setSubcategorySlug("todos");
    setAvailability("todos");
    setUseTag("todos");
    setPriceRange("todos");
    setSort("recommended");
    router.replace(initialCategory ? `/categorias/${initialCategory}` : initialBrand ? `/marcas/${initialBrand}` : "/productos", {
      scroll: false,
    });
  }

  const filters = (
    <FilterControls
      brandSlug={brandSlug}
      categorySlug={categorySlug}
      availability={availability}
      lockedFilters={lockedFilters}
      priceRange={priceRange}
      setBrandSlug={(value) => {
        setBrandSlug(value);
        syncUrl(categorySlug, value);
      }}
      setCategorySlug={(value) => {
        setCategorySlug(value);
        setSubcategorySlug("todos");
        syncUrl(value, brandSlug);
      }}
      setAvailability={setAvailability}
      setPriceRange={setPriceRange}
      setSubcategorySlug={setSubcategorySlug}
      setUseTag={setUseTag}
      subcategorySlug={subcategorySlug}
      useTag={useTag}
      onClear={clearFilters}
    />
  );

  return (
    <section className="catalog-page section-shell">
      <Breadcrumbs items={breadcrumbs} />
      <header className="catalog-hero">
        <div>
          <span className="catalog-eyebrow">{eyebrow}</span>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        <div className="catalog-count">
          <strong>{filteredProducts.length}</strong>
          <span>de {products.length} productos</span>
        </div>
      </header>

      <div className="catalog-toolbar">
        <button className="filter-trigger" type="button" onClick={() => setMobileFiltersOpen(true)}>
          <Filter size={17} aria-hidden="true" />
          Filtros
        </button>
        <div className="catalog-chips" aria-label="Categorías rápidas">
          <FilterChip active={categorySlug === "todos"} onClick={() => {
            setCategorySlug("todos");
            syncUrl("todos", brandSlug);
          }}>
            Todos
          </FilterChip>
          {categories.slice(0, 5).map((category) => (
            <FilterChip
              active={categorySlug === category.slug}
              key={category.slug}
              onClick={() => {
                setCategorySlug(category.slug);
                syncUrl(category.slug, brandSlug);
              }}
            >
              {category.shortName}
            </FilterChip>
          ))}
        </div>
        <label className="sort-select">
          <span>Ordenar por</span>
          <select value={sort} onChange={(event) => setSort(event.target.value as SortOption)}>
            <option value="recommended">Recomendados</option>
            <option value="newest">Más nuevos</option>
            <option value="price-asc">Precio: menor a mayor</option>
            <option value="price-desc">Precio: mayor a menor</option>
            <option value="az">A-Z</option>
          </select>
        </label>
      </div>

      <div className="catalog-layout">
        <aside className="filter-sidebar">{filters}</aside>
        <div className="catalog-results">
          {query ? (
            <p className="query-note">
              Resultados para <strong>“{query}”</strong>
            </p>
          ) : null}
          {filteredProducts.length > 0 ? (
            <div className="catalog-products-grid">
              {filteredProducts.map((product) => (
                <ProductCard product={product} key={product.id} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <Search size={36} aria-hidden="true" />
              <h2>No encontramos productos con estos filtros.</h2>
              <button className="button-primary" type="button" onClick={clearFilters}>
                Limpiar filtros
              </button>
            </div>
          )}
        </div>
      </div>

      <div className={`mobile-filter-layer ${mobileFiltersOpen ? "open" : ""}`}>
        <button className="cart-backdrop" type="button" aria-label="Cerrar filtros" onClick={() => setMobileFiltersOpen(false)} />
        <aside className="mobile-filter-drawer" role="dialog" aria-modal="true" aria-label="Filtros">
          <div className="mobile-filter-header">
            <h2>Filtros</h2>
            <button type="button" className="button-secondary" onClick={() => setMobileFiltersOpen(false)}>
              Aplicar
            </button>
          </div>
          {filters}
        </aside>
      </div>
    </section>
  );
}

function FilterControls({
  brandSlug,
  categorySlug,
  availability,
  lockedFilters,
  onClear,
  priceRange,
  setBrandSlug,
  setCategorySlug,
  setAvailability,
  setPriceRange,
  setSubcategorySlug,
  setUseTag,
  subcategorySlug,
  useTag,
}: {
  brandSlug: string;
  categorySlug: string;
  availability: string;
  lockedFilters: boolean;
  onClear: () => void;
  priceRange: string;
  setBrandSlug: (value: string) => void;
  setCategorySlug: (value: string) => void;
  setAvailability: (value: string) => void;
  setPriceRange: (value: string) => void;
  setSubcategorySlug: (value: string) => void;
  setUseTag: (value: string) => void;
  subcategorySlug: string;
  useTag: string;
}) {
  const visibleSubcategories =
    categorySlug === "todos"
      ? subcategories
      : subcategories.filter((subcategory) => subcategory.categorySlug === categorySlug);

  return (
    <div className="filters-card">
      <div className="filters-card-header">
        <h2>Filtros</h2>
        <button type="button" onClick={onClear}>
          Limpiar filtros
        </button>
      </div>
      <FilterGroup title="Categoría">
        {categories.map((category) => (
          <RadioFilter
            checked={categorySlug === category.slug}
            disabled={lockedFilters && categorySlug === category.slug}
            key={category.slug}
            label={category.shortName}
            name="category-filter"
            onChange={() => setCategorySlug(category.slug)}
          />
        ))}
      </FilterGroup>
      <FilterGroup title="Subcategoría">
        {visibleSubcategories.slice(0, 10).map((subcategory) => (
          <RadioFilter
            checked={subcategorySlug === subcategory.slug}
            key={subcategory.slug}
            label={subcategory.name}
            name="subcategory-filter"
            onChange={() => setSubcategorySlug(subcategory.slug)}
          />
        ))}
      </FilterGroup>
      <FilterGroup title="Marca">
        {brands.slice(0, 7).map((brand) => (
          <RadioFilter
            checked={brandSlug === brand.slug}
            disabled={lockedFilters && brandSlug === brand.slug}
            key={brand.slug}
            label={brand.name}
            name="brand-filter"
            onChange={() => setBrandSlug(brand.slug)}
          />
        ))}
      </FilterGroup>
      <FilterGroup title="Disponibilidad">
        {availabilityFilters.map((option) => (
          <RadioFilter
            checked={availability === option.id}
            key={option.id}
            label={option.label}
            name="availability-filter"
            onChange={() => setAvailability(option.id)}
          />
        ))}
      </FilterGroup>
      <FilterGroup title="Uso">
        {useFilters.map((tag) => (
          <RadioFilter
            checked={useTag === tag}
            key={tag}
            label={tag}
            name="use-filter"
            onChange={() => setUseTag(tag)}
          />
        ))}
      </FilterGroup>
      <FilterGroup title="Precio">
        {priceRanges.map((range) => (
          <RadioFilter
            checked={priceRange === range.id}
            key={range.id}
            label={range.label}
            name="price-filter"
            onChange={() => setPriceRange(range.id)}
          />
        ))}
      </FilterGroup>
    </div>
  );
}

function FilterGroup({ children, title }: { children: ReactNode; title: string }) {
  return (
    <fieldset className="filter-group">
      <legend>{title}</legend>
      {children}
    </fieldset>
  );
}

function RadioFilter({
  checked,
  disabled,
  label,
  name,
  onChange,
}: {
  checked: boolean;
  disabled?: boolean;
  label: string;
  name: string;
  onChange: () => void;
}) {
  return (
    <label className="filter-option">
      <input checked={checked} disabled={disabled} name={name} type="radio" onChange={onChange} />
      <span>{label}</span>
    </label>
  );
}

function FilterChip({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button className={active ? "active" : undefined} type="button" onClick={onClick}>
      {children}
    </button>
  );
}
