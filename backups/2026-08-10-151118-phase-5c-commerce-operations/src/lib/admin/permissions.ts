import type { AdminProfile } from "@/lib/repositories/adminRepository";
import type { AdminRole } from "@/types/database.types";

export type AdminNavItem = {
  href: string;
  label: string;
  icon: string;
  roles: AdminRole[];
};

export type AdminNavSection = {
  label: string;
  items: AdminNavItem[];
};

const allRoles: AdminRole[] = ["owner", "admin", "operations", "catalog", "readonly"];
const catalogRoles: AdminRole[] = ["owner", "admin", "catalog"];
const operationRoles: AdminRole[] = ["owner", "admin", "operations"];

export const adminNavigation: AdminNavSection[] = [
  {
    label: "Principal",
    items: [
      { href: "/admin", label: "Dashboard", icon: "LayoutDashboard", roles: allRoles },
      { href: "/admin/orders", label: "Pedidos", icon: "ShoppingBag", roles: operationRoles.concat("readonly") },
      { href: "/admin/customers", label: "Clientes", icon: "Users", roles: operationRoles.concat("readonly") },
    ],
  },
  {
    label: "Catalogo",
    items: [
      { href: "/admin/products", label: "Productos", icon: "Package", roles: catalogRoles.concat("readonly") },
      { href: "/admin/inventory", label: "Inventario", icon: "Boxes", roles: ["owner", "admin", "operations", "catalog", "readonly"] },
      { href: "/admin/kits", label: "Kits", icon: "PackagePlus", roles: catalogRoles.concat("readonly") },
      { href: "/admin/categories", label: "Categorias", icon: "Grid3X3", roles: catalogRoles.concat("readonly") },
      { href: "/admin/brands", label: "Marcas", icon: "Badge", roles: catalogRoles.concat("readonly") },
      { href: "/admin/assets", label: "Assets", icon: "Image", roles: catalogRoles.concat("readonly") },
    ],
  },
  {
    label: "Operacion",
    items: [{ href: "/admin/suppliers", label: "Proveedores", icon: "Truck", roles: catalogRoles.concat("readonly") }],
  },
  {
    label: "Sistema",
    items: [{ href: "/admin/settings", label: "Configuracion", icon: "Settings", roles: ["owner", "admin", "readonly"] }],
  },
];

export function canAccessAdminPath(profile: AdminProfile, pathname: string) {
  const item = adminNavigation.flatMap((section) => section.items).find((navItem) => {
    if (navItem.href === "/admin") {
      return pathname === "/admin";
    }

    return pathname === navItem.href || pathname.startsWith(`${navItem.href}/`);
  });

  return item ? item.roles.includes(profile.role) : true;
}

export function getVisibleAdminNavigation(role: AdminRole) {
  return adminNavigation
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => item.roles.includes(role)),
    }))
    .filter((section) => section.items.length > 0);
}

export function canWriteCatalog(role: AdminRole) {
  return role === "owner" || role === "admin" || role === "catalog";
}

export function canWriteOperations(role: AdminRole) {
  return role === "owner" || role === "admin" || role === "operations";
}

export function canWriteSettings(role: AdminRole) {
  return role === "owner" || role === "admin";
}
