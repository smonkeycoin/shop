export type ProductAssetStatus = "real" | "reference" | "placeholder" | "pending";
export type ProductAssetSourceType =
  | "manufacturer"
  | "authorized-distributor"
  | "trusted-distributor"
  | "internal"
  | "placeholder";
export type ProductAssetSearchStatus = "official-found" | "official-low-resolution" | "needs-sku" | "unresolved";
export type ProductAssetQuality = "Alta" | "Media" | "Baja";

export type ProductAssetMeta = {
  productId: string;
  status: ProductAssetStatus;
  sourceType: ProductAssetSourceType;
  sourceUrl?: string;
  manufacturer?: string;
  model?: string;
  localPath?: string;
  assetPath?: string;
  sourcePath?: string;
  width?: number;
  height?: number;
  productionApproved: boolean;
  downloadedAt?: string;
  searchStatus: ProductAssetSearchStatus;
  needsCommercialIdentification?: boolean;
  assetPending?: boolean;
  notes?: string;
};

const downloadedAt = "2026-08-10T02:04:06Z";
const pendingSkuNote = "Requiere SKU/fabricante/modelo o fotografia fisica antes de publicar como producto identificado.";

export const productAssets: ProductAssetMeta[] = [
  {
    productId: "vortex-camara-espaciadora",
    status: "reference",
    sourceType: "manufacturer",
    sourceUrl: "https://www.pari.com/int/products/vortex-holding-chamber/",
    manufacturer: "PARI",
    model: "VORTEX holding chamber: child mask, mouthpiece, adult mask",
    localPath: "/products/pari/pari-vortex-child-mask-front.webp",
    assetPath: "/products/pari/pari-vortex-child-mask-front.webp",
    sourcePath: "/products/_source/pari-vortex-child-mask-source.jpg",
    width: 1652,
    height: 824,
    productionApproved: false,
    downloadedAt,
    searchStatus: "official-found",
    notes: "VORTEX tratado como linea de producto de PARI; variantes oficiales separadas en galeria.",
  },
  {
    productId: "aerochamber-plus-flow-vu",
    status: "reference",
    sourceType: "manufacturer",
    sourceUrl: "https://www.trudellmed.com/global/en/products/aerochamber-plus-flow-vu-chamber",
    manufacturer: "Trudell Medical International",
    model: "AeroChamber Plus Flow-Vu Chamber",
    localPath: "/products/aerochamber/aerochamber-plus-flowvu-front.webp",
    assetPath: "/products/aerochamber/aerochamber-plus-flowvu-front.webp",
    sourcePath: "/products/_source/trudell-aerochamber-plus-flowvu-source.webp",
    width: 622,
    height: 346,
    productionApproved: false,
    downloadedAt,
    searchStatus: "official-low-resolution",
    notes: "El sitio oficial de Trudell expone la variante product_main_xl en 622x346; no se hizo upscale.",
  },
  {
    productId: "neilmed-pedia-mist",
    status: "reference",
    sourceType: "manufacturer",
    sourceUrl: "https://shop.neilmed.com/products/pediamist",
    manufacturer: "NeilMed",
    model: "PediaMist / NasaMist Pediatric Saline Spray, SKU PNM-4NB-48-ENU-USL",
    localPath: "/products/neilmed/neilmed-pediamist-front.webp",
    assetPath: "/products/neilmed/neilmed-pediamist-front.webp",
    sourcePath: "/products/_source/neilmed-pediamist-source.jpg",
    width: 1000,
    height: 1000,
    productionApproved: false,
    downloadedAt,
    searchStatus: "official-found",
  },
  {
    productId: "sterimar-higiene-nasal",
    status: "reference",
    sourceType: "manufacturer",
    sourceUrl: "https://www.sterimar.com/en/our-products/breathe-easy-daily/",
    manufacturer: "Sterimar",
    model: "Breathe Easy Daily 50ml",
    localPath: "/products/sterimar/sterimar-breathe-easy-daily-front.webp",
    assetPath: "/products/sterimar/sterimar-breathe-easy-daily-front.webp",
    sourcePath: "/products/_source/sterimar-breathe-easy-daily-source.png",
    width: 750,
    height: 750,
    productionApproved: false,
    downloadedAt,
    searchStatus: "official-found",
  },
  ...[
    "flujometro-peak-flow",
    "chupon-para-nebulizador",
    "mascarilla-pediatrica-nebulizacion",
    "kit-nebulizacion-pediatrico",
    "nebulizador-mesh-portatil",
    "oximetro-pediatrico",
    "boquilla-camara-espaciadora",
    "mascarilla-repuesto-aerocamara",
    "estuche-aerocamara",
    "solucion-salina-nasal",
    "ejercitador-respiratorio-pep",
    "filtro-repuesto-nebulizador",
    "manguera-nebulizador-standard",
    "irrigador-nasal-adulto",
    "boquilla-peak-flow-repuesto",
    "valvula-repuesto-aerocamara",
    "inspirometro-incentivo-conceptual",
    "mascarilla-adulto-nebulizacion",
  ].map(
    (productId): ProductAssetMeta => ({
      productId,
      status: "pending",
      sourceType: "placeholder",
      productionApproved: false,
      searchStatus: "needs-sku",
      needsCommercialIdentification: true,
      assetPending: true,
      notes: pendingSkuNote,
    }),
  ),
];

export function getProductAsset(productId: string) {
  return productAssets.find((asset) => asset.productId === productId);
}

export function getProductAssetPath(productId: string) {
  const asset = getProductAsset(productId);
  return asset?.assetPath ?? asset?.localPath;
}

export function getAssetStatusLabel(status: ProductAssetStatus) {
  const labels: Record<ProductAssetStatus, string> = {
    real: "Final",
    reference: "Referencia",
    placeholder: "Placeholder",
    pending: "Pendiente SKU",
  };

  return labels[status];
}

export function getAssetQuality(asset?: ProductAssetMeta): ProductAssetQuality {
  if (!asset || !asset.width || !asset.height || asset.status === "pending" || asset.status === "placeholder") {
    return "Baja";
  }

  const longestSide = Math.max(asset.width, asset.height);
  if (asset.sourceType === "manufacturer" && longestSide >= 1000) return "Alta";
  if (asset.sourceType === "manufacturer" && longestSide >= 650) return "Media";
  return "Baja";
}

export function getAssetWarnings(asset?: ProductAssetMeta) {
  const warnings: string[] = [];

  if (!asset) {
    return ["PLACEHOLDER"];
  }

  if (asset.status === "placeholder") warnings.push("PLACEHOLDER");
  if (asset.status === "pending") warnings.push("NEEDS SKU");
  if (asset.needsCommercialIdentification) warnings.push("COMMERCIAL ID");
  if (!asset.productionApproved) warnings.push("UNAPPROVED SOURCE");
  if (getAssetQuality(asset) === "Baja" && asset.status !== "pending") warnings.push("LOW RESOLUTION");

  return warnings;
}
