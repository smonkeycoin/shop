"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Badge,
  BarChart3,
  Boxes,
  ChevronDown,
  ChevronRight,
  Command,
  Grid3X3,
  Home,
  Image,
  LayoutDashboard,
  LogOut,
  MoreHorizontal,
  Package,
  PackagePlus,
  Search,
  Settings,
  ShoppingBag,
  Truck,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { Logo } from "@/components/shop/Logo";
import { getInitials } from "@/lib/admin/format";
import { getVisibleAdminNavigation } from "@/lib/admin/permissions";
import type { AdminProfile } from "@/lib/repositories/adminRepository";
import type { AdminShellData, AdminShellSearchItem } from "@/lib/admin/backoffice";

const icons = {
  Badge,
  BarChart3,
  Boxes,
  ChevronDown,
  Grid3X3,
  Home,
  Image,
  LayoutDashboard,
  Package,
  PackagePlus,
  Settings,
  ShoppingBag,
  Truck,
  UserRound,
  Users,
};

type AdminShellProps = {
  profile: AdminProfile;
  shellData: AdminShellData;
  children: React.ReactNode;
};

const mobilePrimaryItems = [
  { href: "/admin", label: "Inicio", icon: Home },
  { href: "/admin/orders", label: "Pedidos", icon: ShoppingBag },
  { href: "/admin/products", label: "Productos", icon: Package },
  { href: "/admin/inventory", label: "Inventario", icon: Boxes },
];

export function AdminShell({ profile, shellData, children }: AdminShellProps) {
  const pathname = usePathname();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigation = getVisibleAdminNavigation(profile.role);
  const moreItems = navigation.flatMap((section) => section.items).filter((item) => !mobilePrimaryItems.some((primary) => primary.href === item.href));
  const searchResults = useMemo(() => getSearchResults(shellData.searchItems, query), [query, shellData.searchItems]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchInputRef.current?.focus();
      }

      if (event.key === "Escape") {
        setMoreOpen(false);
        setUserOpen(false);
        setQuery("");
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar" aria-label="Navegacion Back Office">
        <div className="admin-sidebar-header">
          <Logo />
        </div>
        <nav aria-label="Back Office">
          {navigation.map((section) => (
            <div className="admin-nav-section" key={section.label}>
              <p>{section.label}</p>
              {section.items.map((item) => {
                const Icon = icons[item.icon as keyof typeof icons];
                const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);

                return (
                  <Link className={active ? "active" : ""} href={item.href} key={item.href} aria-current={active ? "page" : undefined}>
                    <Icon size={17} aria-hidden="true" />
                    <span>{item.label}</span>
                    {getNavCounter(item.href, shellData) ? <em>{getNavCounter(item.href, shellData)}</em> : null}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
        <div className="admin-user-footer" data-open={userOpen}>
          <button className="admin-user-trigger" type="button" onClick={() => setUserOpen((current) => !current)} aria-expanded={userOpen}>
            <span className="admin-avatar">{getInitials(profile.fullName, profile.email)}</span>
            <span className="admin-user-copy">
              <strong>{profile.fullName || "Trino pc"}</strong>
              <small>{profile.role}</small>
            </span>
            <ChevronDown size={16} aria-hidden="true" />
          </button>
          {userOpen ? (
            <div className="admin-user-menu">
              <span>{profile.email}</span>
              <Link href="/admin/settings">
                <UserRound size={15} aria-hidden="true" />
                Mi sesion
              </Link>
              <form action="/auth/signout" method="post">
                <button type="submit">
                  <LogOut size={15} aria-hidden="true" />
                  Cerrar sesion
                </button>
              </form>
            </div>
          ) : null}
        </div>
      </aside>
      <section className="admin-main">
        <div className="admin-mobile-topbar">
          <Logo />
          <button className="admin-mobile-avatar" type="button" onClick={() => setMoreOpen(true)} aria-label="Abrir mas opciones">
            {getInitials(profile.fullName, profile.email)}
          </button>
        </div>
        <div className="admin-command-bar">
          <div className="admin-command-search">
            <Search size={17} aria-hidden="true" />
            <input
              ref={searchInputRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar pedidos, clientes o productos..."
              aria-label="Buscar pedidos, clientes o productos"
            />
            <kbd>
              <Command size={12} aria-hidden="true" /> K
            </kbd>
            {query.trim() ? <SearchDropdown results={searchResults} onSelect={() => setQuery("")} /> : null}
          </div>
        </div>
        {children}
      </section>
      <nav className="admin-bottom-nav" aria-label="Navegacion principal movil">
        {mobilePrimaryItems.map((item) => {
          const Icon = item.icon;
          const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
          return (
            <Link href={item.href} key={item.href} aria-current={active ? "page" : undefined} className={active ? "active" : ""}>
              <Icon size={18} aria-hidden="true" />
              <span>{item.label}</span>
              {getNavCounter(item.href, shellData) ? <em>{getNavCounter(item.href, shellData)}</em> : null}
            </Link>
          );
        })}
        <button type="button" className={moreOpen ? "active" : ""} onClick={() => setMoreOpen(true)} aria-expanded={moreOpen}>
          <MoreHorizontal size={18} aria-hidden="true" />
          <span>Mas</span>
        </button>
      </nav>
      {moreOpen ? (
        <div className="admin-mobile-sheet" role="dialog" aria-modal="true" aria-label="Mas opciones">
          <button className="admin-sheet-backdrop" type="button" aria-label="Cerrar mas opciones" onClick={() => setMoreOpen(false)} />
          <div className="admin-sheet-panel">
            <div className="admin-sheet-header">
              <strong>Mas</strong>
              <button type="button" onClick={() => setMoreOpen(false)} aria-label="Cerrar">
                <X size={18} />
              </button>
            </div>
            <div className="admin-sheet-links">
              {moreItems.map((item) => {
                const Icon = icons[item.icon as keyof typeof icons];
                return (
                  <Link href={item.href} key={item.href} onClick={() => setMoreOpen(false)}>
                    <Icon size={17} aria-hidden="true" />
                    <span>{item.label}</span>
                    <ChevronRight size={16} aria-hidden="true" />
                  </Link>
                );
              })}
              <form action="/auth/signout" method="post">
                <button type="submit">
                  <LogOut size={17} aria-hidden="true" />
                  Cerrar sesion
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

function getNavCounter(href: string, shellData: AdminShellData) {
  if (href === "/admin/orders") {
    return shellData.counters.actionableOrders;
  }

  if (href === "/admin/inventory") {
    return shellData.counters.inventoryAttention;
  }

  return 0;
}

function getSearchResults(items: AdminShellSearchItem[], query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return { order: [], customer: [], product: [] };
  }

  return items
    .filter((item) => item.keywords.toLowerCase().includes(normalized))
    .slice(0, 9)
    .reduce<Record<AdminShellSearchItem["type"], AdminShellSearchItem[]>>(
      (groups, item) => {
        groups[item.type].push(item);
        return groups;
      },
      { order: [], customer: [], product: [] },
    );
}

function SearchDropdown({
  results,
  onSelect,
}: {
  results: Record<AdminShellSearchItem["type"], AdminShellSearchItem[]>;
  onSelect: () => void;
}) {
  const groups = [
    { type: "order" as const, label: "Pedidos" },
    { type: "customer" as const, label: "Clientes" },
    { type: "product" as const, label: "Productos" },
  ];
  const total = groups.reduce((sum, group) => sum + results[group.type].length, 0);

  return (
    <div className="admin-search-popover">
      {total ? (
        groups.map((group) =>
          results[group.type].length ? (
            <section key={group.type}>
              <p>{group.label}</p>
              {results[group.type].map((item) => (
                <Link href={item.href} key={`${item.type}-${item.href}`} onClick={onSelect}>
                  <strong>{item.label}</strong>
                  <span>{item.meta}</span>
                </Link>
              ))}
            </section>
          ) : null,
        )
      ) : (
        <span className="admin-search-empty">Sin resultados.</span>
      )}
    </div>
  );
}
