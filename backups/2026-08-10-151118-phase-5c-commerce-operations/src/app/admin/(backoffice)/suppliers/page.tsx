import { AdminPageHeader, EmptyState, StatusBadge } from "@/components/admin/AdminUi";
import { saveSupplierAction } from "@/lib/admin/actions";
import { formatDate } from "@/lib/admin/format";
import { getSuppliers } from "@/lib/admin/backoffice";

export const dynamic = "force-dynamic";

export default async function SuppliersPage() {
  const suppliers = await getSuppliers();

  return (
    <>
      <AdminPageHeader title="Proveedores" eyebrow="Operacion / Proveedores" />
      <section className="admin-split-grid">
        <form className="admin-form-panel compact" action={saveSupplierAction}>
          <h2>Crear proveedor</h2>
          <input name="name" placeholder="Proveedor" required />
          <input name="contact_name" placeholder="Contacto" />
          <input name="email" type="email" placeholder="Email" />
          <input name="phone" placeholder="Telefono" />
          <input name="whatsapp" placeholder="WhatsApp" />
          <input name="website" placeholder="Website" />
          <textarea name="notes" placeholder="Notas" rows={4} />
          <label><input type="checkbox" name="active" defaultChecked /> Activo</label>
          <button className="admin-primary-button" type="submit">Guardar proveedor</button>
        </form>
        <div className="admin-table-wrap">
          {suppliers.length ? (
            <table className="admin-table">
              <thead><tr><th>Proveedor</th><th>Contacto</th><th>Email</th><th>WhatsApp</th><th>Productos</th><th>Costos</th><th>Estado</th></tr></thead>
              <tbody>
                {suppliers.map((supplier) => (
                  <tr key={supplier.id}>
                    <td><strong>{supplier.name}</strong></td>
                    <td>{supplier.contact_name ?? "-"}</td>
                    <td>{supplier.email ?? "-"}</td>
                    <td>{supplier.whatsapp ?? "-"}</td>
                    <td>{supplier.productCount}</td>
                    <td>{formatDate(supplier.lastCostUpdate)}</td>
                    <td><StatusBadge tone={supplier.active ? "success" : "neutral"}>{supplier.active ? "Activo" : "Inactivo"}</StatusBadge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <EmptyState title="Sin proveedores" text="Crea el primer proveedor." />}
        </div>
      </section>
    </>
  );
}
