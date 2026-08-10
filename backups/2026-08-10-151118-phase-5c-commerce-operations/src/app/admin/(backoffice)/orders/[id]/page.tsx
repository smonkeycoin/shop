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
  const { order, items, addresses, events } = await getOrderDetail(id);
  if (!order) notFound();
  const address = addresses[0];

  return (
    <>
      <AdminPageHeader title={order.order_number} eyebrow="Pedidos / Detalle" />
      <section className="admin-detail-grid">
        <article className="admin-panel">
          <h2>Resumen</h2>
          <p><strong>Total:</strong> {formatMoney(order.total)}</p>
          <p><strong>Status:</strong> <StatusBadge>{order.status}</StatusBadge></p>
          <p><strong>Tracking:</strong> {order.tracking_number ?? "-"}</p>
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
            {items.map((item) => <div className="admin-list-row" key={item.id}><strong>{item.name}</strong><span>{item.quantity} x {formatMoney(item.unit_price)}</span></div>)}
          </div>
        </article>
        <article className="admin-panel">
          <h2>Direccion</h2>
          {address ? <p>{address.street} {address.exterior_number}, {address.neighborhood}, {address.city}, {address.state} {address.postal_code}</p> : <p>Sin direccion capturada.</p>}
        </article>
        <article className="admin-panel">
          <h2>Eventos</h2>
          {events.map((event) => <p key={event.id}><strong>{event.event_type}</strong> {formatDate(event.created_at)}</p>)}
        </article>
      </section>
    </>
  );
}
