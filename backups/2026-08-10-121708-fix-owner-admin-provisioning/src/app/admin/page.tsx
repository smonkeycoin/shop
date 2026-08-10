import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LogOut } from "lucide-react";
import { Logo } from "@/components/shop/Logo";
import { getAdminFoundationStats, getCurrentAdminProfile } from "@/lib/repositories/adminRepository";

export const metadata: Metadata = {
  title: "Back Office Foundation | Shop NeumoPractice",
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const { profile, status } = await getCurrentAdminProfile();

  if (status === "unconfigured") {
    redirect("/admin/login?error=oauth_unavailable");
  }

  if (status === "unauthenticated") {
    redirect("/admin/login");
  }

  if (status === "unauthorized") {
    redirect("/admin/login?error=unauthorized");
  }

  if (status === "disabled") {
    redirect("/admin/login?error=disabled");
  }

  const stats = await getAdminFoundationStats();

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <Logo />
        <nav aria-label="Back Office">
          <span className="active">Foundation</span>
          <span>Pedidos</span>
          <span>Catálogo</span>
          <span>Inventario</span>
          <span>CRM</span>
        </nav>
      </aside>
      <section className="admin-main">
        <header className="admin-topbar">
          <div>
            <p className="admin-eyebrow">Shop Back Office</p>
            <h1>Back Office Foundation</h1>
          </div>
          <form action="/auth/signout" method="post">
            <button className="admin-ghost-button" type="submit">
              <LogOut size={16} aria-hidden="true" />
              Cerrar sesión
            </button>
          </form>
        </header>

        <section className="admin-profile-panel">
          <div>
            <span>Nombre</span>
            <strong>{profile?.fullName || "Administrador"}</strong>
          </div>
          <div>
            <span>Email</span>
            <strong>{profile?.email}</strong>
          </div>
          <div>
            <span>Role</span>
            <strong>{profile?.role}</strong>
          </div>
          <div>
            <span>Supabase</span>
            <strong>Connected</strong>
          </div>
        </section>

        <section className="admin-kpi-grid" aria-label="Estado foundation">
          <AdminKpi label="Catalog source" value={process.env.NEXT_PUBLIC_CATALOG_SOURCE === "supabase" ? "Supabase" : "Local"} />
          <AdminKpi label="Products" value={stats.products} />
          <AdminKpi label="Variants" value={stats.variants} />
          <AdminKpi label="Categories" value={stats.categories} />
          <AdminKpi label="Brands" value={stats.brands} />
        </section>
      </section>
    </main>
  );
}

function AdminKpi({ label, value }: { label: string; value: string | number }) {
  return (
    <article className="admin-kpi-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}
