import Link from "next/link";
import { AdminPageHeader, EmptyState, StatusBadge } from "@/components/admin/AdminUi";
import { formatDate, formatMoney } from "@/lib/admin/format";
import { getCustomers } from "@/lib/admin/backoffice";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  const customers = await getCustomers();

  return (
    <>
      <AdminPageHeader title="Clientes" eyebrow="Principal / Clientes" />
      <div className="admin-table-wrap">
        {customers.length ? (
          <table className="admin-table">
            <thead><tr><th>Cliente</th><th>WhatsApp</th><th>Email</th><th>Pedidos</th><th>Total comprado</th><th>Ultima compra</th><th>Status</th><th>Accion</th></tr></thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id}>
                  <td><strong>{`${customer.first_name} ${customer.last_name}`.trim() || "Cliente"}</strong></td>
                  <td>{customer.whatsapp ?? customer.phone ?? "-"}</td>
                  <td>{customer.email ?? "-"}</td>
                  <td>{customer.orderCount}</td>
                  <td>{formatMoney(customer.totalPurchased)}</td>
                  <td>{formatDate(customer.last_order_at)}</td>
                  <td><StatusBadge tone={customer.status === "active" ? "success" : "neutral"}>{customer.status}</StatusBadge></td>
                  <td><Link href={`/admin/customers/${customer.id}`}>Ver</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <EmptyState title="Sin clientes" text="Los clientes apareceran cuando existan pedidos persistentes." />}
      </div>
    </>
  );
}
