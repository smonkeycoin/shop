import { AdminPageHeader, EmptyState, StatusBadge } from "@/components/admin/AdminUi";
import { adjustStockAction } from "@/lib/admin/actions";
import { formatDate } from "@/lib/admin/format";
import { getInventoryRows } from "@/lib/admin/backoffice";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  const rows = await getInventoryRows();

  return (
    <>
      <AdminPageHeader title="Inventario" eyebrow="Catalogo / Inventario">
        <span className="admin-muted-action">Ajustar stock desde cada fila</span>
      </AdminPageHeader>
      <div className="admin-table-wrap">
        {rows.length ? (
          <table className="admin-table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Producto</th>
                <th>Variante</th>
                <th>Stock fisico</th>
                <th>Reservado</th>
                <th>Disponible</th>
                <th>Reorder</th>
                <th>Estado</th>
                <th>Actualizado</th>
                <th>Accion</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const available = row.quantity_on_hand - row.quantity_reserved;
                return (
                  <tr key={row.id}>
                    <td>{row.sku}</td>
                    <td><strong>{row.productName}</strong></td>
                    <td>{row.variantName ?? "-"}</td>
                    <td>{row.quantity_on_hand}</td>
                    <td>{row.quantity_reserved}</td>
                    <td>{available}</td>
                    <td>{row.reorder_point}</td>
                    <td><InventoryStatus available={available} reorder={row.reorder_point} /></td>
                    <td>{formatDate(row.updated_at)}</td>
                    <td>
                      <form className="admin-inline-stock" action={adjustStockAction}>
                        <input type="hidden" name="inventory_id" value={row.id} />
                        <input name="delta" type="number" placeholder="+ / -" />
                        <select name="reason" defaultValue="Correccion">
                          <option>Compra proveedor</option>
                          <option>Correccion</option>
                          <option>Merma</option>
                          <option>Devolucion</option>
                          <option>Otro</option>
                        </select>
                        <input name="notes" placeholder="Notas" />
                        <button type="submit">Ajustar</button>
                      </form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <EmptyState title="Sin inventario" text="Crea productos para inicializar stock." />
        )}
      </div>
    </>
  );
}

function InventoryStatus({ available, reorder }: { available: number; reorder: number }) {
  if (available <= 0) return <StatusBadge tone="danger">Agotado</StatusBadge>;
  if (available <= reorder) return <StatusBadge tone="warning">Stock bajo</StatusBadge>;
  return <StatusBadge tone="success">Disponible</StatusBadge>;
}
