import Link from "next/link";
import { Activity, AlertTriangle, BarChart3, CheckCircle2, ChevronRight, PackageCheck, ShoppingBag } from "lucide-react";
import { EmptyState, StatusBadge } from "@/components/admin/AdminUi";
import { formatDate, formatMoney } from "@/lib/admin/format";
import { getDashboardData } from "@/lib/admin/backoffice";
import { getCurrentAdminProfile } from "@/lib/repositories/adminRepository";
import { getStoragePublicUrl } from "@/lib/supabase/storage";

export const dynamic = "force-dynamic";

type AdminDashboardPageProps = {
  searchParams: Promise<{ includeTest?: string; range?: string }>;
};

type SalesPoint = {
  date: string;
  revenue: number;
  orders: number;
};

export default async function AdminDashboardPage({ searchParams }: AdminDashboardPageProps) {
  const { includeTest: includeTestParam, range: rangeParam } = await searchParams;
  const includeTest = includeTestParam === "true";
  const range = rangeParam === "7" ? 7 : 30;
  const [{ profile }, dashboard] = await Promise.all([getCurrentAdminProfile(), getDashboardData({ includeTest })]);
  const firstName = profile?.fullName?.split(" ")[0] || "Trino";
  const salesSeries = range === 7 ? dashboard.sales.sevenDays : dashboard.sales.thirtyDays;
  const maxRevenue = Math.max(...salesSeries.map((day) => day.revenue), 1);
  const catalog = dashboard.catalogHealth;
  const withImage = percent(catalog.withImage, catalog.published);
  const withCost = percent(catalog.withCost, catalog.published);
  const readyProducts = Math.max(catalog.published - catalog.lowStock, 0);
  const readyProductsPct = percent(readyProducts, catalog.published);

  return (
    <>
      <section className="admin-home-hero">
        <div>
          <p className="admin-breadcrumb">Home OS</p>
          <h1>{getGreeting()}, {firstName}</h1>
          <span>Estado operativo de Shop NeumoPractice para vender, surtir y mantener catalogo limpio.</span>
        </div>
        <div className="admin-home-actions" aria-label="Acciones rapidas">
          <Link className="admin-secondary-button" href={includeTest ? "/admin" : "/admin?includeTest=true"}>
            {includeTest ? "Ocultar test" : "Incluir test"}
          </Link>
          <Link className="admin-primary-button" href="/admin/products/new">
            Nuevo producto
          </Link>
        </div>
      </section>

      <section className="admin-kpi-strip" aria-label="Indicadores principales">
        <Metric label="Ventas hoy" value={formatMoney(dashboard.kpis.salesToday)} />
        <Metric label="Pedidos hoy" value={dashboard.kpis.ordersToday} />
        <Metric label="Ticket promedio" value={formatMoney(dashboard.kpis.averageTicket)} />
        <Metric label="Por preparar" value={dashboard.kpis.preparing} tone={dashboard.kpis.preparing ? "warning" : "calm"} />
        <Metric label="Clientes" value={dashboard.kpis.customers} />
      </section>

      <section className="admin-home-layout">
        <article className="admin-panel admin-attention-panel">
          <div className="admin-panel-header">
            <div>
              <h2>Centro de atencion</h2>
              <span>Lo que puede afectar operacion o venta.</span>
            </div>
            <AlertTriangle size={18} aria-hidden="true" />
          </div>
          <div className="admin-attention-list">
            {dashboard.attention.length ? (
              dashboard.attention.map((item) => (
                <Link className={`admin-attention-item tone-${item.tone}`} href={item.href} key={item.id}>
                  <span>{item.count}</span>
                  <strong>{item.label}</strong>
                  <ChevronRight size={16} aria-hidden="true" />
                </Link>
              ))
            ) : (
              <div className="admin-attention-clear">
                <CheckCircle2 size={22} aria-hidden="true" />
                <strong>Sin pendientes criticos</strong>
                <span>Pedidos, inventario y catalogo estan sin alertas inmediatas.</span>
              </div>
            )}
          </div>
        </article>

        <article className="admin-panel admin-sales-panel">
          <div className="admin-panel-header">
            <div>
              <h2>Ventas</h2>
              <span>{dashboard.includeTest ? "Incluye test/demo" : "Solo ventas reales"}</span>
            </div>
            <div className="admin-range-toggle" aria-label="Rango de ventas">
              <Link className={range === 7 ? "active" : ""} href={rangeHref(7, includeTest)}>7 dias</Link>
              <Link className={range === 30 ? "active" : ""} href={rangeHref(30, includeTest)}>30 dias</Link>
            </div>
          </div>
          {dashboard.sales.hasSales ? (
            <>
              <div className="admin-sales-summary">
                <strong>{formatMoney(salesSeries.reduce((sum, day) => sum + day.revenue, 0))}</strong>
                <span>{salesSeries.reduce((sum, day) => sum + day.orders, 0)} pedidos en {range} dias</span>
              </div>
              <MiniSalesBars maxRevenue={maxRevenue} series={salesSeries} />
            </>
          ) : (
            <EmptyState title="Sin ventas reales registradas." text="Stripe se integra en una fase posterior; Home OS no inventa datos." />
          )}
        </article>

        <article className="admin-panel admin-orders-panel">
          <div className="admin-panel-header">
            <div>
              <h2>Pedidos recientes</h2>
              <span>Ultimos movimientos del checkout.</span>
            </div>
            <Link href="/admin/orders">Ver todos</Link>
          </div>
          <div className="admin-list-stack">
            {dashboard.latestOrders.length ? (
              dashboard.latestOrders.slice(0, 6).map((order) => (
                <Link className="admin-home-order-row" href={`/admin/orders/${order.id}`} key={order.id}>
                  <div>
                    <strong>{order.order_number}</strong>
                    <span>{order.customerName}</span>
                  </div>
                  <div>
                    <strong>{formatMoney(order.total)}</strong>
                    <StatusBadge tone={order.payment_status === "paid" ? "success" : "warning"}>{order.status}</StatusBadge>
                  </div>
                </Link>
              ))
            ) : (
              <EmptyState title="Aun no hay pedidos." text="Los pedidos apareceran aqui en cuanto existan." href="/admin/orders" action="Ver pedidos" />
            )}
          </div>
        </article>

        <article className="admin-panel admin-inventory-panel">
          <div className="admin-panel-header">
            <div>
              <h2>Inventario</h2>
              <span>Stock bajo y agotados.</span>
            </div>
            <Link href="/admin/inventory">Abrir</Link>
          </div>
          <div className="admin-list-stack">
            {dashboard.inventoryCritical.length ? (
              dashboard.inventoryCritical.map((item) => {
                const available = item.quantity_on_hand - item.quantity_reserved;
                return (
                  <Link className="admin-inventory-row" href="/admin/inventory" key={item.id}>
                    <span className="admin-table-thumb" style={{ backgroundImage: item.imagePath ? `url(${getStoragePublicUrl(item.imagePath)})` : undefined }} />
                    <div>
                      <strong>{item.productName}</strong>
                      <span>{item.sku}</span>
                    </div>
                    <StatusBadge tone={available <= 0 ? "danger" : "warning"}>{available} disp.</StatusBadge>
                  </Link>
                );
              })
            ) : (
              <EmptyState title="Inventario sano" text="No hay productos por debajo del reorder point." />
            )}
          </div>
        </article>

        <article className="admin-panel admin-catalog-health-panel">
          <div className="admin-panel-header">
            <div>
              <h2>Salud del catalogo</h2>
              <span>Publicacion, assets y costos.</span>
            </div>
            <PackageCheck size={18} aria-hidden="true" />
          </div>
          <div className="admin-health-stack">
            <HealthRow label="Publicados con imagen" value={`${catalog.withImage}/${catalog.published}`} percent={withImage} />
            <HealthRow label="Publicados con costo" value={`${catalog.withCost}/${catalog.published}`} percent={withCost} />
            <HealthRow label="Listos sin alerta stock" value={`${readyProducts}/${catalog.published}`} percent={readyProductsPct} />
          </div>
        </article>

        <article className="admin-panel admin-quick-panel">
          <div className="admin-panel-header">
            <div>
              <h2>Acciones rapidas</h2>
              <span>Maximo cuatro caminos frecuentes.</span>
            </div>
          </div>
          <div className="admin-quick-actions">
            <Link href="/admin/orders"><ShoppingBag size={17} /> Revisar pedidos</Link>
            <Link href="/admin/products/new"><PackageCheck size={17} /> Nuevo producto</Link>
            <Link href="/admin/inventory"><AlertTriangle size={17} /> Ajustar stock</Link>
            <Link href="/admin/analytics"><BarChart3 size={17} /> Ver analytics</Link>
          </div>
        </article>

        <article className="admin-panel admin-activity-panel">
          <div className="admin-panel-header">
            <div>
              <h2>Actividad</h2>
              <span>Audit log reciente.</span>
            </div>
            <Activity size={18} aria-hidden="true" />
          </div>
          <div className="admin-activity-list">
            {dashboard.audit.length ? (
              dashboard.audit.slice(0, 6).map((event) => (
                <div className="admin-activity-row" key={event.id}>
                  <span />
                  <div>
                    <strong>{event.action}</strong>
                    <small>{event.entity_type} · {formatDate(event.created_at)}</small>
                  </div>
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

function Metric({ label, value, tone = "calm" }: { label: string; value: string | number; tone?: "calm" | "warning" }) {
  return (
    <article className={`admin-strip-metric tone-${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function MiniSalesBars({ series, maxRevenue }: { series: SalesPoint[]; maxRevenue: number }) {
  return (
    <div className="admin-mini-sales" aria-label="Ventas por dia">
      {series.map((day) => (
        <span key={day.date} title={`${day.date}: ${formatMoney(day.revenue)}`}>
          <i style={{ height: `${Math.max((day.revenue / maxRevenue) * 100, day.orders ? 14 : 4)}%` }} />
        </span>
      ))}
    </div>
  );
}

function HealthRow({ label, value, percent: amount }: { label: string; value: string; percent: number }) {
  return (
    <div className="admin-health-row">
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
      <i><b style={{ width: `${amount}%` }} /></i>
    </div>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Buenos dias";
  if (hour < 19) return "Buenas tardes";
  return "Buenas noches";
}

function percent(value: number, total: number) {
  if (!total) return 0;
  return Math.round((value / total) * 100);
}

function rangeHref(range: 7 | 30, includeTest: boolean) {
  const params = new URLSearchParams({ range: String(range) });
  if (includeTest) {
    params.set("includeTest", "true");
  }
  return `/admin?${params.toString()}`;
}
