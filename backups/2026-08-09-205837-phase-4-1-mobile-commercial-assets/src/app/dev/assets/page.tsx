import { notFound } from "next/navigation";
import { DevAssetsClient } from "@/components/shop/DevAssetsClient";
import { ShopLayout } from "@/components/shop/ShopLayout";

export default function DevAssetsPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return (
    <ShopLayout>
      <DevAssetsClient />
    </ShopLayout>
  );
}
