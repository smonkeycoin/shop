"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Download, PlusCircle, Search, Trash2 } from "lucide-react";
import { exportOrdersCsv, orderStatusLabels } from "@/lib/orders";
import type { OrderStatus } from "@/types/orders";
import { formatPrice } from "@/data/catalog";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { useOrders } from "./OrderProvider";

const filters: { id: "all" | OrderStatus; label: string }[] = [
  { id: "all", label: "Todos" },
  { id: "new", label: "Nuevos" },
  { id: "confirmed", label: "Confirmados" },
  { id: "preparing", label: "Preparando" },
  { id: "shipped", label: "Enviados" },
  { id: "delivered", label: "Entregados" },
  { id: "cancelled", label: "Cancelados" },
];

export function DevOrdersClient() {
  const { clearDemoOrders, createDemoOrder, orders } = useOrders();
  const [activeFilter, setActiveFilter] = useState<"all" | OrderStatus>("all");
  const [query, setQuery] = useState("");

  const stats = useMemo(
    () => ({
      total: orders.length,
      new: orders.filter((order) => order.status === "new").length,
      preparing: orders.filter((order) => order.status === "preparing").length,
      shipped: orders.filter((order) => order.status === "shipped").length,
    }),
    [orders],
  );

  const filteredOrders = useMemo(() => {
    const cleanQuery = query.trim().toLowerCase();

    return orders.filter((order) => {
      const statusMatches = activeFilter === "all" || order.status === activeFilter;
      const queryMatches =
        !cleanQuery ||
        [
          order.orderNumber,
          `${order.customer.firstName} ${order.customer.lastName}`,
          order.customer.email,
          order.customer.phone,
        ]
          .join(" ")
          .toLowerCase()
          .includes(cleanQuery);

      return statusMatches && queryMatches;
    });
  }, [activeFilter, orders, query]);

  function exportCsv() {
    const blob = new Blob([exportOrdersCsv(orders)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "shop-neumopractice-orders.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function handleClear() {
    if (window.confirm("¿Limpiar pedidos demo locales? Esta acción no borra el carrito.")) {
      clearDemoOrders();
    }
  }

  return (
    <section className="section-shell dev-orders-page">
      <header className="catalog-hero">
        <div>
          <span className="catalog-eyebrow">SHOP OPERATIONS</span>
          <h1>Pedidos</h1>
          <p>Centro local para simular preparación, envío y seguimiento de pedidos.</p>
        </div>
        <div className="dev-order-stats">
          <Stat label="Pedidos totales" value={stats.total} />
          <Stat label="Nuevos" value={stats.new} />
          <Stat label="Preparando" value={stats.preparing} />
          <Stat label="Enviados" value={stats.shipped} />
        </div>
      </header>

      <div className="operations-flow-guide">
        <span>Nuevo</span>
        <span>Confirmado</span>
        <span>Preparando</span>
        <span>Enviado</span>
        <span>Entregado</span>
      </div>

      <div className="dev-orders-toolbar">
        <div className="dev-filter-tabs">
          {filters.map((filter) => (
            <button
              className={activeFilter === filter.id ? "active" : undefined}
              type="button"
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
            >
              {filter.label}
            </button>
          ))}
        </div>
        <label className="dev-order-search">
          <Search size={16} aria-hidden="true" />
          <input
            placeholder="Buscar pedido, cliente, email o teléfono"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
      </div>

      <div className="dev-actions-row">
        <button className="button-primary" type="button" onClick={createDemoOrder}>
          <PlusCircle size={17} aria-hidden="true" />
          Crear pedido demo
        </button>
        <button className="button-secondary" type="button" onClick={exportCsv}>
          <Download size={17} aria-hidden="true" />
          Exportar pedidos CSV
        </button>
        <button className="button-secondary" type="button" onClick={handleClear}>
          <Trash2 size={17} aria-hidden="true" />
          Limpiar pedidos demo
        </button>
      </div>

      <div className="dev-orders-table-wrap">
        <table className="dev-orders-table">
          <thead>
            <tr>
              <th>Pedido</th>
              <th>Fecha</th>
              <th>Cliente</th>
              <th>Productos</th>
              <th>Total</th>
              <th>Estado</th>
              <th>WhatsApp</th>
              <th>Envío</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order.id}>
                <td>
                  <strong>{order.orderNumber}</strong>
                  {order.requiresInvoice ? <span className="invoice-badge">Solicita factura</span> : null}
                </td>
                <td>{new Date(order.createdAt).toLocaleString("es-MX")}</td>
                <td>
                  {order.customer.firstName} {order.customer.lastName}
                  <small>{order.customer.email}</small>
                </td>
                <td>{order.items.reduce((total, item) => total + item.quantity, 0)}</td>
                <td>{formatPrice(order.total, order.currency)}</td>
                <td><OrderStatusBadge status={order.status} /></td>
                <td>{order.whatsappOptIn ? "Sí" : "No"}</td>
                <td>{order.carrier ? `${order.carrier} ${order.trackingNumber ?? ""}` : "Pendiente"}</td>
                <td>
                  <Link className="section-link" href={`/dev/orders/${order.orderNumber}`}>
                    Abrir
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="dev-orders-card-list">
        {filteredOrders.map((order) => (
          <article className="dev-order-card" key={order.id}>
            <div>
              <strong>{order.orderNumber}</strong>
              <OrderStatusBadge status={order.status} />
            </div>
            <p>
              {order.customer.firstName} {order.customer.lastName} · {formatPrice(order.total, order.currency)}
            </p>
            <small>{orderStatusLabels[order.status]}</small>
            <Link className="button-secondary" href={`/dev/orders/${order.orderNumber}`}>
              Abrir pedido
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <span>
      <strong>{value}</strong>
      {label}
    </span>
  );
}
