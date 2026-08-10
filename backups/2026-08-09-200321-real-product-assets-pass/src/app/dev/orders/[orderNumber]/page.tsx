import { notFound } from "next/navigation";
import { DevOrderDetailClient } from "@/components/shop/DevOrderDetailClient";
import { ShopLayout } from "@/components/shop/ShopLayout";

type DevOrderPageProps = {
  params: Promise<{ orderNumber: string }>;
};

export default async function DevOrderPage({ params }: DevOrderPageProps) {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  const { orderNumber } = await params;

  return (
    <ShopLayout>
      <DevOrderDetailClient orderNumber={orderNumber} />
    </ShopLayout>
  );
}
