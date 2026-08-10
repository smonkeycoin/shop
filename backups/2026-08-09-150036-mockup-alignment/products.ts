export type Product = {
  id: string;
  slug: string;
  name: string;
  subtitle?: string;
  category: string;
  brand: string;
  price: number;
  currency: "MXN";
  image: string;
  featured: boolean;
  placeholderPrice: boolean;
  visual: "device" | "meter" | "round" | "bottle";
};

// Placeholder prices: replace with validated commercial prices before checkout or launch.
export const featuredProducts: Product[] = [
  {
    id: "vortex-camara-espaciadora",
    slug: "vortex-camara-espaciadora",
    name: "Vortex Cámara espaciadora",
    category: "Aerocámaras",
    brand: "VORTEX",
    price: 1250,
    currency: "MXN",
    image: "/placeholders/vortex-camara-espaciadora.png",
    featured: true,
    placeholderPrice: true,
    visual: "device",
  },
  {
    id: "aerochamber-plus-flow-vu",
    slug: "aerochamber-plus-flow-vu",
    name: "AeroChamber Plus Flow-Vu",
    category: "Aerocámaras",
    brand: "AeroChamber",
    price: 1150,
    currency: "MXN",
    image: "/placeholders/aerochamber-plus-flow-vu.png",
    featured: true,
    placeholderPrice: true,
    visual: "device",
  },
  {
    id: "flujometro",
    slug: "flujometro",
    name: "Flujómetro",
    subtitle: "0-800 L/min",
    category: "Monitoreo respiratorio",
    brand: "Flow-Meter",
    price: 850,
    currency: "MXN",
    image: "/placeholders/flujometro.png",
    featured: true,
    placeholderPrice: true,
    visual: "meter",
  },
  {
    id: "chupon-para-nebulizador",
    slug: "chupon-para-nebulizador",
    name: "Chupón para nebulizador",
    category: "Nebulizadores",
    brand: "NeumoPractice",
    price: 120,
    currency: "MXN",
    image: "/placeholders/chupon-nebulizador.png",
    featured: true,
    placeholderPrice: true,
    visual: "round",
  },
  {
    id: "neilmed-pedia-mist",
    slug: "neilmed-pedia-mist",
    name: "NeilMed Pedia Mist",
    category: "Higiene nasal",
    brand: "NeilMed",
    price: 320,
    currency: "MXN",
    image: "/placeholders/neilmed-pedia-mist.png",
    featured: true,
    placeholderPrice: true,
    visual: "bottle",
  },
  {
    id: "esterimar-higiene-nasal",
    slug: "esterimar-higiene-nasal",
    name: "Esterimar Higiene Nasal",
    category: "Higiene nasal",
    brand: "STÉRIMAR",
    price: 280,
    currency: "MXN",
    image: "/placeholders/esterimar-higiene-nasal.png",
    featured: true,
    placeholderPrice: true,
    visual: "bottle",
  },
];
