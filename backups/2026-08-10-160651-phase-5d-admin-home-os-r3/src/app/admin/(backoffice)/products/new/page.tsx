import { AdminPageHeader } from "@/components/admin/AdminUi";
import { ProductForm } from "@/components/admin/ProductForm";
import { getProductEditorData } from "@/lib/admin/backoffice";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const data = await getProductEditorData();

  return (
    <>
      <AdminPageHeader title="Nuevo producto" eyebrow="Catalogo / Productos / Nuevo" />
      <ProductForm brands={data.brands} categories={data.categories} suppliers={data.suppliers} />
    </>
  );
}
