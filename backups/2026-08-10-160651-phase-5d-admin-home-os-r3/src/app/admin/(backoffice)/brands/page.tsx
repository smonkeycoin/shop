import { AdminPageHeader, EmptyState, StatusBadge } from "@/components/admin/AdminUi";
import { saveBrandAction } from "@/lib/admin/actions";
import { getBrands } from "@/lib/admin/backoffice";

export const dynamic = "force-dynamic";

export default async function BrandsPage() {
  const brands = await getBrands();

  return (
    <>
      <AdminPageHeader title="Marcas" eyebrow="Catalogo / Marcas" />
      <section className="admin-split-grid">
        <form className="admin-form-panel compact" action={saveBrandAction}>
          <h2>Nueva marca</h2>
          <input name="name" placeholder="Nombre" required />
          <input name="manufacturer_name" placeholder="Manufacturer" />
          <input name="slug" placeholder="Slug" />
          <input name="website_url" placeholder="Website" />
          <textarea name="description" placeholder="Descripcion" rows={3} />
          <input name="logo_path" placeholder="Logo" />
          <input name="sort_order" type="number" placeholder="Orden" defaultValue={0} />
          <label><input type="checkbox" name="is_featured" /> Featured</label>
          <label><input type="checkbox" name="is_active" defaultChecked /> Active</label>
          <button className="admin-primary-button" type="submit">Guardar marca</button>
        </form>
        <div className="admin-table-wrap">
          {brands.length ? (
            <table className="admin-table">
              <thead><tr><th>Nombre</th><th>Manufacturer</th><th>Website</th><th>Featured</th><th>Active</th></tr></thead>
              <tbody>
                {brands.map((brand) => (
                  <tr key={brand.id}>
                    <td><strong>{brand.name}</strong></td>
                    <td>{brand.manufacturer_name ?? "-"}</td>
                    <td>{brand.website_url ?? "-"}</td>
                    <td><StatusBadge tone={brand.is_featured ? "success" : "neutral"}>{brand.is_featured ? "Featured" : "No"}</StatusBadge></td>
                    <td><StatusBadge tone={brand.is_active ? "success" : "neutral"}>{brand.is_active ? "Active" : "Inactive"}</StatusBadge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <EmptyState title="Sin marcas" text="Crea la primera marca." />}
        </div>
      </section>
    </>
  );
}
