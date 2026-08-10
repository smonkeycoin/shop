"use client";

import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, Mail, MapPin, MessageCircle, PackageSearch, Truck, UserRound } from "lucide-react";
import { shopContactConfig } from "@/config/contact";
import { formatPrice } from "@/data/catalog";
import { getShopWhatsAppFollowupLink } from "@/lib/orders";
import type { Order } from "@/types/orders";
import { Breadcrumbs } from "./Breadcrumbs";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { OrderStatusTracker } from "./OrderStatusTracker";
import { useOrders } from "./OrderProvider";

export function OrderPageClient({
  orderNumber,
  initialOrder,
  requiresToken = false,
}: {
  orderNumber: string;
  initialOrder?: Order | null;
  requiresToken?: boolean;
}) {
  const { getOrder } = useOrders();
  const order = initialOrder ?? getOrder(orderNumber);

  if (!order) {
    return (
      <section className="section-shell order-page">
        <Breadcrumbs items={[{ label: "Pedido" }]} />
        <div className="empty-state order-not-found">
          <PackageSearch size={36} aria-hidden="true" />
          <h1>No encontramos este pedido.</h1>
          <p>
            {requiresToken
              ? "Abre el enlace completo de confirmacion para consultar el detalle de tu pedido."
              : "Verifica el numero de pedido o vuelve a intentar desde tu confirmacion."}
          </p>
          <Link className="button-primary" href="/seguimiento">
            Buscar pedido
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="section-shell order-page">
      <Breadcrumbs items={[{ label: "Pedido", href: "/seguimiento" }, { label: order.orderNumber }]} />
      <header className="order-success-hero">
        <span className="order-success-icon" aria-hidden="true">
          <CheckCircle2 size={34} />
        </span>
        <span className="catalog-eyebrow">PEDIDO CONFIRMADO</span>
        <h1>¡Gracias por tu compra!</h1>
        <p>Ya estamos preparando los siguientes pasos de tu pedido.</p>
        <strong>Pedido {order.orderNumber}</strong>
      </header>

      <div className="order-main-layout">
        <div className="order-main-column">
          <section className="order-card">
            <div className="order-card-heading">
              <h2>Estado del pedido</h2>
              <OrderStatusBadge status={order.status} />
            </div>
            <OrderStatusTracker status={order.status} />
          </section>

          {order.status === "shipped" ? (
            <section className="order-card tracking-card">
              <Truck size={22} aria-hidden="true" />
              <div>
                <h2>Tu pedido va en camino</h2>
                <p>{order.carrier || "Paquetería por confirmar"}</p>
                {order.trackingNumber ? <strong>Guía: {order.trackingNumber}</strong> : null}
              </div>
              {order.trackingUrl ? (
                <a className="button-secondary" href={order.trackingUrl} target="_blank" rel="noreferrer">
                  Rastrear envío
                </a>
              ) : null}
            </section>
          ) : null}

          <WhatsAppFollowupCard order={order} />

          <section className="order-card">
            <h2>Resumen pedido</h2>
            <OrderItems order={order} />
          </section>
        </div>

        <aside className="order-side-column">
          <section className="order-card">
            <div className="mini-card-heading">
              <MapPin size={18} aria-hidden="true" />
              <h2>Entrega</h2>
            </div>
            <p>
              {order.shippingAddress.street} {order.shippingAddress.exteriorNumber}
              {order.shippingAddress.interiorNumber ? ` Int. ${order.shippingAddress.interiorNumber}` : ""}
              <br />
              {order.shippingAddress.neighborhood}, {order.shippingAddress.postalCode}
              <br />
              {order.shippingAddress.city}, {order.shippingAddress.state}
            </p>
            {order.shippingAddress.references ? <small>{order.shippingAddress.references}</small> : null}
          </section>

          <section className="order-card">
            <div className="mini-card-heading">
              <UserRound size={18} aria-hidden="true" />
              <h2>Datos de contacto</h2>
            </div>
            <p>
              {order.customer.firstName} {order.customer.lastName}
              <br />
              {order.customer.email}
              <br />
              {order.customer.phone}
            </p>
          </section>

          <section className="order-card email-pending-card">
            <Mail size={18} aria-hidden="true" />
            <p>
              También enviaremos la confirmación a {order.customer.email} cuando habilitemos las notificaciones transaccionales.
            </p>
            {process.env.NODE_ENV === "development" ? <span>Notificación por email pendiente de integración</span> : null}
          </section>

          <Link className="button-secondary order-continue" href="/productos">
            Seguir comprando
          </Link>
        </aside>
      </div>
    </section>
  );
}

function WhatsAppFollowupCard({ order }: { order: Order }) {
  if (!order.whatsappOptIn) {
    return null;
  }

  const link = getShopWhatsAppFollowupLink(order);

  return (
    <section className="order-card whatsapp-followup-card">
      <MessageCircle size={28} aria-hidden="true" />
      <div>
        <h2>Sigue tu pedido por WhatsApp</h2>
        <p>Abre una conversación con Shop NeumoPractice para recibir atención y seguimiento de tu compra.</p>
        {link ? (
          <a className="button-primary" href={link} target="_blank" rel="noreferrer">
            Continuar por WhatsApp
          </a>
        ) : (
          <div className="whatsapp-unavailable">
            <strong>Seguimiento por WhatsApp disponible próximamente.</strong>
            {process.env.NODE_ENV === "development" && !shopContactConfig.whatsappBusinessNumber ? (
              <span>Falta configurar número</span>
            ) : null}
          </div>
        )}
      </div>
    </section>
  );
}

function OrderItems({ order }: { order: Order }) {
  return (
    <>
      <div className="order-items-list">
        {order.items.map((item) => (
          <article className="order-item-row" key={item.id}>
            <span className="order-item-image">
              {item.image ? <Image src={item.image} alt="" fill sizes="58px" /> : <PackageSearch size={18} aria-hidden="true" />}
            </span>
            <div>
              <strong>{item.name}</strong>
              <small>
                {item.variant} · Cant. {item.quantity}
              </small>
            </div>
            <em>{formatPrice(item.total, order.currency)}</em>
          </article>
        ))}
      </div>
      <div className="order-totals">
        <div>
          <span>Subtotal</span>
          <strong>{formatPrice(order.subtotal, order.currency)}</strong>
        </div>
        <div>
          <span>Envío</span>
          <strong>{order.shipping === 0 ? "Gratis" : formatPrice(order.shipping, order.currency)}</strong>
        </div>
        <div>
          <span>Total</span>
          <strong>{formatPrice(order.total, order.currency)} MXN</strong>
        </div>
      </div>
    </>
  );
}
