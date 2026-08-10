import Image from "next/image";
import { PackageSearch } from "lucide-react";

type ProductImageProps = {
  src?: string;
  alt: string;
  className?: string;
  priority?: boolean;
};

export function ProductImage({ src, alt, className, priority }: ProductImageProps) {
  if (!src) {
    return (
      <div className={`image-placeholder ${className ?? ""}`} role="img" aria-label={alt}>
        <PackageSearch size={30} aria-hidden="true" />
        <span>Imagen próximamente</span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes="(max-width: 680px) 50vw, 220px"
      priority={priority}
    />
  );
}
