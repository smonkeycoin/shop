import Link from "next/link";
import { AdminPageHeader, EmptyState, StatusBadge } from "@/components/admin/AdminUi";
import { archiveProductAction, setProductPublishedAction } from "@/lib/admin/actions";
import { formatMoney } from "@/lib/admin/format";
import { getAdminProducts } from "@/lib/admin/backoffice";
import { getStoragePublicUrl } from "@/lib/supabase/storage";

export const dynamic = "force-dynamic";

type ProductsPageProps = {
  searchParams: Promise<{ q?: string; filter?: string; brand?: string; category?: string }>;
};

export default async function AdminProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const { products, brands, categories } = await getAdminProducts(params);

  return (
    <>
      <AdminPageHeader title="Productos" eyebrow="Catalogo / Productos">
        <Link className="admin-primary-button" href="/admin/products/new">+ Nuevo producto</Link>
      </AdminPageHeader>
      <form className="admin-filterbar">
        <input name="q" placeholder="Buscar nombre, SKU o marca" defaultValue={params.q ?? ""} />
        <select name="filter" defaultValue={params.filter ?? "all"}>
          <option value="all">Todos</option>
          <option value="published">Publicado</option>
          <option value="draft">Borrador</option>
          <option value="no-photo">Sin foto</option>
          <option value="no-cost">Sin costo</option>
          <option value="low-stock">Stock bajo</option>
          <option value="out-of-stock">Agotado</option>
        </select>
        <select name="brand" defaultValue={params.brand ?? ""}>
          <option value="">Todas las marcas</option>
          {brands.map((brand) => <option value={brand.id} key={brand.id}>{brand.name}</option>)}
        </select>
        <select name="category" defaultValue={params.category ?? ""}>
          <option value="">Todas las categorias</option>
          {categories.map((category) => <option value={category.id} key={category.id}>{category.name}</option>)}
        </select>
        <button className="admin-ghost-button" type="submit">Filtrar</button>
      </form>

      <div className="admin-table-wrap admin-responsive-table">
        {products.length ? (
          <>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Imagen</th>
                  <th>SKU</th>
                  <th>Producto</th>
                  <th>Marca</th>
                  <th>Categoria</th>
                  <th>Precio</th>
                  <th>Costo</th>
                  <th>Margen</th>
                  <th>Stock</th>
                  <th>Estado</th>
                  <th>Publicado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  const margin = getMargin(product.retail_price, product.cost);
                  return (
                    <tr key={product.id}>
                      <td><div className="admin-table-thumb" style={{ backgroundImage: product.imagePath ? `url(${getStoragePublicUrl(product.imagePath)})` : undefined }} /></td>
                      <td>{product.sku}</td>
                      <td><strong>{product.name}</strong></td>
                      <td>{product.brandName}</td>
                      <td>{product.categoryName}</td>
                      <td>{formatMoney(product.retail_price)}</td>
                      <td>{product.cost == null ? <StatusBadge tone="warning">Sin costo</StatusBadge> : formatMoney(product.cost)}</td>
                      <td>{margin == null ? "-" : `${margin.toFixed(1)}%`}</td>
                      <td>{product.stockOnHand - product.stockReserved}</td>
                      <td><ProductStatus product={product} /></td>
                      <td><StatusBadge tone={product.published ? "success" : "neutral"}>{product.published ? "Publicado" : "Borrador"}</StatusBadge></td>
                      <td>
                        <ProductActions id={product.id} published={product.published} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="admin-mobile-list">
              {products.map((product) => {
                const margin = getMargin(product.retail_price, product.cost);
                return (
                  <article className="admin-mobile-card" key={product.id}>
                    <div className="admin-mobile-card-head">
                      <span className="admin-table-thumb" style={{ backgroundImage: product.imagePath ? `url(${getStoragePublicUrl(product.imagePath)})` : undefined }} />
                      <div>
                        <strong>{product.name}</strong>
                        <small>{product.sku} · {product.brandName}</small>
                      </div>
                    </div>
                    <div className="admin-mobile-meta-grid">
                      <span><b>Precio</b>{formatMoney(product.retail_price)}</span>
                      <span><b>Stock</b>{product.stockOnHand - product.stockReserved}</span>
                      <span><b>Margen</b>{margin == null ? "-" : `${margin.toFixed(1)}%`}</span>
                      <span><b>Categoria</b>{product.categoryName}</span>
                    </div>
                    <div className="admin-mobile-card-footer">
                      <ProductStatus product={product} />
                      <StatusBadge tone={product.published ? "success" : "neutral"}>{product.published ? "Publicado" : "Borrador"}</StatusBadge>
                    </div>
                    <ProductActions id={product.id} published={product.published} />
                  </article>
                );
              })}
            </div>
          </>
        ) : (
          <EmptyState title="Sin productos" text="Ajusta filtros o crea un producto nuevo." href="/admin/products/new" action="Nuevo producto" />
        )}
      </div>
    </>
  );
}

function ProductStatus({ product }: { product: { active: boolean; stockOnHand: number; reorderPoint: number } }) {
  if (!product.active) return <StatusBadge tone="danger">Inactivo</StatusBadge>;
  if (product.stockOnHand <= 0) return <StatusBadge tone="danger">Agotado</StatusBadge>;
  if (product.stockOnHand <= product.reorderPoint) return <StatusBadge tone="warning">Stock bajo</StatusBadge>;
  return <StatusBadge tone="success">Disponible</StatusBadge>;
}

function ProductActions({ id, published }: { id: string; published: boolean }) {
  return (
    <div className="admin-row-actions">
      <Link href={`/admin/products/${id}`}>Editar</Link>
      <form action={setProductPublishedAction}>
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="published" value={String(!published)} />
        <button type="submit">{published ? "Despublicar" : "Publicar"}</button>
      </form>
      <form action={archiveProductAction}>
        <input type="hidden" name="id" value={id} />
        <button type="submit">Archivar</button>
      </form>
    </div>
  );
}

function getMargin(retailPrice: string | number | null, cost: string | number | null) {
  if (cost == null || Number(retailPrice) <= 0) {
    return null;
  }

  return ((Number(retailPrice) - Number(cost)) / Number(retailPrice)) * 100;
}
