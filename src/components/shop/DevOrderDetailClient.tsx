"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ExternalLink, MessageCircle, PackageSearch, Save, Truck } from "lucide-react";
import { formatPrice } from "@/data/catalog";
import { getCustomerWhatsAppLink, orderStatusLabels } from "@/lib/orders";
import type { OrderStatus } from "@/types/orders";
import { Breadcrumbs } from "./Breadcrumbs";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { useOrders } from "./OrderProvider";

const statuses: OrderStatus[] = ["new", "confirmed", "preparing", "shipped", "delivered", "cancelled"];
const carriers = ["DHL", "FedEx", "Estafeta", "99minutos", "Otro"];

export function DevOrderDetailClient({ orderNumber }: { orderNumber: string }) {
  const {
    addInternalNote,
    getOrder,
    updateOrderStatus,
    updateTracking,
  } = useOrders();
  const order = getOrder(orderNumber);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>("new");
  const [carrier, setCarrier] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingUrl, setTrackingUrl] = useState("");
  const [internalNotes, setInternalNotes] = useState("");

  useEffect(() => {
    if (!order) return;

    const frame = window.requestAnimationFrame(() => {
      setSelectedStatus(order.status);
      setCarrier(order.carrier ?? "");
      setTrackingNumber(order.trackingNumber ?? "");
      setTrackingUrl(order.trackingUrl ?? "");
      setInternalNotes(order.internalNotes ?? "");
    });

    return () => window.cancelAnimationFrame(frame);
  }, [order]);

  const quickActions = useMemo(() => {
    if (!order || order.status === "cancelled" || order.status === "delivered") return [];

    const flow: OrderStatus[] = ["confirmed", "preparing", "shipped", "delivered"];
    const currentIndex = flow.indexOf(order.status);
    return flow.slice(Math.max(currentIndex + 1, 0), Math.max(currentIndex + 2, 1));
  }, [order]);

  if (!order) {
    return (
      <section className="section-shell dev-order-detail-page">
        <div className="empty-state">
          <PackageSearch size={36} aria-hidden="true" />
          <h1>Pedido no encontrado</h1>
          <Link className="button-primary" href="/dev/orders">
            Volver a pedidos
          </Link>
        </div>
      </section>
    );
  }

  const showShippingEditor = selectedStatus === "shipped" || order.status === "shipped";
  const whatsappLink = getCustomerWhatsAppLink(order);

  return (
    <section className="section-shell dev-order-detail-page">
      <Breadcrumbs items={[{ label: "Pedidos", href: "/dev/orders" }, { label: order.orderNumber }]} />
      <header className="dev-detail-header">
        <div>
          <span className="catalog-eyebrow">SHOP OPERATIONS</span>
          <h1>Pedido {order.orderNumber}</h1>
          <p>{new Date(order.createdAt).toLocaleString("es-MX")}</p>
        </div>
        <div className="dev-detail-actions-top">
          <OrderStatusBadge status={order.status} />
          <a className="button-secondary" href={`/pedido/${order.orderNumber}`} target="_blank" rel="noreferrer">
            Ver como cliente
            <ExternalLink size={15} aria-hidden="true" />
          </a>
        </div>
      </header>

      <div className="dev-order-detail-layout">
        <main className="dev-order-main">
          <section className="order-card">
            <h2>Productos</h2>
            <div className="dev-order-products">
              {order.items.map((item) => (
                <article key={item.id}>
                  <div>
                    <strong>{item.name}</strong>
                    <small>
                      {item.sku} · {item.variant} · Cant. {item.quantity}
                    </small>
                  </div>
                  <em>{formatPrice(item.total, order.currency)}</em>
                </article>
              ))}
            </div>
            <div className="order-totals">
              <div><span>Subtotal</span><strong>{formatPrice(order.subtotal, order.currency)}</strong></div>
              <div><span>Envío</span><strong>{order.shipping === 0 ? "Gratis" : formatPrice(order.shipping, order.currency)}</strong></div>
              <div><span>Total</span><strong>{formatPrice(order.total, order.currency)}</strong></div>
            </div>
          </section>

          <section className="order-card dev-info-grid">
            <div>
              <h2>Información cliente</h2>
              <p>
                {order.customer.firstName} {order.customer.lastName}
                <br />
                {order.customer.email}
                <br />
                {order.customer.phone}
              </p>
              {order.requiresInvoice ? <span className="invoice-badge">Solicita factura</span> : null}
            </div>
            <div>
              <h2>Dirección</h2>
              <p>
                {order.shippingAddress.street} {order.shippingAddress.exteriorNumber}
                {order.shippingAddress.interiorNumber ? ` Int. ${order.shippingAddress.interiorNumber}` : ""}
                <br />
                {order.shippingAddress.neighborhood}, {order.shippingAddress.postalCode}
                <br />
                {order.shippingAddress.city}, {order.shippingAddress.state}
              </p>
            </div>
            {order.customerNotes ? (
              <div>
                <h2>Notas cliente</h2>
                <p>{order.customerNotes}</p>
              </div>
            ) : null}
          </section>
        </main>

        <aside className="dev-order-sidebar">
          <section className="order-card">
            <h2>Estado del pedido</h2>
            <label className="checkout-field">
              <span>Estado</span>
              <select value={selectedStatus} onChange={(event) => setSelectedStatus(event.target.value as OrderStatus)}>
                {statuses.map((status) => (
                  <option value={status} key={status}>
                    {orderStatusLabels[status]}
                  </option>
                ))}
              </select>
            </label>
            <button className="button-primary" type="button" onClick={() => updateOrderStatus(order.orderNumber, selectedStatus)}>
              Actualizar estado
            </button>
            <div className="quick-actions-row">
              {quickActions.map((status) => (
                <button className="button-secondary" type="button" key={status} onClick={() => updateOrderStatus(order.orderNumber, status)}>
                  Marcar {orderStatusLabels[status].toLowerCase()}
                </button>
              ))}
            </div>
          </section>

          {showShippingEditor ? (
            <section className="order-card">
              <div className="mini-card-heading">
                <Truck size={18} aria-hidden="true" />
                <h2>Envío</h2>
              </div>
              <label className="checkout-field">
                <span>Paquetería</span>
                <select value={carrier} onChange={(event) => setCarrier(event.target.value)}>
                  <option value="">Seleccionar</option>
                  {carriers.map((item) => (
                    <option value={item} key={item}>{item}</option>
                  ))}
                </select>
              </label>
              <label className="checkout-field">
                <span>Número de guía</span>
                <input value={trackingNumber} onChange={(event) => setTrackingNumber(event.target.value)} />
              </label>
              <label className="checkout-field">
                <span>URL tracking</span>
                <input value={trackingUrl} onChange={(event) => setTrackingUrl(event.target.value)} />
              </label>
              <button
                className="button-primary"
                type="button"
                onClick={() => updateTracking(order.orderNumber, { carrier, trackingNumber, trackingUrl })}
              >
                <Save size={16} aria-hidden="true" />
                Guardar envío
              </button>
            </section>
          ) : null}

          <section className="order-card">
            <div className="mini-card-heading">
              <MessageCircle size={18} aria-hidden="true" />
              <h2>WhatsApp</h2>
            </div>
            <p>
              Número del cliente: {order.customer.phone}
              <br />
              Opt-in: {order.whatsappOptIn ? "Sí" : "No"}
            </p>
            {whatsappLink ? (
              <a className="button-secondary" href={whatsappLink} target="_blank" rel="noreferrer">
                Abrir WhatsApp
              </a>
            ) : null}
          </section>

          <section className="order-card">
            <h2>Notas internas</h2>
            <textarea
              className="internal-notes"
              rows={5}
              placeholder="Cliente pidió entrega después de las 4 PM."
              value={internalNotes}
              onChange={(event) => setInternalNotes(event.target.value)}
            />
            <button className="button-primary" type="button" onClick={() => addInternalNote(order.orderNumber, internalNotes)}>
              Guardar notas
            </button>
          </section>
        </aside>
      </div>
    </section>
  );
}
