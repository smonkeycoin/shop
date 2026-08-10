"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Badge,
  Boxes,
  Grid3X3,
  Image,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  PackagePlus,
  Settings,
  ShoppingBag,
  Truck,
  Users,
  X,
} from "lucide-react";
import { Logo } from "@/components/shop/Logo";
import { getInitials } from "@/lib/admin/format";
import { getVisibleAdminNavigation } from "@/lib/admin/permissions";
import type { AdminProfile } from "@/lib/repositories/adminRepository";

const icons = {
  Badge,
  Boxes,
  Grid3X3,
  Image,
  LayoutDashboard,
  Package,
  PackagePlus,
  Settings,
  ShoppingBag,
  Truck,
  Users,
};

type AdminShellProps = {
  profile: AdminProfile;
  children: React.ReactNode;
};

export function AdminShell({ profile, children }: AdminShellProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const navigation = getVisibleAdminNavigation(profile.role);

  return (
    <main className="admin-shell">
      <button className="admin-mobile-menu" type="button" onClick={() => setOpen(true)} aria-label="Abrir navegacion">
        <Menu size={18} />
      </button>
      <aside className={`admin-sidebar ${open ? "is-open" : ""}`}>
        <div className="admin-sidebar-header">
          <Logo />
          <button className="admin-sidebar-close" type="button" onClick={() => setOpen(false)} aria-label="Cerrar navegacion">
            <X size={18} />
          </button>
        </div>
        <nav aria-label="Back Office">
          {navigation.map((section) => (
            <div className="admin-nav-section" key={section.label}>
              <p>{section.label}</p>
              {section.items.map((item) => {
                const Icon = icons[item.icon as keyof typeof icons];
                const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);

                return (
                  <Link className={active ? "active" : ""} href={item.href} key={item.href} onClick={() => setOpen(false)}>
                    <Icon size={17} aria-hidden="true" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
        <div className="admin-user-footer">
          <div className="admin-avatar">{getInitials(profile.fullName, profile.email)}</div>
          <div className="admin-user-copy">
            <strong>{profile.fullName || "Administrador"}</strong>
            <span>{profile.email}</span>
            <em>{profile.role}</em>
          </div>
          <form action="/auth/signout" method="post">
            <button className="admin-ghost-button" type="submit">
              <LogOut size={15} aria-hidden="true" />
              Cerrar sesion
            </button>
          </form>
        </div>
      </aside>
      <section className="admin-main">{children}</section>
    </main>
  );
}
