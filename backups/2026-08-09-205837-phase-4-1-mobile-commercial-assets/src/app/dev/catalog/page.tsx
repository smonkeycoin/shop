import { notFound } from "next/navigation";
import { DevCatalogClient } from "@/components/shop/DevCatalogClient";
import { ShopLayout } from "@/components/shop/ShopLayout";

export default function DevCatalogPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return (
    <ShopLayout>
      <DevCatalogClient />
    </ShopLayout>
  );
}
