import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/shop/ProductDetail";
import { ShopLayout } from "@/components/shop/ShopLayout";
import { getProductBySlug } from "@/data/catalog";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    return {};
  }

  return {
    title: product.seoTitle ?? `${product.name} | Shop NeumoPractice`,
    description: product.seoDescription ?? product.shortDescription,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <ShopLayout>
      <ProductDetail product={product} />
    </ShopLayout>
  );
}
