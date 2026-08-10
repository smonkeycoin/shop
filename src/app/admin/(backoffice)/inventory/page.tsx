import { AdminPageHeader, EmptyState, StatusBadge } from "@/components/admin/AdminUi";
import { adjustStockAction } from "@/lib/admin/actions";
import { formatDate } from "@/lib/admin/format";
import { getInventoryRows } from "@/lib/admin/backoffice";
import { getStoragePublicUrl } from "@/lib/supabase/storage";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  const rows = await getInventoryRows();

  return (
    <>
      <AdminPageHeader title="Inventario" eyebrow="Catalogo / Inventario">
        <span className="admin-muted-action">Ajustar stock desde cada fila</span>
      </AdminPageHeader>
      <div className="admin-table-wrap admin-responsive-table">
        {rows.length ? (
          <>
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
                      <td><InventoryAdjustmentForm id={row.id} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="admin-mobile-list">
              {rows.map((row) => {
                const available = row.quantity_on_hand - row.quantity_reserved;
                return (
                  <article className="admin-mobile-card" key={row.id}>
                    <div className="admin-mobile-card-head">
                      <span className="admin-table-thumb" style={{ backgroundImage: row.imagePath ? `url(${getStoragePublicUrl(row.imagePath)})` : undefined }} />
                      <div>
                        <strong>{row.productName}</strong>
                        <small>{row.sku}{row.variantName ? ` · ${row.variantName}` : ""}</small>
                      </div>
                    </div>
                    <div className="admin-mobile-meta-grid">
                      <span><b>Fisico</b>{row.quantity_on_hand}</span>
                      <span><b>Reservado</b>{row.quantity_reserved}</span>
                      <span><b>Disponible</b>{available}</span>
                      <span><b>Reorder</b>{row.reorder_point}</span>
                    </div>
                    <div className="admin-mobile-card-footer">
                      <InventoryStatus available={available} reorder={row.reorder_point} />
                      <small>{formatDate(row.updated_at)}</small>
                    </div>
                    <InventoryAdjustmentForm id={row.id} compact />
                  </article>
                );
              })}
            </div>
          </>
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

function InventoryAdjustmentForm({ id, compact }: { id: string; compact?: boolean }) {
  return (
    <form className={`admin-inline-stock ${compact ? "compact" : ""}`} action={adjustStockAction}>
      <input type="hidden" name="inventory_id" value={id} />
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
  );
}
