"use client";

import type { FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  ChevronDown,
  Heart,
  Menu,
  PackageSearch,
  Search,
  ShieldCheck,
  ShoppingCart,
  Stethoscope,
  Truck,
  User,
  X,
} from "lucide-react";
import { formatPrice, searchProducts } from "@/data/catalog";
import { getProductAsset } from "@/data/product-assets";
import { CartDrawer } from "./CartDrawer";
import { Logo } from "./Logo";
import { useShop } from "./ShopProvider";
import { ShopToast } from "./ShopToast";

const navItems = [
  { label: "Inicio", href: "/" },
  { label: "Productos", href: "/productos", dropdown: true },
  { label: "Kits", href: "/kits" },
  { label: "Marcas", href: "/marcas" },
  { label: "Categorías", href: "/categorias", dropdown: true },
  { label: "Seguir pedido", href: "/seguimiento" },
  { label: "Profesionales de la salud", href: "/profesionales" },
  { label: "Nosotros", href: "/nosotros" },
  { label: "Contacto", href: "/contacto" },
];

const mobileExtraItems = [
  { label: "Favoritos", href: "/favoritos" },
  { label: "Carrito", href: "#cart" },
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const { cartCount, favoriteIds, openCart } = useShop();
  const pathname = usePathname();
  const router = useRouter();

  const searchResults = useMemo(() => {
    if (query.trim().length < 2) {
      return [];
    }

    return searchProducts(query).slice(0, 5);
  }, [query]);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanQuery = query.trim();

    if (cleanQuery) {
      router.push(`/productos?q=${encodeURIComponent(cleanQuery)}`);
      setSearchFocused(false);
      setMenuOpen(false);
    }
  }

  function isActive(href: string) {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname.startsWith(href);
  }

  return (
    <>
      <div className="utility-bar">
        <div className="section-shell utility-inner">
          <span className="utility-item">
            <Truck size={16} aria-hidden="true" />
            Envíos a todo México
          </span>
          <span className="utility-item">
            <ShieldCheck size={16} aria-hidden="true" />
            Productos seleccionados
          </span>
          <span className="utility-item">
            <Stethoscope size={16} aria-hidden="true" />
            Atención personalizada
          </span>
        </div>
      </div>

      <header className="site-header">
        <div className="section-shell header-main">
          <Logo />
          <form className="search-form" role="search" onSubmit={handleSearch}>
            <label className="sr-only" htmlFor="site-search">
              Buscar productos
            </label>
            <input
              id="site-search"
              type="search"
              placeholder="Buscar productos..."
              value={query}
              onBlur={() => window.setTimeout(() => setSearchFocused(false), 120)}
              onChange={(event) => {
                setQuery(event.target.value);
                setSearchFocused(true);
              }}
              onFocus={() => setSearchFocused(true)}
            />
            <button className="search-button" type="submit" aria-label="Buscar">
              <Search size={18} aria-hidden="true" />
            </button>
            {searchFocused && query.trim().length >= 2 ? (
              <div className="search-popover">
                {searchResults.length > 0 ? (
                  searchResults.map((product) => {
                    const image = getProductAsset(product.id)?.localPath ?? product.images[0];

                    return (
                      <Link
                        className="search-result"
                        href={`/productos/${product.slug}`}
                        key={product.id}
                        onClick={() => setSearchFocused(false)}
                      >
                        <span className="search-result-image">
                          {image ? <Image src={image} alt="" fill sizes="44px" /> : <PackageSearch size={18} aria-hidden="true" />}
                        </span>
                        <span>
                          <strong>{product.shortName}</strong>
                          <small>
                            {product.brand} · {product.sku} · {formatPrice(product.retailPrice)}
                          </small>
                        </span>
                      </Link>
                    );
                  })
                ) : (
                  <p className="search-no-results">No encontramos coincidencias rápidas.</p>
                )}
                <button className="search-all" type="submit">
                  Ver todos los resultados para “{query.trim()}”
                </button>
              </div>
            ) : null}
          </form>

          <div className="header-actions">
            <button className="header-action login-action" type="button">
              <User size={20} aria-hidden="true" />
              <span>Iniciar sesión</span>
            </button>
            <Link className="header-action favorite-header-action" href="/favoritos">
              <Heart size={20} aria-hidden="true" />
              <span>Favoritos</span>
              {favoriteIds.length > 0 ? <span className="mini-count">{favoriteIds.length}</span> : null}
            </Link>
            <button
              className="header-action cart-button"
              type="button"
              aria-label={`Carrito con ${cartCount} productos`}
              onClick={openCart}
            >
              <ShoppingCart size={20} aria-hidden="true" />
              <span className="cart-badge">{cartCount}</span>
              <span>Carrito</span>
            </button>
            <button
              className="mobile-menu-button"
              type="button"
              aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((current) => !current)}
            >
              {menuOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
            </button>
          </div>
        </div>

        <div className={`nav-wrap ${menuOpen ? "open" : ""}`}>
          <nav className="section-shell primary-nav" aria-label="Navegación principal">
            {navItems.map((item) => (
              <Link
                key={item.href}
                className={isActive(item.href) ? "active" : undefined}
                href={item.href}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
                {item.dropdown ? <ChevronDown size={15} aria-hidden="true" /> : null}
              </Link>
            ))}
            {mobileExtraItems.map((item) =>
              item.href === "#cart" ? (
                <button
                  className="mobile-nav-button"
                  type="button"
                  key={item.href}
                  onClick={() => {
                    openCart();
                    setMenuOpen(false);
                  }}
                >
                  {item.label}
                </button>
              ) : (
                <Link className="mobile-only-link" href={item.href} key={item.href} onClick={() => setMenuOpen(false)}>
                  {item.label}
                </Link>
              ),
            )}
          </nav>
        </div>
      </header>
      <CartDrawer />
      <ShopToast />
    </>
  );
}
