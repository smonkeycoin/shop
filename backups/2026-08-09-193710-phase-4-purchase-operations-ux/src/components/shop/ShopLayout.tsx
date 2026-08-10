import type { ReactNode } from "react";
import { Footer } from "./Footer";
import { Header } from "./Header";

export function ShopLayout({ children }: { children: ReactNode }) {
  return (
    <main className="shop-page">
      <Header />
      {children}
      <Footer />
    </main>
  );
}
