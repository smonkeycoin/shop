import { AdminPageHeader, EmptyState, StatusBadge } from "@/components/admin/AdminUi";
import { approveImageAction, deleteImageAction, setPrimaryImageAction } from "@/lib/admin/actions";
import { getAssets } from "@/lib/admin/backoffice";
import { getStoragePublicUrl } from "@/lib/supabase/storage";

export const dynamic = "force-dynamic";

export default async function AssetsPage() {
  const assets = await getAssets();

  return (
    <>
      <AdminPageHeader title="Assets" eyebrow="Catalogo / Assets" />
      <div className="admin-table-wrap">
        {assets.length ? (
          <table className="admin-table">
            <thead><tr><th>Imagen</th><th>Producto</th><th>Fuente</th><th>Resolucion</th><th>Production</th><th>Status</th><th>Acciones</th></tr></thead>
            <tbody>
              {assets.map((asset) => (
                <tr key={asset.id}>
                  <td><div className="admin-table-thumb" style={{ backgroundImage: `url(${getStoragePublicUrl(asset.storage_path)})` }} /></td>
                  <td><strong>{asset.product?.name ?? "Producto"}</strong><span>{asset.product?.sku ?? ""}</span></td>
                  <td>{asset.source_type ?? "-"}</td>
                  <td>{asset.width && asset.height ? `${asset.width}x${asset.height}` : "-"}</td>
                  <td><StatusBadge tone={asset.production_approved ? "success" : "warning"}>{asset.production_approved ? "Approved" : "Pendiente"}</StatusBadge></td>
                  <td><StatusBadge tone={asset.is_primary ? "success" : "neutral"}>{asset.is_primary ? "Primary" : "Gallery"}</StatusBadge></td>
                  <td>
                    <div className="admin-row-actions">
                      <form action={setPrimaryImageAction}>
                        <input type="hidden" name="product_id" value={asset.product_id} />
                        <input type="hidden" name="image_id" value={asset.id} />
                        <button type="submit">Primary</button>
                      </form>
                      <form action={approveImageAction}>
                        <input type="hidden" name="image_id" value={asset.id} />
                        <button type="submit">Approve</button>
                      </form>
                      <form action={deleteImageAction}>
                        <input type="hidden" name="image_id" value={asset.id} />
                        <input type="hidden" name="storage_path" value={asset.storage_path} />
                        <button type="submit">Delete</button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <EmptyState title="Sin assets" text="Las imagenes subidas desde productos apareceran aqui." />}
      </div>
    </>
  );
}
