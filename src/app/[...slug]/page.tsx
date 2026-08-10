import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Mail, MessageCircle, PackageSearch, Send } from "lucide-react";
import { shopContactConfig } from "@/config/contact";
import { categories } from "@/data/catalog";
import { normalizeWhatsAppNumber } from "@/lib/orders";
import { createClient } from "@/lib/supabase/server";
import { PlaceholderPage } from "@/components/shop/PlaceholderPage";
import { ShopLayout } from "@/components/shop/ShopLayout";

const routeCopy: Record<string, { title: string; description: string }> = {
  profesionales: {
    title: "Profesionales de la salud",
    description:
      "Próximamente concentrará recursos y flujos de compra especializada para médicos y clínicas.",
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

const neumopracticeUrl = "https://neumopractice.com";

const purposePillars = [
  {
    title: "Selección clara",
    text: "Productos organizados para que sea más sencillo encontrar lo que necesitas.",
  },
  {
    title: "Cuidado respiratorio",
    text: "Una tienda enfocada exclusivamente en soluciones relacionadas con respiración y bienestar respiratorio.",
  },
  {
    title: "Soporte humano",
    text: "Si tienes dudas sobre tu compra, puedes continuar el seguimiento con nuestro equipo.",
  },
];

const trustPrinciples = [
  "Calidad",
  "Claridad",
  "Uso sencillo",
  "Fabricantes especializados",
  "Soporte de compra",
];

type CatchAllPageProps = {
  params: Promise<{
    slug: string[];
  }>;
};

export default async function CatchAllPage({ params }: CatchAllPageProps) {
  const { slug } = await params;
  const key = slug[0] ?? "";

  if (slug.length > 1) {
    notFound();
  }

  if (key === "nosotros") {
    return <AboutPage />;
  }

  if (key === "contacto") {
    const settings = await getPublicContactSettings();
    return <ContactPage supportEmail={settings.supportEmail} supportWhatsapp={settings.supportWhatsapp} />;
  }

  const copy = routeCopy[key];

  if (!copy) {
    notFound();
  }

  return <PlaceholderPage title={copy.title} description={copy.description} />;
}

function AboutPage() {
  const visualCategories = categories.filter((category) =>
    ["aerocamaras", "nebulizacion", "higiene-nasal", "monitoreo"].includes(category.slug),
  );

  return (
    <ShopLayout>
      <main className="public-polish-page about-page">
        <section className="section-shell public-hero public-hero-split">
          <div className="public-hero-copy">
            <p className="public-eyebrow">SHOP NEUMOPRACTICE</p>
            <h1>Cuidado respiratorio, más simple.</h1>
            <p>
              Shop NeumoPractice reúne productos seleccionados para facilitar el cuidado respiratorio cotidiano
              en casa, durante el tratamiento y en movimiento.
            </p>
            <div className="public-actions">
              <Link className="button-primary" href="/productos">
                Ver productos
              </Link>
              <Link className="button-secondary" href={neumopracticeUrl} target="_blank" rel="noreferrer">
                Conocer NeumoPractice
              </Link>
            </div>
          </div>
          <div className="about-category-composition" aria-label="Categorías principales">
            {visualCategories.map((category) => {
              const Icon = category.icon ?? PackageSearch;
              return (
                <Link className="about-category-chip" href={`/categorias/${category.slug}`} key={category.slug}>
                  <span>
                    <Icon size={20} aria-hidden="true" />
                  </span>
                  <strong>{category.shortName}</strong>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="section-shell public-section">
          <div className="public-section-heading">
            <h2>Una tienda especializada, no un catálogo infinito.</h2>
            <p>
              Preferimos una selección clara de dispositivos, accesorios y soluciones respiratorias antes que
              llenar la tienda con cientos de productos difíciles de comparar.
            </p>
          </div>
          <div className="purpose-grid">
            {purposePillars.map((pillar) => (
              <article className="purpose-card" key={pillar.title}>
                <CheckCircle2 size={22} aria-hidden="true" />
                <h3>{pillar.title}</h3>
                <p>{pillar.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section-shell ecosystem-band">
          <div>
            <p className="public-eyebrow">ECOSISTEMA</p>
            <h2>Parte del ecosistema NeumoPractice</h2>
            <p>
              Shop NeumoPractice nace como una extensión del ecosistema NeumoPractice, con el objetivo de conectar
              una experiencia digital clara con productos de cuidado respiratorio.
            </p>
          </div>
          <Link className="button-secondary" href={neumopracticeUrl} target="_blank" rel="noreferrer">
            Conocer NeumoPractice
          </Link>
        </section>

        <section className="public-principles">
          <div className="section-shell principles-inner">
            <h2>Lo que buscamos en cada producto</h2>
            <div className="principles-list">
              {trustPrinciples.map((principle) => (
                <span key={principle}>{principle}</span>
              ))}
            </div>
          </div>
        </section>

        <section className="section-shell public-final-cta">
          <div>
            <h2>Todo para respirar mejor, en un solo lugar.</h2>
            <p>Explora productos organizados para compra clara, seguimiento sencillo y soporte cercano.</p>
          </div>
          <div className="public-actions">
            <Link className="button-primary" href="/productos">
              Explorar productos
            </Link>
            <Link className="button-secondary" href="/contacto">
              Contactarnos
            </Link>
          </div>
        </section>
      </main>
    </ShopLayout>
  );
}

function ContactPage({
  supportEmail,
  supportWhatsapp,
}: {
  supportEmail: string;
  supportWhatsapp: string;
}) {
  const whatsappNumber = normalizeWhatsAppNumber(supportWhatsapp);
  const whatsappHref = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Hola, tengo una duda sobre Shop NeumoPractice.")}`
    : "";

  return (
    <ShopLayout>
      <main className="public-polish-page contact-page">
        <section className="section-shell public-hero contact-hero">
          <p className="public-eyebrow">CONTACTO</p>
          <h1>Estamos para ayudarte.</h1>
          <p>¿Tienes una duda sobre un producto, tu pedido o disponibilidad? Escríbenos.</p>
        </section>

        <section className="section-shell contact-card-grid" aria-label="Opciones de contacto">
          <article className="contact-method-card">
            <span className="contact-card-icon">
              <MessageCircle size={22} aria-hidden="true" />
            </span>
            <h2>WhatsApp</h2>
            {whatsappHref ? (
              <>
                <p>Escríbenos para dudas rápidas sobre compra o disponibilidad.</p>
                <a className="button-primary" href={whatsappHref} target="_blank" rel="noreferrer">
                  Abrir WhatsApp
                </a>
              </>
            ) : (
              <>
                <p>Este canal se habilitará cuando el número oficial esté configurado.</p>
                <span className="contact-coming-soon">Próximamente</span>
              </>
            )}
          </article>

          <article className="contact-method-card">
            <span className="contact-card-icon">
              <Mail size={22} aria-hidden="true" />
            </span>
            <h2>Email</h2>
            <p>Para dudas de producto, disponibilidad o apoyo comercial.</p>
            <a className="button-primary" href={`mailto:${supportEmail}`}>
              {supportEmail}
            </a>
          </article>

          <article className="contact-method-card">
            <span className="contact-card-icon">
              <Send size={22} aria-hidden="true" />
            </span>
            <h2>Seguimiento</h2>
            <p>Consulta el estado de un pedido con tu número de orden y datos de contacto.</p>
            <Link className="button-primary" href="/seguimiento">
              Seguir mi pedido
            </Link>
          </article>
        </section>

        <section className="section-shell contact-note-panel">
          <h2>Atención directa, sin formularios simulados.</h2>
          <p>
            Por ahora concentramos el contacto en canales directos. Cuando exista un endpoint real, habilitaremos
            un formulario de contacto funcional.
          </p>
        </section>
      </main>
    </ShopLayout>
  );
}

async function getPublicContactSettings() {
  const fallback = {
    supportEmail: shopContactConfig.supportEmail,
    supportWhatsapp: shopContactConfig.whatsappBusinessNumber,
  };

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("shop_settings")
      .select("key,value")
      .in("key", ["support_email", "support_whatsapp", "whatsapp_business_number"]);

    if (error) {
      return fallback;
    }

    const values = new Map((data ?? []).map((setting) => [setting.key, jsonToString(setting.value)]));

    return {
      supportEmail: values.get("support_email") || fallback.supportEmail,
      supportWhatsapp:
        values.get("support_whatsapp") || values.get("whatsapp_business_number") || fallback.supportWhatsapp,
    };
  } catch {
    return fallback;
  }
}

function jsonToString(value: unknown) {
  if (typeof value === "string") {
    return value.trim();
  }

  if (typeof value === "number") {
    return String(value);
  }

  return "";
}
