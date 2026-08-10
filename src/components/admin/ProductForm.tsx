import { approveImageAction, deleteImageAction, saveProductAction, saveProductSupplierAction, setPrimaryImageAction, uploadProductImageAction } from "@/lib/admin/actions";
import { formatMoney } from "@/lib/admin/format";
import { type BrandRow, type CategoryRow, type InventoryRow, type ProductImageRow, type ProductRow, type ProductSupplierRow, type SupplierRow } from "@/lib/admin/backoffice";
import { getStoragePublicUrl } from "@/lib/supabase/storage";

type ProductFormProps = {
  product?: ProductRow | null;
  brands: BrandRow[];
  categories: CategoryRow[];
  suppliers?: SupplierRow[];
  inventory?: InventoryRow[];
  images?: ProductImageRow[];
  productSuppliers?: ProductSupplierRow[];
};

export function ProductForm({ product, brands, categories, suppliers = [], inventory = [], images = [], productSuppliers = [] }: ProductFormProps) {
  const stock = inventory.find((row) => !row.variant_id);
  const tags = Array.isArray(product?.tags) ? product.tags.join(", ") : "";
  const retail = Number(product?.retail_price ?? 0);
  const cost = product?.cost == null ? null : Number(product.cost);
  const margin = cost == null || retail <= 0 ? null : ((retail - cost) / retail) * 100;
  const markup = cost == null || cost <= 0 ? null : ((retail - cost) / cost) * 100;
  const market = product?.market_reference_price == null ? null : Number(product.market_reference_price);

  return (
    <div className="admin-editor-grid">
      <form className="admin-form-panel" action={saveProductAction}>
        {product ? <input type="hidden" name="id" value={product.id} /> : null}
        <section>
          <h2>General</h2>
          <div className="admin-form-grid">
            <label>
              Nombre
              <input name="name" defaultValue={product?.name ?? ""} required />
            </label>
            <label>
              Slug
              <input name="slug" defaultValue={product?.slug ?? ""} />
            </label>
            <label>
              SKU
              <input name="sku" defaultValue={product?.sku ?? ""} required />
            </label>
            <label>
              Marca
              <select name="brand_id" defaultValue={product?.brand_id ?? ""}>
                <option value="">Sin marca</option>
                {brands.map((brand) => (
                  <option value={brand.id} key={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Categoria
              <select name="category_id" defaultValue={product?.category_id ?? ""}>
                <option value="">Sin categoria</option>
                {categories.map((category) => (
                  <option value={category.id} key={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Subcategoria
              <select name="subcategory_id" defaultValue={product?.subcategory_id ?? ""}>
                <option value="">Sin subcategoria</option>
                {categories.map((category) => (
                  <option value={category.id} key={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label>
            Descripcion corta
            <textarea name="short_description" defaultValue={product?.short_description ?? ""} rows={2} />
          </label>
          <label>
            Descripcion larga
            <textarea name="description" defaultValue={product?.description ?? ""} rows={5} />
          </label>
          <label>
            Tags
            <input name="tags" defaultValue={tags} placeholder="aerocamara, pediatrico" />
          </label>
        </section>

        <section>
          <h2>Precio</h2>
          <div className="admin-form-grid">
            <label>
              Precio Shop
              <input name="retail_price" type="number" step="0.01" defaultValue={product?.retail_price ?? 0} />
            </label>
            <label>
              Precio comparacion
              <input name="compare_at_price" type="number" step="0.01" defaultValue={product?.compare_at_price ?? ""} />
            </label>
            <label>
              Costo proveedor
              <input name="cost" type="number" step="0.01" defaultValue={product?.cost ?? ""} />
            </label>
            <label>
              Retail referencia
              <input name="market_reference_price" type="number" step="0.01" defaultValue={product?.market_reference_price ?? ""} />
            </label>
            <label className="wide">
              Fuente retail
              <input name="market_reference_source" defaultValue={product?.market_reference_source ?? ""} />
            </label>
          </div>
          <div className="admin-commercial-strip">
            <span>Markup: <strong>{markup == null ? "-" : `${markup.toFixed(1)}%`}</strong></span>
            <span>Margen bruto: <strong>{margin == null ? "-" : `${margin.toFixed(1)}%`}</strong></span>
            <span>Vs retailer: <strong>{market == null ? "-" : formatMoney(retail - market)}</strong></span>
          </div>
        </section>

        <section>
          <h2>Inventario</h2>
          <div className="admin-form-grid">
            <label>
              Stock inicial
              <input name="stock_initial" type="number" defaultValue={stock?.quantity_on_hand ?? 0} />
            </label>
            <label>
              Reorder point
              <input name="reorder_point" type="number" defaultValue={stock?.reorder_point ?? 0} />
            </label>
            <label>
              Shipping class
              <select name="shipping_class" defaultValue={product?.shipping_class ?? "standard"}>
                <option value="small">Small</option>
                <option value="standard">Standard</option>
                <option value="bulky">Bulky</option>
                <option value="special">Special</option>
              </select>
            </label>
            <label>
              Peso gramos
              <input name="weight_grams" type="number" defaultValue={product?.weight_grams ?? ""} />
            </label>
            <label>
              Largo cm
              <input name="length_cm" type="number" step="0.1" defaultValue={product?.length_cm ?? ""} />
            </label>
            <label>
              Ancho cm
              <input name="width_cm" type="number" step="0.1" defaultValue={product?.width_cm ?? ""} />
            </label>
            <label>
              Alto cm
              <input name="height_cm" type="number" step="0.1" defaultValue={product?.height_cm ?? ""} />
            </label>
            <label>
              Estado stock
              <select name="stock_status" defaultValue={product?.stock_status ?? "in_stock"}>
                <option value="in_stock">Disponible</option>
                <option value="low_stock">Stock bajo</option>
                <option value="out_of_stock">Agotado</option>
                <option value="preorder">Sobre pedido</option>
              </select>
            </label>
          </div>
        </section>

        <section>
          <h2>Publicacion</h2>
          <div className="admin-toggle-grid">
            <label><input type="checkbox" name="published" defaultChecked={product?.published ?? false} /> Publicado</label>
            <label><input type="checkbox" name="featured" defaultChecked={product?.featured ?? false} /> Featured</label>
            <label><input type="checkbox" name="is_new" defaultChecked={product?.is_new ?? false} /> Nuevo</label>
            <label><input type="checkbox" name="is_best_seller" defaultChecked={product?.is_best_seller ?? false} /> Best seller</label>
            <label><input type="checkbox" name="active" defaultChecked={product?.active ?? true} /> Active</label>
          </div>
        </section>

        <div className="admin-form-actions">
          <button className="admin-ghost-button" type="submit" name="intent" value="draft">Guardar borrador</button>
          <button className="admin-primary-button" type="submit" name="intent" value="publish">Guardar y publicar</button>
        </div>
      </form>

      {product ? (
        <aside className="admin-side-stack">
          <section className="admin-panel">
            <div className="admin-panel-header">
              <h2>Imagenes</h2>
              <span>{images.length}</span>
            </div>
            <form className="admin-upload-box" action={uploadProductImageAction}>
              <input type="hidden" name="product_id" value={product.id} />
              <input type="file" name="image" accept="image/png,image/jpeg,image/webp,image/svg+xml" />
              <input name="alt_text" placeholder="Alt text" />
              <button className="admin-primary-button" type="submit">Subir imagen</button>
            </form>
            <div className="admin-image-grid">
              {images.map((image) => (
                <div className="admin-image-item" key={image.id}>
                  <div className="admin-thumb" style={{ backgroundImage: `url(${getStoragePublicUrl(image.storage_path)})` }} />
                  <strong>{image.is_primary ? "Principal" : "Imagen"}</strong>
                  <span>{image.production_approved ? "Approved" : "Pendiente"}</span>
                  <form action={setPrimaryImageAction}>
                    <input type="hidden" name="product_id" value={product.id} />
                    <input type="hidden" name="image_id" value={image.id} />
                    <button className="admin-ghost-button" type="submit">Marcar principal</button>
                  </form>
                  <form action={approveImageAction}>
                    <input type="hidden" name="image_id" value={image.id} />
                    <button className="admin-ghost-button" type="submit">Production approved</button>
                  </form>
                  <form action={deleteImageAction}>
                    <input type="hidden" name="image_id" value={image.id} />
                    <input type="hidden" name="storage_path" value={image.storage_path} />
                    <button className="admin-danger-button" type="submit">Eliminar</button>
                  </form>
                </div>
              ))}
            </div>
          </section>

          <section className="admin-panel">
            <div className="admin-panel-header">
              <h2>Proveedor</h2>
              <span>{productSuppliers.length}</span>
            </div>
            <form className="admin-mini-form" action={saveProductSupplierAction}>
              <input type="hidden" name="product_id" value={product.id} />
              <select name="supplier_id" required>
                <option value="">Seleccionar proveedor</option>
                {suppliers.map((supplier) => (
                  <option value={supplier.id} key={supplier.id}>{supplier.name}</option>
                ))}
              </select>
              <input name="supplier_sku" placeholder="Supplier SKU" />
              <input name="supplier_cost" type="number" step="0.01" placeholder="Costo" />
              <input name="minimum_order_quantity" type="number" placeholder="MOQ" />
              <input name="lead_time_days" type="number" placeholder="Lead time dias" />
              <label><input type="checkbox" name="preferred" /> Preferred</label>
              <button className="admin-primary-button" type="submit">Asociar proveedor</button>
            </form>
          </section>
        </aside>
      ) : null}
    </div>
  );
}
