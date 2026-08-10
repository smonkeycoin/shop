"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Header } from "./Header";
import { Footer } from "./Footer";

type PlaceholderPageProps = {
  title: string;
  description: string;
};

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <main className="placeholder-page">
      <Header cartCount={0} query="" onQueryChange={() => undefined} onSearch={(event) => event.preventDefault()} />
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
      <Footer />
    </main>
  );
}
