import Link from "next/link";
import { AdminPageHeader, EmptyState, StatusBadge } from "@/components/admin/AdminUi";
import { formatDate, formatMoney } from "@/lib/admin/format";
import { getOrders } from "@/lib/admin/backoffice";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const orders = await getOrders();

  return (
    <>
      <AdminPageHeader title="Pedidos" eyebrow="Principal / Pedidos">
        <form className="admin-filterbar compact"><input type="date" name="date" /><button className="admin-ghost-button">Refresh</button></form>
      </AdminPageHeader>
      <div className="admin-table-wrap admin-responsive-table">
        {orders.length ? (
          <>
            <table className="admin-table">
              <thead><tr><th>Pedido</th><th>Fecha</th><th>Cliente</th><th>Items</th><th>Total</th><th>Pago</th><th>Estado</th><th>Envio</th><th>Accion</th></tr></thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td><strong>{order.order_number}</strong></td>
                    <td>{formatDate(order.created_at)}</td>
                    <td>{order.customerName}</td>
                    <td>{order.itemCount}</td>
                    <td>{formatMoney(order.total)}</td>
                    <td><StatusBadge tone={order.payment_status === "paid" ? "success" : "warning"}>{order.payment_status}</StatusBadge></td>
                    <td><StatusBadge>{order.status}</StatusBadge></td>
                    <td>{order.shipping_status}</td>
                    <td><Link href={`/admin/orders/${order.id}`}>Ver</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="admin-mobile-list">
              {orders.map((order) => (
                <Link className="admin-mobile-card admin-mobile-order-card" href={`/admin/orders/${order.id}`} key={order.id}>
                  <div className="admin-mobile-card-head">
                    <div>
                      <strong>{order.order_number}</strong>
                      <small>{formatDate(order.created_at)}</small>
                    </div>
                    <strong>{formatMoney(order.total)}</strong>
                  </div>
                  <div className="admin-mobile-meta-grid">
                    <span><b>Cliente</b>{order.customerName}</span>
                    <span><b>Items</b>{order.itemCount}</span>
                    <span><b>Envio</b>{order.shipping_status}</span>
                  </div>
                  <div className="admin-mobile-card-footer">
                    <StatusBadge tone={order.payment_status === "paid" ? "success" : "warning"}>{order.payment_status}</StatusBadge>
                    <StatusBadge>{order.status}</StatusBadge>
                  </div>
                </Link>
              ))}
            </div>
          </>
        ) : <EmptyState title="Aun no hay pedidos." text="Cuando checkout cree pedidos persistentes apareceran aqui." />}
      </div>
    </>
  );
}
