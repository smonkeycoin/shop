import { PlaceholderPage } from "@/components/shop/PlaceholderPage";

const routeCopy: Record<string, { title: string; description: string }> = {
  productos: {
    title: "Productos",
    description:
      "Esta sección será el catálogo completo de productos respiratorios. Por ahora queda preparada como ruta visual de la primera versión.",
  },
  categorias: {
    title: "Categorías",
    description:
      "Aquí vivirá la navegación completa por aerocámaras, flujómetros, nebulización, higiene nasal, inhaladores y accesorios.",
  },
  marcas: {
    title: "Marcas",
    description:
      "Esta ruta reunirá las marcas y fabricantes disponibles cuando el catálogo comercial esté validado.",
  },
  profesionales: {
    title: "Profesionales de la salud",
    description:
      "Próximamente concentrará recursos, compra especializada y flujos B2B para médicos y clínicas.",
  },
  nosotros: {
    title: "Nosotros",
    description:
      "Espacio reservado para presentar la propuesta comercial de shop.neumopractice.com y su relación con NeumoPractice.",
  },
  contacto: {
    title: "Contacto",
    description:
      "Ruta preparada para atención comercial, soporte y solicitudes de profesionales de la salud.",
  },
};

type CatchAllPageProps = {
  params: Promise<{
    slug: string[];
  }>;
};

export default async function CatchAllPage({ params }: CatchAllPageProps) {
  const { slug } = await params;
  const key = slug[0] ?? "productos";
  const copy =
    routeCopy[key] ??
    {
      title: toTitleCase(key),
      description:
        "Ruta placeholder preparada para continuar la arquitectura frontend de la tienda sin mostrar un 404 brusco.",
    };

  return <PlaceholderPage title={copy.title} description={copy.description} />;
}

function toTitleCase(value: string) {
  return value
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
