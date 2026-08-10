import type { LucideIcon } from "lucide-react";
import {
  Activity,
  Droplets,
  Gauge,
  Grid2X2,
  Package,
  Shield,
  Wind,
} from "lucide-react";

export type StockStatus = "in-stock" | "low-stock" | "coming-soon";

export type ProductVariant = {
  id: string;
  name: string;
  sku: string;
  price?: number;
  image?: string;
  attributes: Record<string, string>;
  available: boolean;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  description: string;
  shortDescription: string;
  brand: string;
  brandSlug: string;
  category: string;
  categorySlug: string;
  subcategory?: string;
  images: string[];
  price: number;
  compareAtPrice?: number;
  currency: "MXN";
  featured: boolean;
  isNew?: boolean;
  isBestSeller?: boolean;
  stockStatus: StockStatus;
  sku: string;
  variants: ProductVariant[];
  compatibleWith: string[];
  features: string[];
  includes: string[];
  usageNotes?: string;
  ageGroup?: "Pediátrico" | "Adulto" | "Familiar" | "General";
  seoTitle?: string;
  seoDescription?: string;
  priceIsPlaceholder: true;
  useTags: string[];
};

export type Category = {
  id: string;
  name: string;
  shortName: string;
  slug: string;
  description: string;
  image: string;
  icon: LucideIcon;
  featured: boolean;
};

export type Brand = {
  id: string;
  name: string;
  slug: string;
  description: string;
  featured: boolean;
};

export type Bundle = {
  id: string;
  slug: string;
  name: string;
  description: string;
  productIds: string[];
  price: number;
  priceIsPlaceholder: true;
  featured: boolean;
};

export const categories: Category[] = [
  {
    id: "aerocamaras",
    name: "Aerocámaras y espaciadores",
    shortName: "Aerocámaras",
    slug: "aerocamaras",
    description:
      "Cámaras espaciadoras, mascarillas compatibles, boquillas y repuestos para el uso cotidiano de inhaladores.",
    image: "/mockup-assets/cat-aerochamber.png",
    icon: Shield,
    featured: true,
  },
  {
    id: "nebulizacion",
    name: "Nebulización",
    shortName: "Nebulización",
    slug: "nebulizacion",
    description:
      "Nebulizadores, kits, mascarillas, mangueras, boquillas y accesorios para terapia en casa o clínica.",
    image: "/mockup-assets/cat-nebulizador.png",
    icon: Activity,
    featured: true,
  },
  {
    id: "higiene-nasal",
    name: "Higiene nasal",
    shortName: "Higiene nasal",
    slug: "higiene-nasal",
    description:
      "Sprays, soluciones salinas, irrigación nasal y accesorios para rutinas de cuidado nasal.",
    image: "/mockup-assets/cat-higiene-nasal.png",
    icon: Droplets,
    featured: true,
  },
  {
    id: "monitoreo",
    name: "Monitoreo respiratorio",
    shortName: "Monitoreo",
    slug: "monitoreo",
    description:
      "Flujómetros, oxímetros y accesorios para seguimiento respiratorio sin lenguaje complicado.",
    image: "/mockup-assets/cat-flujometro.png",
    icon: Gauge,
    featured: true,
  },
  {
    id: "terapia-respiratoria",
    name: "Terapia respiratoria",
    shortName: "Terapia respiratoria",
    slug: "terapia-respiratoria",
    description:
      "Categoría preparada para PEP, ejercitadores, inspirómetros y dispositivos relacionados.",
    image: "/mockup-assets/cat-inhalador.png",
    icon: Wind,
    featured: true,
  },
  {
    id: "accesorios",
    name: "Accesorios y repuestos",
    shortName: "Accesorios",
    slug: "accesorios",
    description:
      "Mascarillas, válvulas, boquillas, filtros, mangueras, estuches y piezas compatibles.",
    image: "/mockup-assets/cat-mascarilla.png",
    icon: Package,
    featured: true,
  },
];

export const brands: Brand[] = [
  {
    id: "vortex",
    name: "VORTEX",
    slug: "vortex",
    description: "Catálogo preliminar de cámaras espaciadoras y accesorios respiratorios.",
    featured: true,
  },
  {
    id: "aerochamber",
    name: "AeroChamber",
    slug: "aerochamber",
    description: "Productos de apoyo para administración inhalada en catálogo de demostración.",
    featured: true,
  },
  {
    id: "neilmed",
    name: "NeilMed",
    slug: "neilmed",
    description: "Soluciones de higiene nasal listadas como catálogo preliminar.",
    featured: true,
  },
  {
    id: "sterimar",
    name: "Stérimar",
    slug: "sterimar",
    description: "Productos de higiene nasal en validación comercial.",
    featured: true,
  },
  {
    id: "philips-respironics",
    name: "Philips Respironics",
    slug: "philips-respironics",
    description: "Marca respiratoria incluida como referencia preliminar de catálogo.",
    featured: true,
  },
  {
    id: "pari",
    name: "PARI",
    slug: "pari",
    description: "Marca contemplada para nebulización y terapia respiratoria en fases posteriores.",
    featured: false,
  },
  {
    id: "flow-meter",
    name: "Flow-Meter",
    slug: "flow-meter",
    description: "Medición y monitoreo respiratorio con datos demostrativos.",
    featured: true,
  },
  {
    id: "neumopractice",
    name: "NeumoPractice",
    slug: "neumopractice",
    description: "Accesorios seleccionados y kits conceptuales para la tienda.",
    featured: false,
  },
];

const vortexVariants: ProductVariant[] = [
  {
    id: "vortex-ejemplo-pediatrica-0-2",
    name: "Ejemplo pediátrica 0-2 años",
    sku: "NP-VTX-DEMO-PED-02",
    attributes: { edad: "0-2 años", tipo: "Mascarilla" },
    available: true,
  },
  {
    id: "vortex-ejemplo-pediatrica-2-4",
    name: "Ejemplo pediátrica 2-4 años",
    sku: "NP-VTX-DEMO-PED-24",
    attributes: { edad: "2-4 años", tipo: "Mascarilla" },
    available: true,
  },
  {
    id: "vortex-ejemplo-boquilla",
    name: "Ejemplo con boquilla",
    sku: "NP-VTX-DEMO-BOQ",
    attributes: { uso: "Boquilla", tipo: "Cámara" },
    available: true,
  },
  {
    id: "vortex-ejemplo-adulto",
    name: "Ejemplo adulto",
    sku: "NP-VTX-DEMO-ADT",
    attributes: { edad: "Adulto", tipo: "Cámara" },
    available: true,
  },
];

const aeroVariants: ProductVariant[] = [
  {
    id: "aerochamber-ejemplo-pediatrica",
    name: "Ejemplo pediátrica",
    sku: "NP-AER-DEMO-PED",
    attributes: { edad: "Pediátrico" },
    available: true,
  },
  {
    id: "aerochamber-ejemplo-adulto",
    name: "Ejemplo adulto",
    sku: "NP-AER-DEMO-ADT",
    attributes: { edad: "Adulto" },
    available: true,
  },
  {
    id: "aerochamber-ejemplo-boquilla",
    name: "Ejemplo boquilla",
    sku: "NP-AER-DEMO-BOQ",
    attributes: { uso: "Boquilla" },
    available: true,
  },
];

const defaultVariant = (id: string, sku: string): ProductVariant[] => [
  {
    id: `${id}-opcion-unica`,
    name: "Opción única",
    sku,
    attributes: { presentación: "Demo" },
    available: true,
  },
];

export const products: Product[] = [
  {
    id: "vortex-camara-espaciadora",
    slug: "vortex-camara-espaciadora",
    name: "VORTEX Cámara Espaciadora",
    shortName: "VORTEX Cámara",
    description:
      "Cámara espaciadora para apoyar la administración de medicamentos inhalados mediante inhalador presurizado. Las variantes son ejemplos para preparar el flujo comercial.",
    shortDescription: "Cámara espaciadora para uso con inhalador presurizado.",
    brand: "VORTEX",
    brandSlug: "vortex",
    category: "Aerocámaras y espaciadores",
    categorySlug: "aerocamaras",
    subcategory: "Cámaras",
    images: ["/mockup-assets/product-vortex.png"],
    price: 1250,
    currency: "MXN",
    featured: true,
    isBestSeller: true,
    stockStatus: "in-stock",
    sku: "NP-VTX-DEMO",
    variants: vortexVariants,
    compatibleWith: ["mascarilla-repuesto-aerocamara", "boquilla-camara-espaciadora", "estuche-aerocamara"],
    features: ["Diseño compacto", "Opciones de uso pediátrico y adulto", "Compatible con rutinas de inhalador"],
    includes: ["Cámara espaciadora", "Empaque de demostración"],
    usageNotes: "Usar conforme a indicación de un profesional de la salud.",
    ageGroup: "Familiar",
    seoTitle: "VORTEX Cámara Espaciadora | Shop NeumoPractice",
    seoDescription: "Cámara espaciadora VORTEX en catálogo de demostración para terapia respiratoria.",
    priceIsPlaceholder: true,
    useTags: ["Pediátrico", "Adulto", "Uso domiciliario"],
  },
  {
    id: "aerochamber-plus-flow-vu",
    slug: "aerochamber-plus-flow-vu",
    name: "AeroChamber Plus Flow-Vu",
    shortName: "AeroChamber Plus Flow-Vu",
    description:
      "Aerocámara de catálogo preliminar para facilitar el uso de inhaladores presurizados con opciones de variante demostrativas.",
    shortDescription: "Aerocámara para apoyo en administración inhalada.",
    brand: "AeroChamber",
    brandSlug: "aerochamber",
    category: "Aerocámaras y espaciadores",
    categorySlug: "aerocamaras",
    subcategory: "Cámaras",
    images: ["/mockup-assets/product-aerochamber.png"],
    price: 1150,
    compareAtPrice: 1290,
    currency: "MXN",
    featured: true,
    stockStatus: "in-stock",
    sku: "NP-AER-DEMO",
    variants: aeroVariants,
    compatibleWith: ["mascarilla-repuesto-aerocamara", "estuche-aerocamara"],
    features: ["Formato familiar", "Opciones de mascarilla o boquilla", "Catálogo preliminar"],
    includes: ["Aerocámara", "Empaque de demostración"],
    usageNotes: "Consultar técnica de uso con el profesional tratante.",
    ageGroup: "Familiar",
    priceIsPlaceholder: true,
    useTags: ["Pediátrico", "Adulto", "Uso domiciliario"],
  },
  {
    id: "flujometro-peak-flow",
    slug: "flujometro-peak-flow",
    name: "Flujómetro Peak Flow",
    shortName: "Flujómetro",
    description:
      "Dispositivo de monitoreo respiratorio para seguimiento de flujo espiratorio máximo en contextos indicados por profesionales.",
    shortDescription: "Medición de flujo espiratorio máximo 0-800 L/min.",
    brand: "Flow-Meter",
    brandSlug: "flow-meter",
    category: "Monitoreo respiratorio",
    categorySlug: "monitoreo",
    subcategory: "Flujómetros",
    images: ["/mockup-assets/product-flujometro.png"],
    price: 850,
    currency: "MXN",
    featured: true,
    stockStatus: "in-stock",
    sku: "NP-FLW-DEMO",
    variants: defaultVariant("flujometro-peak-flow", "NP-FLW-DEMO-UNI"),
    compatibleWith: [],
    features: ["Rango visual 0-800 L/min", "Uso de monitoreo", "Producto de demostración"],
    includes: ["Flujómetro", "Guía básica de demostración"],
    ageGroup: "General",
    priceIsPlaceholder: true,
    useTags: ["Adulto", "Uso domiciliario"],
  },
  {
    id: "chupon-para-nebulizador",
    slug: "chupon-para-nebulizador",
    name: "Chupón para nebulizador",
    shortName: "Chupón nebulizador",
    description:
      "Accesorio pediátrico conceptual para nebulización. Validar compatibilidad y disponibilidad antes de comercializar.",
    shortDescription: "Accesorio pediátrico para rutinas de nebulización.",
    brand: "NeumoPractice",
    brandSlug: "neumopractice",
    category: "Nebulización",
    categorySlug: "nebulizacion",
    subcategory: "Accesorios",
    images: ["/mockup-assets/product-chupon.png"],
    price: 120,
    currency: "MXN",
    featured: true,
    stockStatus: "in-stock",
    sku: "NP-CHP-DEMO",
    variants: defaultVariant("chupon-para-nebulizador", "NP-CHP-DEMO-UNI"),
    compatibleWith: ["kit-nebulizacion-pediatrico"],
    features: ["Diseño pediátrico", "Accesorio de nebulización", "Catálogo de demostración"],
    includes: ["Chupón nebulizador"],
    ageGroup: "Pediátrico",
    priceIsPlaceholder: true,
    useTags: ["Pediátrico", "Accesorios"],
  },
  {
    id: "neilmed-pedia-mist",
    slug: "neilmed-pedia-mist",
    name: "NeilMed Pedia Mist",
    shortName: "NeilMed Pedia Mist",
    description:
      "Producto de higiene nasal listado para preparar la experiencia de compra. Validar presentación y disponibilidad final.",
    shortDescription: "Higiene nasal pediátrica en catálogo preliminar.",
    brand: "NeilMed",
    brandSlug: "neilmed",
    category: "Higiene nasal",
    categorySlug: "higiene-nasal",
    subcategory: "Sprays",
    images: ["/mockup-assets/product-neilmed.png"],
    price: 320,
    currency: "MXN",
    featured: true,
    isNew: true,
    stockStatus: "in-stock",
    sku: "NP-NLM-DEMO",
    variants: defaultVariant("neilmed-pedia-mist", "NP-NLM-DEMO-UNI"),
    compatibleWith: ["solucion-salina-nasal"],
    features: ["Rutina de higiene nasal", "Presentación pediátrica", "Catálogo preliminar"],
    includes: ["Producto nasal de demostración"],
    ageGroup: "Pediátrico",
    priceIsPlaceholder: true,
    useTags: ["Pediátrico", "Uso domiciliario"],
  },
  {
    id: "sterimar-higiene-nasal",
    slug: "sterimar-higiene-nasal",
    name: "Stérimar Higiene Nasal",
    shortName: "Stérimar Higiene Nasal",
    description:
      "Spray de higiene nasal en catálogo preliminar para estructurar el flujo comercial de Shop NeumoPractice.",
    shortDescription: "Spray de higiene nasal en catálogo preliminar.",
    brand: "Stérimar",
    brandSlug: "sterimar",
    category: "Higiene nasal",
    categorySlug: "higiene-nasal",
    subcategory: "Sprays",
    images: ["/mockup-assets/product-esterimar.png"],
    price: 280,
    currency: "MXN",
    featured: true,
    stockStatus: "in-stock",
    sku: "NP-STR-DEMO",
    variants: defaultVariant("sterimar-higiene-nasal", "NP-STR-DEMO-UNI"),
    compatibleWith: ["solucion-salina-nasal"],
    features: ["Higiene nasal", "Presentación de demostración", "Uso cotidiano"],
    includes: ["Spray nasal de demostración"],
    ageGroup: "General",
    priceIsPlaceholder: true,
    useTags: ["Uso domiciliario"],
  },
  {
    id: "mascarilla-pediatrica-nebulizacion",
    slug: "mascarilla-pediatrica-nebulizacion",
    name: "Mascarilla pediátrica para nebulización",
    shortName: "Mascarilla pediátrica",
    description: "Mascarilla pediátrica de demostración para kits y equipos de nebulización compatibles.",
    shortDescription: "Mascarilla pediátrica para nebulización.",
    brand: "NeumoPractice",
    brandSlug: "neumopractice",
    category: "Nebulización",
    categorySlug: "nebulizacion",
    subcategory: "Mascarillas",
    images: ["/mockup-assets/cat-mascarilla.png"],
    price: 180,
    currency: "MXN",
    featured: false,
    stockStatus: "in-stock",
    sku: "NP-MSK-PED-DEMO",
    variants: defaultVariant("mascarilla-pediatrica-nebulizacion", "NP-MSK-PED-DEMO-UNI"),
    compatibleWith: ["kit-nebulizacion-pediatrico", "nebulizador-mesh-portatil"],
    features: ["Tamaño pediátrico", "Accesorio compatible", "Material por validar"],
    includes: ["Mascarilla pediátrica"],
    ageGroup: "Pediátrico",
    priceIsPlaceholder: true,
    useTags: ["Pediátrico", "Accesorios"],
  },
  {
    id: "kit-nebulizacion-pediatrico",
    slug: "kit-nebulizacion-pediatrico",
    name: "Kit de nebulización pediátrico",
    shortName: "Kit nebulización",
    description: "Kit conceptual con piezas para nebulización pediátrica. Preparado para inventario futuro.",
    shortDescription: "Kit pediátrico con accesorios para nebulización.",
    brand: "NeumoPractice",
    brandSlug: "neumopractice",
    category: "Nebulización",
    categorySlug: "nebulizacion",
    subcategory: "Kits",
    images: ["/mockup-assets/cat-nebulizador.png"],
    price: 420,
    currency: "MXN",
    featured: false,
    isNew: true,
    stockStatus: "coming-soon",
    sku: "NP-KIT-NEB-DEMO",
    variants: defaultVariant("kit-nebulizacion-pediatrico", "NP-KIT-NEB-DEMO-UNI"),
    compatibleWith: ["chupon-para-nebulizador", "mascarilla-pediatrica-nebulizacion"],
    features: ["Kit conceptual", "Piezas pediátricas", "Pendiente de validación comercial"],
    includes: ["Mascarilla", "Boquilla", "Manguera de demostración"],
    ageGroup: "Pediátrico",
    priceIsPlaceholder: true,
    useTags: ["Pediátrico", "Accesorios"],
  },
  {
    id: "nebulizador-mesh-portatil",
    slug: "nebulizador-mesh-portatil",
    name: "Nebulizador mesh portátil",
    shortName: "Nebulizador mesh",
    description: "Equipo de nebulización portátil incluido como producto demo para navegación de catálogo.",
    shortDescription: "Nebulizador portátil en catálogo demostrativo.",
    brand: "PARI",
    brandSlug: "pari",
    category: "Nebulización",
    categorySlug: "nebulizacion",
    subcategory: "Equipos",
    images: ["/mockup-assets/cat-nebulizador.png"],
    price: 1850,
    currency: "MXN",
    featured: false,
    stockStatus: "coming-soon",
    sku: "NP-MESH-DEMO",
    variants: defaultVariant("nebulizador-mesh-portatil", "NP-MESH-DEMO-UNI"),
    compatibleWith: ["mascarilla-pediatrica-nebulizacion", "kit-nebulizacion-pediatrico"],
    features: ["Formato portátil", "Catálogo conceptual", "Compatible con accesorios por validar"],
    includes: ["Nebulizador demo", "Cable o piezas por confirmar"],
    ageGroup: "General",
    priceIsPlaceholder: true,
    useTags: ["Adulto", "Uso domiciliario"],
  },
  {
    id: "oximetro-pediatrico",
    slug: "oximetro-pediatrico",
    name: "Oxímetro pediátrico",
    shortName: "Oxímetro pediátrico",
    description: "Oxímetro pediátrico conceptual para preparar monitoreo respiratorio dentro del catálogo.",
    shortDescription: "Monitoreo pediátrico en catálogo preliminar.",
    brand: "Philips Respironics",
    brandSlug: "philips-respironics",
    category: "Monitoreo respiratorio",
    categorySlug: "monitoreo",
    subcategory: "Oxímetros",
    images: ["/mockup-assets/cat-flujometro.png"],
    price: 980,
    currency: "MXN",
    featured: false,
    stockStatus: "coming-soon",
    sku: "NP-OXI-PED-DEMO",
    variants: defaultVariant("oximetro-pediatrico", "NP-OXI-PED-DEMO-UNI"),
    compatibleWith: [],
    features: ["Producto conceptual", "Monitoreo puntual", "Pendiente de catálogo real"],
    includes: ["Oxímetro de demostración"],
    ageGroup: "Pediátrico",
    priceIsPlaceholder: true,
    useTags: ["Pediátrico", "Uso domiciliario"],
  },
  {
    id: "boquilla-camara-espaciadora",
    slug: "boquilla-camara-espaciadora",
    name: "Boquilla para cámara espaciadora",
    shortName: "Boquilla aerocámara",
    description: "Boquilla de repuesto conceptual para cámaras espaciadoras compatibles.",
    shortDescription: "Boquilla de repuesto para aerocámara.",
    brand: "NeumoPractice",
    brandSlug: "neumopractice",
    category: "Accesorios y repuestos",
    categorySlug: "accesorios",
    subcategory: "Boquillas",
    images: ["/mockup-assets/product-chupon.png"],
    price: 95,
    currency: "MXN",
    featured: false,
    stockStatus: "in-stock",
    sku: "NP-BOQ-DEMO",
    variants: defaultVariant("boquilla-camara-espaciadora", "NP-BOQ-DEMO-UNI"),
    compatibleWith: ["vortex-camara-espaciadora", "aerochamber-plus-flow-vu"],
    features: ["Repuesto conceptual", "Compatibilidad por validar", "Fácil reemplazo"],
    includes: ["Boquilla de demostración"],
    ageGroup: "General",
    priceIsPlaceholder: true,
    useTags: ["Accesorios"],
  },
  {
    id: "mascarilla-repuesto-aerocamara",
    slug: "mascarilla-repuesto-aerocamara",
    name: "Mascarilla de repuesto para aerocámara",
    shortName: "Mascarilla repuesto",
    description: "Mascarilla de repuesto para cámara espaciadora. Compatibilidad pendiente de validación comercial.",
    shortDescription: "Repuesto para aerocámara compatible.",
    brand: "NeumoPractice",
    brandSlug: "neumopractice",
    category: "Accesorios y repuestos",
    categorySlug: "accesorios",
    subcategory: "Mascarillas",
    images: ["/mockup-assets/cat-mascarilla.png"],
    price: 260,
    currency: "MXN",
    featured: false,
    stockStatus: "in-stock",
    sku: "NP-MSK-AER-DEMO",
    variants: [
      {
        id: "mascarilla-repuesto-ejemplo-ped",
        name: "Ejemplo pediátrica",
        sku: "NP-MSK-AER-DEMO-PED",
        attributes: { tamaño: "Pediátrico" },
        available: true,
      },
      {
        id: "mascarilla-repuesto-ejemplo-adulto",
        name: "Ejemplo adulto",
        sku: "NP-MSK-AER-DEMO-ADT",
        attributes: { tamaño: "Adulto" },
        available: true,
      },
    ],
    compatibleWith: ["vortex-camara-espaciadora", "aerochamber-plus-flow-vu"],
    features: ["Repuesto", "Opciones por tamaño", "Compatibilidad por validar"],
    includes: ["Mascarilla de repuesto"],
    ageGroup: "Familiar",
    priceIsPlaceholder: true,
    useTags: ["Pediátrico", "Adulto", "Accesorios"],
  },
  {
    id: "estuche-aerocamara",
    slug: "estuche-aerocamara",
    name: "Estuche para aerocámara",
    shortName: "Estuche aerocámara",
    description: "Estuche conceptual para transporte y cuidado de cámaras espaciadoras.",
    shortDescription: "Estuche para guardar cámara espaciadora.",
    brand: "NeumoPractice",
    brandSlug: "neumopractice",
    category: "Accesorios y repuestos",
    categorySlug: "accesorios",
    subcategory: "Estuches",
    images: ["/mockup-assets/product-aerochamber.png"],
    price: 190,
    currency: "MXN",
    featured: false,
    stockStatus: "coming-soon",
    sku: "NP-EST-AER-DEMO",
    variants: defaultVariant("estuche-aerocamara", "NP-EST-AER-DEMO-UNI"),
    compatibleWith: ["vortex-camara-espaciadora", "aerochamber-plus-flow-vu"],
    features: ["Protección cotidiana", "Formato conceptual", "Compatible por validar"],
    includes: ["Estuche de demostración"],
    ageGroup: "General",
    priceIsPlaceholder: true,
    useTags: ["Accesorios", "Uso domiciliario"],
  },
  {
    id: "solucion-salina-nasal",
    slug: "solucion-salina-nasal",
    name: "Solución salina nasal",
    shortName: "Solución salina",
    description: "Solución salina nasal de demostración para categoría de higiene nasal.",
    shortDescription: "Solución salina para rutina de higiene nasal.",
    brand: "NeilMed",
    brandSlug: "neilmed",
    category: "Higiene nasal",
    categorySlug: "higiene-nasal",
    subcategory: "Soluciones",
    images: ["/mockup-assets/cat-higiene-nasal.png"],
    price: 160,
    currency: "MXN",
    featured: false,
    stockStatus: "in-stock",
    sku: "NP-SAL-DEMO",
    variants: defaultVariant("solucion-salina-nasal", "NP-SAL-DEMO-UNI"),
    compatibleWith: ["neilmed-pedia-mist", "sterimar-higiene-nasal"],
    features: ["Higiene nasal", "Catálogo de demostración", "Uso cotidiano"],
    includes: ["Solución salina demo"],
    ageGroup: "General",
    priceIsPlaceholder: true,
    useTags: ["Uso domiciliario"],
  },
  {
    id: "ejercitador-respiratorio-pep",
    slug: "ejercitador-respiratorio-pep",
    name: "Ejercitador respiratorio / PEP conceptual",
    shortName: "Ejercitador PEP",
    description:
      "Producto conceptual para preparar la categoría de terapia respiratoria. No implica disponibilidad real todavía.",
    shortDescription: "Dispositivo conceptual para terapia respiratoria.",
    brand: "NeumoPractice",
    brandSlug: "neumopractice",
    category: "Terapia respiratoria",
    categorySlug: "terapia-respiratoria",
    subcategory: "PEP",
    images: ["/mockup-assets/cat-inhalador.png"],
    price: 1450,
    currency: "MXN",
    featured: false,
    stockStatus: "coming-soon",
    sku: "NP-PEP-DEMO",
    variants: defaultVariant("ejercitador-respiratorio-pep", "NP-PEP-DEMO-UNI"),
    compatibleWith: [],
    features: ["Producto conceptual", "Categoría preparada", "Disponibilidad por validar"],
    includes: ["Dispositivo demo"],
    ageGroup: "Adulto",
    priceIsPlaceholder: true,
    useTags: ["Adulto", "Uso domiciliario"],
  },
];

export const bundles: Bundle[] = [
  {
    id: "kit-primer-inhalador",
    slug: "kit-primer-inhalador",
    name: "Kit primer inhalador",
    description: "Bundle conceptual preparado para fases comerciales posteriores.",
    productIds: ["vortex-camara-espaciadora", "estuche-aerocamara", "boquilla-camara-espaciadora"],
    price: 1490,
    priceIsPlaceholder: true,
    featured: false,
  },
  {
    id: "kit-higiene-nasal",
    slug: "kit-higiene-nasal",
    name: "Kit higiene nasal",
    description: "Bundle conceptual para rutinas de higiene nasal.",
    productIds: ["neilmed-pedia-mist", "sterimar-higiene-nasal", "solucion-salina-nasal"],
    price: 690,
    priceIsPlaceholder: true,
    featured: false,
  },
];

export const allCategoryOption: Category = {
  id: "todas",
  name: "Ver todas las categorías",
  shortName: "Todas",
  slug: "todas",
  description: "Explora todo el catálogo respiratorio preliminar.",
  image: "/placeholders/categoria-todas.png",
  icon: Grid2X2,
  featured: true,
};

export const featuredProducts = products.filter((product) => product.featured).slice(0, 6);

export function formatPrice(price: number, currency: Product["currency"] = "MXN") {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency,
  }).format(price);
}

export function getProductBySlug(slug: string) {
  return products.find((product) => product.slug === slug);
}

export function getCategoryBySlug(slug: string) {
  return categories.find((category) => category.slug === slug);
}

export function getBrandBySlug(slug: string) {
  return brands.find((brand) => brand.slug === slug);
}

export function getProductsByCategory(slug: string) {
  return products.filter((product) => product.categorySlug === slug);
}

export function getProductsByBrand(slug: string) {
  return products.filter((product) => product.brandSlug === slug);
}

export function getRelatedProducts(product: Product, limit = 4) {
  const compatible = products.filter((item) => product.compatibleWith.includes(item.id));
  const sameCategory = products.filter(
    (item) => item.categorySlug === product.categorySlug && item.id !== product.id,
  );

  return [...compatible, ...sameCategory]
    .filter((item, index, array) => array.findIndex((candidate) => candidate.id === item.id) === index)
    .slice(0, limit);
}

export function searchProducts(query: string) {
  const cleanQuery = query.trim().toLowerCase();

  if (!cleanQuery) {
    return products;
  }

  return products.filter((product) =>
    [
      product.name,
      product.shortName,
      product.shortDescription,
      product.brand,
      product.category,
      product.subcategory,
      product.ageGroup,
      ...product.useTags,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(cleanQuery),
  );
}
