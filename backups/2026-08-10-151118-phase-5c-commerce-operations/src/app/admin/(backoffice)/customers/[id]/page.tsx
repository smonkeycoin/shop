import { notFound } from "next/navigation";
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
  const { customer, orders } = await getCustomerDetail(id);
  if (!customer) notFound();
  const whatsapp = normalizeWhatsAppNumber(customer.whatsapp ?? customer.phone ?? "");
  const tags = Array.isArray(customer.tags) ? customer.tags.join(", ") : "";

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
          <p><strong>Pedidos:</strong> {orders.length}</p>
          <p><strong>Total comprado:</strong> {formatMoney(orders.filter((order) => order.payment_status === "paid").reduce((sum, order) => sum + Number(order.total), 0))}</p>
          <p><strong>Ultima compra:</strong> {formatDate(customer.last_order_at)}</p>
        </article>
        <article className="admin-panel wide">
          <h2>Notas y tags</h2>
          <form className="admin-mini-form" action={saveCustomerNotesAction}>
            <input type="hidden" name="id" value={customer.id} />
            <textarea name="notes" rows={5} defaultValue={customer.notes ?? ""} />
            <input name="tags" defaultValue={tags} placeholder="frecuente, factura" />
            <button className="admin-primary-button" type="submit">Guardar notas</button>
          </form>
        </article>
        <article className="admin-panel wide">
          <h2>Historial de pedidos</h2>
          <div className="admin-list-stack">
            {orders.map((order) => <div className="admin-list-row" key={order.id}><strong>{order.order_number}</strong><span>{formatMoney(order.total)} · {formatDate(order.created_at)}</span></div>)}
          </div>
        </article>
      </section>
    </>
  );
}
