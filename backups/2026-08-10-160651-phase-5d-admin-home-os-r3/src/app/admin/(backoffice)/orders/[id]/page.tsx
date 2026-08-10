import { notFound } from "next/navigation";
import { AdminPageHeader, StatusBadge } from "@/components/admin/AdminUi";
import { updateOrderStatusAction } from "@/lib/admin/actions";
import { formatDate, formatMoney } from "@/lib/admin/format";
import { getOrderDetail } from "@/lib/admin/backoffice";

export const dynamic = "force-dynamic";

type OrderDetailProps = {
  params: Promise<{ id: string }>;
};

export default async function OrderDetailPage({ params }: OrderDetailProps) {
  const { id } = await params;
  const { order, items, addresses, events, allocations } = await getOrderDetail(id);
  if (!order) notFound();
  const address = addresses[0];
  const nextStatuses = getNextStatuses(order.status);

  return (
    <>
      <AdminPageHeader title={order.order_number} eyebrow="Pedidos / Detalle">
        {order.is_test ? <StatusBadge tone="warning">TEST</StatusBadge> : <StatusBadge tone="success">REAL</StatusBadge>}
      </AdminPageHeader>
      <section className="admin-detail-grid">
        <article className="admin-panel">
          <h2>Resumen</h2>
          <p><strong>Total:</strong> {formatMoney(order.total)}</p>
          <p><strong>Status:</strong> <StatusBadge tone={getStatusTone(order.status)}>{order.status}</StatusBadge></p>
          <p><strong>Pago:</strong> {order.payment_status}</p>
          <p><strong>Checkout:</strong> {order.checkout_mode}</p>
          <p><strong>Tracking:</strong> {order.tracking_number ?? "-"}</p>
          <div className="admin-inline-actions">
            {nextStatuses.map((status) => (
              <form action={updateOrderStatusAction} key={status}>
                <input type="hidden" name="id" value={order.id} />
                <input type="hidden" name="status" value={status} />
                <input type="hidden" name="carrier" value={order.carrier ?? ""} />
                <input type="hidden" name="tracking_number" value={order.tracking_number ?? ""} />
                <input type="hidden" name="tracking_url" value={order.tracking_url ?? ""} />
                <button className="admin-secondary-button" type="submit">{status}</button>
              </form>
            ))}
          </div>
          <form className="admin-mini-form" action={updateOrderStatusAction}>
            <input type="hidden" name="id" value={order.id} />
            <select name="status" defaultValue={order.status}>
              {["new", "confirmed", "preparing", "shipped", "delivered", "cancelled"].map((status) => <option key={status}>{status}</option>)}
            </select>
            <input name="carrier" placeholder="Carrier" defaultValue={order.carrier ?? ""} />
            <input name="tracking_number" placeholder="Tracking number" defaultValue={order.tracking_number ?? ""} />
            <input name="tracking_url" placeholder="Tracking URL" defaultValue={order.tracking_url ?? ""} />
            <textarea name="notes" placeholder="Notas internas" rows={3} />
            <button className="admin-primary-button" type="submit">Actualizar pedido</button>
          </form>
        </article>
        <article className="admin-panel">
          <h2>Items</h2>
          <div className="admin-list-stack">
            {items.map((item) => (
              <div className="admin-list-row" key={item.id}>
                <div>
                  <strong>{item.name}</strong>
                  <span>{item.sku} · costo snapshot {formatMoney(item.cost_snapshot)}</span>
                </div>
                <span>{item.quantity} x {formatMoney(item.unit_price)}</span>
              </div>
            ))}
          </div>
        </article>
        <article className="admin-panel">
          <h2>Inventario reservado</h2>
          <div className="admin-list-stack">
            {allocations.length ? (
              allocations.map((allocation) => (
                <div className="admin-list-row" key={allocation.id}>
                  <div>
                    <strong>{allocation.quantity_reserved} unidades</strong>
                    <span>{allocation.sale_applied_at ? "Venta aplicada" : allocation.release_applied_at ? "Liberado" : "Reservado"}</span>
                  </div>
                  <StatusBadge tone={allocation.sale_applied_at ? "success" : allocation.release_applied_at ? "neutral" : "warning"}>
                    inventario
                  </StatusBadge>
                </div>
              ))
            ) : (
              <p>Sin reservas registradas.</p>
            )}
          </div>
        </article>
        <article className="admin-panel">
          <h2>Direccion</h2>
          {address ? <p>{address.street} {address.exterior_number}, {address.neighborhood}, {address.city}, {address.state} {address.postal_code}</p> : <p>Sin direccion capturada.</p>}
        </article>
        <article className="admin-panel wide">
          <h2>Timeline</h2>
          <div className="admin-list-stack">
            {events.map((event) => (
              <div className="admin-list-row" key={event.id}>
                <div>
                  <strong>{event.event_type}</strong>
                  <span>{event.from_status ?? "-"} -&gt; {event.to_status ?? "-"} · {event.notes ?? "Sin notas"}</span>
                </div>
                <span>{formatDate(event.created_at)}</span>
              </div>
            ))}
          </div>
        </article>
      </section>
    </>
  );
}

function getNextStatuses(status: string) {
  if (status === "new") return ["confirmed", "cancelled"];
  if (status === "confirmed") return ["preparing", "cancelled"];
  if (status === "preparing") return ["shipped", "cancelled"];
  if (status === "shipped") return ["delivered"];
  return [];
}

function getStatusTone(status: string) {
  if (status === "delivered") return "success" as const;
  if (status === "cancelled") return "danger" as const;
  if (status === "confirmed" || status === "preparing" || status === "shipped") return "warning" as const;
  return "neutral" as const;
}
