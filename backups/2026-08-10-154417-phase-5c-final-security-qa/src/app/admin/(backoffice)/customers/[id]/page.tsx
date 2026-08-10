import { notFound } from "next/navigation";
import Link from "next/link";
import { AdminPageHeader, StatusBadge } from "@/components/admin/AdminUi";
import { saveCustomerNotesAction } from "@/lib/admin/actions";
import { formatDate, formatMoney } from "@/lib/admin/format";
import { getCustomerDetail } from "@/lib/admin/backoffice";
import { normalizeWhatsAppNumber } from "@/lib/orders";

export const dynamic = "force-dynamic";

type CustomerDetailProps = {
  params: Promise<{ id: string }>;
};

export default async function CustomerDetailPage({ params }: CustomerDetailProps) {
  const { id } = await params;
  const { customer, orders, notes } = await getCustomerDetail(id);
  if (!customer) notFound();
  const whatsapp = normalizeWhatsAppNumber(customer.whatsapp ?? customer.phone ?? "");
  const tags = Array.isArray(customer.tags) ? customer.tags.join(", ") : "";
  const realOrders = orders.filter((order) => !order.is_test);
  const paidOrders = realOrders.filter((order) => order.payment_status === "paid");
  const totalPurchased = paidOrders.reduce((sum, order) => sum + Number(order.total), 0);

  return (
    <>
      <AdminPageHeader title={`${customer.first_name} ${customer.last_name}`.trim() || "Cliente"} eyebrow="Clientes / Detalle">
        {whatsapp ? <a className="admin-primary-button" href={`https://wa.me/${whatsapp}`} target="_blank">WhatsApp</a> : null}
      </AdminPageHeader>
      <section className="admin-detail-grid">
        <article className="admin-panel">
          <h2>Contacto</h2>
          <p><strong>Email:</strong> {customer.email ?? "-"}</p>
          <p><strong>Telefono:</strong> {customer.phone ?? "-"}</p>
          <p><strong>WhatsApp:</strong> {customer.whatsapp ?? "-"}</p>
          <p><strong>Status:</strong> <StatusBadge>{customer.status}</StatusBadge></p>
        </article>
        <article className="admin-panel">
          <h2>Resumen comercial</h2>
          <p><strong>Pedidos reales:</strong> {realOrders.length}</p>
          <p><strong>Pedidos demo/test:</strong> {orders.length - realOrders.length}</p>
          <p><strong>Total comprado:</strong> {formatMoney(totalPurchased)}</p>
          <p><strong>Ultima compra:</strong> {formatDate(customer.last_order_at)}</p>
        </article>
        <article className="admin-panel wide">
          <h2>Notas y tags</h2>
          <form className="admin-mini-form" action={saveCustomerNotesAction}>
            <input type="hidden" name="id" value={customer.id} />
            <textarea name="notes" rows={4} placeholder="Nueva nota interna" />
            <input name="tags" defaultValue={tags} placeholder="frecuente, factura" />
            <button className="admin-primary-button" type="submit">Guardar nota</button>
          </form>
        </article>
        <article className="admin-panel wide">
          <h2>Historial de notas</h2>
          <div className="admin-list-stack">
            {notes.length ? (
              notes.map((note) => (
                <div className="admin-list-row" key={note.id}>
                  <div>
                    <strong>{note.note}</strong>
                    <span>{note.activity_type} · {formatDate(note.created_at)}</span>
                  </div>
                  <StatusBadge>{Array.isArray(note.tags) ? note.tags.length : 0} tags</StatusBadge>
                </div>
              ))
            ) : (
              <p>Sin notas internas.</p>
            )}
          </div>
        </article>
        <article className="admin-panel wide">
          <h2>Historial de pedidos</h2>
          <div className="admin-list-stack">
            {orders.map((order) => (
              <Link className="admin-list-row" href={`/admin/orders/${order.id}`} key={order.id}>
                <div>
                  <strong>{order.order_number}</strong>
                  <span>{order.is_test ? "TEST" : "REAL"} · {formatDate(order.created_at)}</span>
                </div>
                <span>{formatMoney(order.total)}</span>
              </Link>
            ))}
          </div>
        </article>
      </section>
    </>
  );
}
