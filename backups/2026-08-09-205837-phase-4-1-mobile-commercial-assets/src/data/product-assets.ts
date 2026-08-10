export type ProductAssetStatus = "real" | "reference" | "placeholder" | "pending";
export type ProductAssetSourceType =
  | "manufacturer"
  | "authorized-distributor"
  | "internal"
  | "placeholder";

export type ProductAssetMeta = {
  productId: string;
  status: ProductAssetStatus;
  sourceType: ProductAssetSourceType;
  sourceUrl?: string;
  manufacturer?: string;
  localPath?: string;
  width?: number;
  height?: number;
  productionApproved: boolean;
  assetPending?: boolean;
  notes?: string;
};

const pendingSkuNote = "Pendiente confirmar SKU/fabricante/fotografia autorizada antes de mostrar producto real.";

export const productAssets: ProductAssetMeta[] = [
  {
    productId: "vortex-camara-espaciadora",
    status: "reference",
    sourceType: "manufacturer",
    sourceUrl: "https://www.pari.com/int/products/vortex-holding-chamber/",
    manufacturer: "PARI",
    localPath: "/products/vortex/vortex-spacer-baby-mask-cutout-reference.png",
    width: 1652,
    height: 824,
    productionApproved: false,
  },
  {
    productId: "aerochamber-plus-flow-vu",
    status: "reference",
    sourceType: "manufacturer",
    sourceUrl: "https://www.trudellmed.com/global/en/products/aerochamber-plus-flow-vu-chamber",
    manufacturer: "Trudell Medical International",
    localPath: "/products/aerochamber/aerochamber-flowvu-lineup-cutout-reference.png",
    width: 622,
    height: 346,
    productionApproved: false,
  },
  {
    productId: "neilmed-pedia-mist",
    status: "reference",
    sourceType: "manufacturer",
    sourceUrl: "https://shop.neilmed.com/products/pediamist",
    manufacturer: "NeilMed",
    localPath: "/products/neilmed/neilmed-pediamist-front-cutout-reference.png",
    width: 1000,
    height: 1000,
    productionApproved: false,
  },
  {
    productId: "sterimar-higiene-nasal",
    status: "reference",
    sourceType: "manufacturer",
    sourceUrl: "https://www.sterimar.com/en/our-products/breathe-easy-daily/",
    manufacturer: "Stérimar",
    localPath: "/products/sterimar/sterimar-breathe-easy-daily-front-reference.png",
    width: 750,
    height: 750,
    productionApproved: false,
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
      assetPending: true,
      notes: pendingSkuNote,
    }),
  ),
];

export function getProductAsset(productId: string) {
  return productAssets.find((asset) => asset.productId === productId);
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

export function getAssetWarnings(asset?: ProductAssetMeta) {
  const warnings: string[] = [];

  if (!asset) {
    return ["PLACEHOLDER"];
  }

  if (asset.status === "placeholder") warnings.push("PLACEHOLDER");
  if (asset.status === "pending") warnings.push("UNKNOWN SKU");
  if (!asset.productionApproved) warnings.push("UNAPPROVED SOURCE");
  if (asset.width && asset.height && Math.max(asset.width, asset.height) < 700) warnings.push("LOW RESOLUTION");

  return warnings;
}
