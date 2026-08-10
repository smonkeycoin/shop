import { AdminPageHeader, EmptyState, StatusBadge } from "@/components/admin/AdminUi";
import { saveCategoryAction } from "@/lib/admin/actions";
import { getCategories } from "@/lib/admin/backoffice";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <>
      <AdminPageHeader title="Categorias" eyebrow="Catalogo / Categorias" />
      <section className="admin-split-grid">
        <form className="admin-form-panel compact" action={saveCategoryAction}>
          <h2>Nueva categoria</h2>
          <input name="name" placeholder="Nombre" required />
          <input name="slug" placeholder="Slug" />
          <textarea name="description" placeholder="Descripcion" rows={3} />
          <select name="parent_id" defaultValue="">
            <option value="">Sin parent</option>
            {categories.map((category) => <option value={category.id} key={category.id}>{category.name}</option>)}
          </select>
          <input name="sort_order" type="number" placeholder="Orden" defaultValue={0} />
          <input name="image_path" placeholder="Imagen opcional" />
          <label><input type="checkbox" name="is_active" defaultChecked /> Activo</label>
          <button className="admin-primary-button" type="submit">Guardar categoria</button>
        </form>
        <div className="admin-table-wrap">
          {categories.length ? (
            <table className="admin-table">
              <thead><tr><th>Nombre</th><th>Slug</th><th>Orden</th><th>Activo</th></tr></thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category.id}>
                    <td><strong>{category.name}</strong></td>
                    <td>{category.slug}</td>
                    <td>{category.sort_order}</td>
                    <td><StatusBadge tone={category.is_active ? "success" : "neutral"}>{category.is_active ? "Activo" : "Inactivo"}</StatusBadge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <EmptyState title="Sin categorias" text="Crea la primera categoria." />}
        </div>
      </section>
    </>
  );
}
