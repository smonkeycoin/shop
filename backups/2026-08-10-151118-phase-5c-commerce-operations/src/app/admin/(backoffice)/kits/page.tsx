import { AdminPageHeader, EmptyState, StatusBadge } from "@/components/admin/AdminUi";
import { saveKitAction } from "@/lib/admin/actions";
import { formatMoney } from "@/lib/admin/format";
import { getKits } from "@/lib/admin/backoffice";

export const dynamic = "force-dynamic";

export default async function KitsPage() {
  const { bundles, items, products } = await getKits();

  return (
    <>
      <AdminPageHeader title="Kits" eyebrow="Catalogo / Kits" />
      <section className="admin-split-grid">
        <form className="admin-form-panel compact" action={saveKitAction}>
          <h2>Crear kit</h2>
          <input name="name" placeholder="Nombre" required />
          <input name="slug" placeholder="Slug" />
          <textarea name="short_description" placeholder="Descripcion corta" rows={2} />
          <textarea name="description" placeholder="Descripcion" rows={3} />
          <input name="retail_price" type="number" step="0.01" placeholder="Precio" />
          <input name="compare_at_price" type="number" step="0.01" placeholder="Compare price" />
          <input name="image_path" placeholder="Imagen" />
          <select name="product_id" defaultValue="">
            <option value="">Agregar producto inicial</option>
            {products.map((product) => <option value={product.id} key={product.id}>{product.name}</option>)}
          </select>
          <input name="quantity" type="number" min={1} defaultValue={1} />
          <label><input type="checkbox" name="featured" /> Featured</label>
          <label><input type="checkbox" name="published" /> Published</label>
          <label><input type="checkbox" name="active" defaultChecked /> Active</label>
          <button className="admin-primary-button" type="submit">Guardar kit</button>
        </form>
        <div className="admin-table-wrap">
          {bundles.length ? (
            <table className="admin-table">
              <thead><tr><th>Nombre</th><th>Productos</th><th>Precio</th><th>Ahorro</th><th>Publicado</th></tr></thead>
              <tbody>
                {bundles.map((bundle) => {
                  const bundleItems = items.filter((item) => item.bundle_id === bundle.id);
                  const componentTotal = bundleItems.reduce((sum, item) => sum + Number(products.find((product) => product.id === item.product_id)?.retail_price ?? 0) * item.quantity, 0);
                  return (
                    <tr key={bundle.id}>
                      <td><strong>{bundle.name}</strong></td>
                      <td>{bundleItems.length}</td>
                      <td>{formatMoney(bundle.retail_price)}</td>
                      <td>{componentTotal ? formatMoney(componentTotal - Number(bundle.retail_price)) : "-"}</td>
                      <td><StatusBadge tone={bundle.published ? "success" : "neutral"}>{bundle.published ? "Publicado" : "Borrador"}</StatusBadge></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : <EmptyState title="Sin kits" text="Crea kits a partir de productos existentes." />}
        </div>
      </section>
    </>
  );
}
