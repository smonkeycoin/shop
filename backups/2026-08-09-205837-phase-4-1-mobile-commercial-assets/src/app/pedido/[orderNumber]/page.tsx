import type { Metadata } from "next";
import { OrderPageClient } from "@/components/shop/OrderPageClient";
import { ShopLayout } from "@/components/shop/ShopLayout";

type OrderPageProps = {
  params: Promise<{ orderNumber: string }>;
};

export async function generateMetadata({ params }: OrderPageProps): Promise<Metadata> {
  const { orderNumber } = await params;

  return {
    title: `Pedido ${orderNumber} | Shop NeumoPractice`,
    description: "Confirmación y seguimiento local de pedido.",
  };
}

export default async function OrderPage({ params }: OrderPageProps) {
  const { orderNumber } = await params;

  return (
    <ShopLayout>
      <OrderPageClient orderNumber={orderNumber} />
    </ShopLayout>
  );
}
