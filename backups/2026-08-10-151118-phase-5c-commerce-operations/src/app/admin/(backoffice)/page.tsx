import Link from "next/link";
import { AdminPageHeader, AdminStat, EmptyState, StatusBadge } from "@/components/admin/AdminUi";
import { formatDate, formatMoney } from "@/lib/admin/format";
import { getDashboardData } from "@/lib/admin/backoffice";
import { getCurrentAdminProfile } from "@/lib/repositories/adminRepository";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [{ profile }, dashboard] = await Promise.all([getCurrentAdminProfile(), getDashboardData()]);
  const firstName = profile?.fullName?.split(" ")[0] || "Trino";

  return (
    <>
      <AdminPageHeader title={`Buenos dias, ${firstName}`} eyebrow="Dashboard">
        <Link className="admin-primary-button" href="/admin/products/new">
          + Nuevo producto
        </Link>
      </AdminPageHeader>
      <p className="admin-page-subcopy">Aqui esta el estado de Shop NeumoPractice.</p>

      <section className="admin-kpi-grid">
        <AdminStat label="Ventas hoy" value={formatMoney(dashboard.kpis.salesToday)} />
        <AdminStat label="Pedidos hoy" value={dashboard.kpis.ordersToday} />
        <AdminStat label="Ticket promedio" value={formatMoney(dashboard.kpis.averageTicket)} />
        <AdminStat label="Por preparar" value={dashboard.kpis.preparing} tone={dashboard.kpis.preparing ? "warning" : undefined} />
      </section>

      <section className="admin-kpi-grid compact">
        <AdminStat label="Productos publicados" value={dashboard.kpis.publishedProducts} />
        <AdminStat label="Stock bajo" value={dashboard.kpis.lowStock} tone={dashboard.kpis.lowStock ? "warning" : undefined} />
        <AdminStat label="Agotados" value={dashboard.kpis.outOfStock} tone={dashboard.kpis.outOfStock ? "warning" : undefined} />
        <AdminStat label="Clientes" value={dashboard.kpis.customers} />
      </section>

      <section className="admin-dashboard-grid">
        <article className="admin-panel wide">
          <div className="admin-panel-header">
            <h2>Ventas</h2>
            <span>Hoy</span>
          </div>
          {dashboard.hasPaidSales ? (
            <div className="admin-zero-chart">
              <strong>{formatMoney(dashboard.kpis.salesToday)}</strong>
              <span>Ventas pagadas registradas hoy.</span>
            </div>
          ) : (
            <EmptyState title="Aun no hay ventas reales registradas." text="Stripe se integrara en una fase posterior; no se inventan graficas." />
          )}
        </article>

        <article className="admin-panel">
          <div className="admin-panel-header">
            <h2>Stock bajo</h2>
            <Link href="/admin/inventory">Ver inventario</Link>
          </div>
          <div className="admin-list-stack">
            {dashboard.lowStock.length ? (
              dashboard.lowStock.map((item) => (
                <div className="admin-list-row" key={item.id}>
                  <div>
                    <strong>{item.productName}</strong>
                    <span>{item.sku}</span>
                  </div>
                  <StatusBadge tone={item.quantity_on_hand <= 0 ? "danger" : "warning"}>{item.quantity_on_hand} disp.</StatusBadge>
                </div>
              ))
            ) : (
              <EmptyState title="Sin alertas" text="No hay productos en stock bajo." />
            )}
          </div>
        </article>

        <article className="admin-panel">
          <div className="admin-panel-header">
            <h2>Pedidos recientes</h2>
            <Link href="/admin/orders">Ver pedidos</Link>
          </div>
          <div className="admin-list-stack">
            {dashboard.latestOrders.length ? (
              dashboard.latestOrders.map((order) => (
                <Link className="admin-list-row" href={`/admin/orders/${order.id}`} key={order.id}>
                  <div>
                    <strong>{order.order_number}</strong>
                    <span>{order.customerName}</span>
                  </div>
                  <span>{formatMoney(order.total)}</span>
                </Link>
              ))
            ) : (
              <EmptyState title="Aun no hay pedidos." text="Los pedidos apareceran aqui en cuanto existan." href="/admin/orders" action="Ver pedidos" />
            )}
          </div>
        </article>

        <article className="admin-panel">
          <div className="admin-panel-header">
            <h2>Actividad reciente</h2>
            <span>Audit log</span>
          </div>
          <div className="admin-list-stack">
            {dashboard.audit.length ? (
              dashboard.audit.map((event) => (
                <div className="admin-list-row" key={event.id}>
                  <div>
                    <strong>{event.action}</strong>
                    <span>{formatDate(event.created_at)}</span>
                  </div>
                  <StatusBadge>{event.entity_type}</StatusBadge>
                </div>
              ))
            ) : (
              <EmptyState title="Sin actividad" text="Las acciones administrativas quedaran registradas aqui." />
            )}
          </div>
        </article>
      </section>
    </>
  );
}
