import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BundleDetail } from "@/components/shop/BundleDetail";
import { ShopLayout } from "@/components/shop/ShopLayout";
import { getBundleBySlug } from "@/data/catalog";

type BundlePageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: BundlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const bundle = getBundleBySlug(slug);

  if (!bundle) {
    return { title: "Kit no encontrado | Shop NeumoPractice" };
  }

  return {
    title: `${bundle.name} | Shop NeumoPractice`,
    description: bundle.shortDescription,
  };
}

export default async function BundlePage({ params }: BundlePageProps) {
  const { slug } = await params;
  const bundle = getBundleBySlug(slug);

  if (!bundle) {
    notFound();
  }

  return (
    <ShopLayout>
      <BundleDetail bundle={bundle} />
    </ShopLayout>
  );
}
