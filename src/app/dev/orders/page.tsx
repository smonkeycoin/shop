import { notFound } from "next/navigation";
import { DevOrdersClient } from "@/components/shop/DevOrdersClient";
import { ShopLayout } from "@/components/shop/ShopLayout";

export default function DevOrdersPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return (
    <ShopLayout>
      <DevOrdersClient />
    </ShopLayout>
  );
}
