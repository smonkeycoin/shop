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
    image: "/placeholders/categoria-aerocamaras.png",
    icon: Shield,
    featured: true,
  },
  {
    id: "flujometros",
    name: "Flujómetros",
    slug: "flujometros",
    image: "/placeholders/categoria-flujometros.png",
    icon: Gauge,
    featured: true,
  },
  {
    id: "nebulizadores",
    name: "Nebulizadores y accesorios",
    slug: "nebulizadores",
    image: "/placeholders/categoria-nebulizadores.png",
    icon: Activity,
    featured: true,
  },
  {
    id: "higiene-nasal",
    name: "Higiene nasal",
    slug: "higiene-nasal",
    image: "/placeholders/categoria-higiene-nasal.png",
    icon: Droplets,
    featured: true,
  },
  {
    id: "inhaladores",
    name: "Inhaladores y accesorios",
    slug: "inhaladores",
    image: "/placeholders/categoria-inhaladores.png",
    icon: HeartPulse,
    featured: true,
  },
  {
    id: "mascarillas",
    name: "Mascarillas y accesorios",
    slug: "mascarillas",
    image: "/placeholders/categoria-mascarillas.png",
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
