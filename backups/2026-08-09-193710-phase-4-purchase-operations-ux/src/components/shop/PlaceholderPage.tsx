"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ShopLayout } from "./ShopLayout";

type PlaceholderPageProps = {
  title: string;
  description: string;
};

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <ShopLayout>
      <section className="section-shell placeholder-content">
        <div className="placeholder-card">
          <h1>{title}</h1>
          <p>{description}</p>
          <Link className="button-primary" href="/">
            <ArrowLeft size={18} aria-hidden="true" />
            Volver al inicio
          </Link>
        </div>
      </section>
    </ShopLayout>
  );
}
