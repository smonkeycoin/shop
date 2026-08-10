import type { Metadata } from "next";
import { CheckoutClient } from "@/components/shop/CheckoutClient";
import { ShopLayout } from "@/components/shop/ShopLayout";

export const metadata: Metadata = {
  title: "Checkout demo | Shop NeumoPractice",
  description: "Checkout local de demostración para simular pedidos en Shop NeumoPractice.",
};

export default function CheckoutPage() {
  return (
    <ShopLayout>
      <CheckoutClient />
    </ShopLayout>
  );
}
