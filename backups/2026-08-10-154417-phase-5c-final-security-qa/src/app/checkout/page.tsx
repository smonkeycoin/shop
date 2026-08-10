import type { Metadata } from "next";
import { CheckoutClient } from "@/components/shop/CheckoutClient";
import { ShopLayout } from "@/components/shop/ShopLayout";

export const metadata: Metadata = {
  title: "Checkout | Shop NeumoPractice",
  description: "Checkout demo persistente de Shop NeumoPractice.",
};

export default function CheckoutPage() {
  return (
    <ShopLayout>
      <CheckoutClient />
    </ShopLayout>
  );
}
