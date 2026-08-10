import type { LucideIcon } from "lucide-react";
import {
  Activity,
  Droplets,
  Gauge,
  Grid2X2,
  HeartPulse,
  Package,
  Shield,
} from "lucide-react";

export type Category = {
  id: string;
  name: string;
  slug: string;
  image: string;
  icon: LucideIcon;
  featured: boolean;
};

export const categories: Category[] = [
  {
    id: "aerocamaras",
    name: "Aerocámaras y cámaras espaciadoras",
    slug: "aerocamaras",
    image: "/mockup-assets/cat-aerochamber.png",
    icon: Shield,
    featured: true,
  },
  {
    id: "flujometros",
    name: "Flujómetros",
    slug: "flujometros",
    image: "/mockup-assets/cat-flujometro.png",
    icon: Gauge,
    featured: true,
  },
  {
    id: "nebulizadores",
    name: "Nebulizadores y accesorios",
    slug: "nebulizadores",
    image: "/mockup-assets/cat-nebulizador.png",
    icon: Activity,
    featured: true,
  },
  {
    id: "higiene-nasal",
    name: "Higiene nasal",
    slug: "higiene-nasal",
    image: "/mockup-assets/cat-higiene-nasal.png",
    icon: Droplets,
    featured: true,
  },
  {
    id: "inhaladores",
    name: "Inhaladores y accesorios",
    slug: "inhaladores",
    image: "/mockup-assets/cat-inhalador.png",
    icon: HeartPulse,
    featured: true,
  },
  {
    id: "mascarillas",
    name: "Mascarillas y accesorios",
    slug: "mascarillas",
    image: "/mockup-assets/cat-mascarilla.png",
    icon: Package,
    featured: true,
  },
  {
    id: "todas",
    name: "Ver todas las categorías",
    slug: "todas",
    image: "/placeholders/categoria-todas.png",
    icon: Grid2X2,
    featured: true,
  },
];
