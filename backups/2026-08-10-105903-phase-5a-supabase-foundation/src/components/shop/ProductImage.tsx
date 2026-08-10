import Image from "next/image";
import { PackageSearch, ScanSearch } from "lucide-react";
import type { ProductAssetStatus } from "@/data/product-assets";

type ProductImageProps = {
  src?: string;
  alt: string;
  className?: string;
  priority?: boolean;
  status?: ProductAssetStatus;
  sizes?: string;
};

export function ProductImage({
  src,
  alt,
  className,
  priority,
  sizes = "(max-width: 680px) 50vw, 220px",
  status = src ? "reference" : "pending",
}: ProductImageProps) {
  if (!src) {
    const pending = status === "pending";
    const Icon = pending ? ScanSearch : PackageSearch;

    return (
      <div className={`image-placeholder ${pending ? "pending" : ""} ${className ?? ""}`} role="img" aria-label={alt}>
        <Icon size={30} aria-hidden="true" />
        <span>{pending ? "Imagen en preparación" : "Imagen próximamente"}</span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      quality={88}
    />
  );
}
