import Link from "next/link";
import { AdminPageHeader, AdminStat, EmptyState, StatusBadge } from "@/components/admin/AdminUi";
import { formatMoney } from "@/lib/admin/format";
import { getAnalyticsData } from "@/lib/admin/backoffice";

export const dynamic = "force-dynamic";

type AnalyticsPageProps = {
  searchParams: Promise<{ includeTest?: string; range?: string }>;
};

export default async function AnalyticsPage({ searchParams }: AnalyticsPageProps) {
  const params = await searchParams;
  const includeTest = params.includeTest === "true";
  const rangeDays = Number(params.range ?? 30);
  const analytics = await getAnalyticsData({ includeTest, rangeDays });
  const maxDailyRevenue = Math.max(...analytics.daily.map((day) => day.revenue), 1);
  const modeHref = includeTest ? `/admin/analytics?range=${analytics.rangeDays}` : `/admin/analytics?range=${analytics.rangeDays}&includeTest=true`;

  return (
    <>
      <AdminPageHeader title="Analytics" eyebrow="Principal / Analytics">
        <Link className="admin-secondary-button" href={modeHref}>
          {includeTest ? "Ocultar test" : "Incluir test"}
        </Link>
        {[7, 30, 90].map((days) => (
          <Link
            className={days === analytics.rangeDays ? "admin-primary-button" : "admin-secondary-button"}
            href={`/admin/analytics?range=${days}${includeTest ? "&includeTest=true" : ""}`}
            key={days}
          >
            {days} dias
          </Link>
        ))}
      </AdminPageHeader>
      <p className="admin-page-subcopy">
        Conversion operativa y rentabilidad. {includeTest ? "Mostrando pedidos demo/test." : "Mostrando solo pedidos reales."}
      </p>

      <section className="admin-kpi-grid">
        <AdminStat label="Ingresos" value={formatMoney(analytics.kpis.revenue)} />
        <AdminStat label="Pedidos" value={analytics.kpis.orders} />
        <AdminStat label="Ticket promedio" value={formatMoney(analytics.kpis.averageTicket)} />
        <AdminStat label="Margen bruto" value={`${analytics.kpis.grossMargin.toFixed(1)}%`} />
      </section>

      <section className="admin-kpi-grid compact">
        <AdminStat label="Unidades" value={analytics.kpis.units} />
        <AdminStat label="Utilidad bruta" value={formatMoney(analytics.kpis.grossProfit)} />
        <AdminStat label="Clientes nuevos" value={analytics.kpis.newCustomers} />
        <AdminStat label="Recompra" value={`${analytics.kpis.repeatRate.toFixed(1)}%`} />
      </section>

      <section className="admin-dashboard-grid">
        <article className="admin-panel wide">
          <div className="admin-panel-header">
            <h2>Ventas por dia</h2>
            <StatusBadge>{analytics.rangeDays} dias</StatusBadge>
          </div>
          {analytics.kpis.orders ? (
            <div className="admin-bar-chart">
              {analytics.daily.map((day) => (
                <div className="admin-bar-row" key={day.date}>
                  <span>{day.date.slice(5)}</span>
                  <div>
                    <i style={{ width: `${Math.max(3, (day.revenue / maxDailyRevenue) * 100)}%` }} />
                  </div>
                  <strong>{formatMoney(day.revenue)}</strong>
                  <em>{day.orders}</em>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="Sin ventas en este rango." text="Cambia el rango o incluye test para revisar pedidos demo." />
          )}
        </article>

        <article className="admin-panel">
          <div className="admin-panel-header">
            <h2>Top productos</h2>
            <span>Ingresos</span>
          </div>
          <div className="admin-list-stack">
            {analytics.topProducts.length ? (
              analytics.topProducts.map((product) => (
                <div className="admin-list-row" key={`${product.sku}-${product.name}`}>
                  <div>
                    <strong>{product.name}</strong>
                    <span>{product.sku} · {product.quantity} uds.</span>
                  </div>
                  <span>{formatMoney(product.revenue)}</span>
                </div>
              ))
            ) : (
              <EmptyState title="Sin productos vendidos." text="Los rankings aparecen despues del primer pedido." />
            )}
          </div>
        </article>

        <article className="admin-panel">
          <div className="admin-panel-header">
            <h2>Categorias</h2>
            <span>Mix comercial</span>
          </div>
          <div className="admin-list-stack">
            {analytics.topCategories.length ? (
              analytics.topCategories.map((category) => (
                <div className="admin-list-row" key={category.name}>
                  <div>
                    <strong>{category.name}</strong>
                    <span>{category.quantity} unidades</span>
                  </div>
                  <span>{formatMoney(category.revenue)}</span>
                </div>
              ))
            ) : (
              <EmptyState title="Sin categorias aun." text="Se calcularan con productos vendidos." />
            )}
          </div>
        </article>
      </section>
    </>
  );
}
