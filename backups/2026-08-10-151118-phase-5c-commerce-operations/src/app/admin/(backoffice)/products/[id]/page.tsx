import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminUi";
import { ProductForm } from "@/components/admin/ProductForm";
import { getProductEditorData } from "@/lib/admin/backoffice";

export const dynamic = "force-dynamic";

type ProductEditPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProductEditPage({ params }: ProductEditPageProps) {
  const { id } = await params;
  const data = await getProductEditorData(id);

  if (!data.product) {
    notFound();
  }

  return (
    <>
      <AdminPageHeader title={data.product.name} eyebrow="Catalogo / Productos / Editar" />
      <ProductForm
        product={data.product}
        brands={data.brands}
        categories={data.categories}
        suppliers={data.suppliers}
        inventory={data.inventory}
        images={data.images}
        productSuppliers={data.productSuppliers}
      />
    </>
  );
}
