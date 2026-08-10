import { notFound } from "next/navigation";
import { PlaceholderPage } from "@/components/shop/PlaceholderPage";

const routeCopy: Record<string, { title: string; description: string }> = {
  profesionales: {
    title: "Profesionales de la salud",
    description:
      "Próximamente concentrará recursos y flujos de compra especializada para médicos y clínicas.",
  },
  nosotros: {
    title: "Nosotros",
    description:
      "Espacio reservado para presentar la propuesta comercial de shop.neumopractice.com y su relación con NeumoPractice.",
  },
  contacto: {
    title: "Contacto",
    description:
      "Ruta preparada para atención comercial, soporte y solicitudes de compra especializada.",
  },
  "envios-y-devoluciones": {
    title: "Envíos y devoluciones",
    description: "Información comercial en preparación para la tienda.",
  },
  "terminos-y-condiciones": {
    title: "Términos y condiciones",
    description: "Documento legal pendiente de validación.",
  },
  "aviso-de-privacidad": {
    title: "Aviso de privacidad",
    description: "Documento pendiente de validación legal.",
  },
  "preguntas-frecuentes": {
    title: "Preguntas frecuentes",
    description: "Preguntas comunes de compra en preparación.",
  },
  "guia-de-compra": {
    title: "Guía de compra",
    description: "Guía para comprar productos respiratorios en preparación.",
  },
};

type CatchAllPageProps = {
  params: Promise<{
    slug: string[];
  }>;
};

export default async function CatchAllPage({ params }: CatchAllPageProps) {
  const { slug } = await params;
  const key = slug[0] ?? "";
  const copy = routeCopy[key];

  if (!copy) {
    notFound();
  }

  return <PlaceholderPage title={copy.title} description={copy.description} />;
}
