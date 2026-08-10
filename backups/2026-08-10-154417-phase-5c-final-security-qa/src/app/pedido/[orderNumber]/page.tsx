import type { Metadata } from "next";
import { OrderPageClient } from "@/components/shop/OrderPageClient";
import { ShopLayout } from "@/components/shop/ShopLayout";
import { getPublicOrder } from "@/lib/public-orders";

type OrderPageProps = {
  params: Promise<{ orderNumber: string }>;
  searchParams: Promise<{ token?: string }>;
};

export async function generateMetadata({ params }: OrderPageProps): Promise<Metadata> {
  const { orderNumber } = await params;

  return {
    title: `Pedido ${orderNumber} | Shop NeumoPractice`,
    description: "Confirmación y seguimiento local de pedido.",
  };
}

export default async function OrderPage({ params, searchParams }: OrderPageProps) {
  const { orderNumber } = await params;
  const { token } = await searchParams;
  const order = await getPublicOrder(orderNumber, token);

  return (
    <ShopLayout>
      <OrderPageClient orderNumber={orderNumber} initialOrder={order} requiresToken={!token} />
    </ShopLayout>
  );
}
