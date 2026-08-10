import type { Metadata } from "next";
import { OrderLookupClient } from "@/components/shop/OrderLookupClient";
import { ShopLayout } from "@/components/shop/ShopLayout";

export const metadata: Metadata = {
  title: "Sigue tu pedido | Shop NeumoPractice",
  description: "Consulta local de pedidos de Shop NeumoPractice.",
};

export default function SeguimientoPage() {
  return (
    <ShopLayout>
      <OrderLookupClient />
    </ShopLayout>
  );
}
