"use client";

import type { FormEvent } from "react";
import Link from "next/link";
import { useState } from "react";
import {
  ChevronDown,
  Menu,
  Search,
  ShieldCheck,
  ShoppingCart,
  Stethoscope,
  Truck,
  User,
  X,
} from "lucide-react";
import { Logo } from "./Logo";

type HeaderProps = {
  cartCount: number;
  query: string;
  onQueryChange: (query: string) => void;
  onSearch: (event: FormEvent<HTMLFormElement>) => void;
};

const navItems = [
  { label: "Inicio", href: "/", active: true },
  { label: "Productos", href: "/productos", dropdown: true },
  { label: "Marcas", href: "/marcas" },
  { label: "Categorías", href: "/categorias", dropdown: true },
  { label: "Profesionales de la salud", href: "/profesionales" },
  { label: "Nosotros", href: "/nosotros" },
  { label: "Contacto", href: "/contacto" },
];

export function Header({ cartCount, query, onQueryChange, onSearch }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

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
            Distribuidores autorizados
          </span>
          <span className="utility-item">
            <Stethoscope size={16} aria-hidden="true" />
            Atención a profesionales de la salud
          </span>
        </div>
      </div>

      <header className="site-header">
        <div className="section-shell header-main">
          <Logo />
          <form className="search-form" role="search" onSubmit={onSearch}>
            <label className="sr-only" htmlFor="site-search">
              Buscar productos
            </label>
            <input
              id="site-search"
              type="search"
              placeholder="Buscar productos..."
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
            />
            <button className="search-button" type="submit" aria-label="Buscar">
              <Search size={18} aria-hidden="true" />
            </button>
          </form>

          <div className="header-actions">
            <button className="header-action login-action" type="button">
              <User size={20} aria-hidden="true" />
              <span>Iniciar sesión</span>
            </button>
            <button className="header-action cart-button" type="button" aria-label={`Carrito con ${cartCount} productos`}>
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
              <Link key={item.href} className={item.active ? "active" : undefined} href={item.href}>
                {item.label}
                {item.dropdown ? <ChevronDown size={15} aria-hidden="true" /> : null}
              </Link>
            ))}
          </nav>
        </div>
      </header>
    </>
  );
}
