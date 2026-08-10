import { shopContactConfig } from "@/config/contact";
import type { Order, OrderStatus } from "@/types/orders";

export const orderStatusSteps: { status: Exclude<OrderStatus, "cancelled">; customerLabel: string }[] = [
  { status: "new", customerLabel: "Pedido recibido" },
  { status: "confirmed", customerLabel: "Confirmado" },
  { status: "preparing", customerLabel: "Preparando" },
  { status: "shipped", customerLabel: "Enviado" },
  { status: "delivered", customerLabel: "Entregado" },
];

export const orderStatusLabels: Record<OrderStatus, string> = {
  new: "Nuevo",
  confirmed: "Confirmado",
  preparing: "Preparando",
  shipped: "Enviado",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

export function normalizeWhatsAppNumber(value: string) {
  return value.replace(/[^\d+]/g, "").replace(/^\+/, "");
}

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function isValidPhone(value: string) {
  return normalizeWhatsAppNumber(value).length >= 10;
}

export function getWhatsAppOrderMessage(order: Order) {
  const firstName = order.customer.firstName.trim() || "hola";

  if (order.status === "confirmed") {
    return `Hola, ${firstName} 👋 Tu pedido ${order.orderNumber} está confirmado. En breve comenzaremos a prepararlo.`;
  }

  if (order.status === "preparing") {
    return `Hola, ${firstName} 📦 Estamos preparando tu pedido ${order.orderNumber}. Te avisaremos en cuanto salga a envío.`;
  }

  if (order.status === "shipped") {
    const tracking = order.trackingNumber ? ` Tu número de guía es ${order.trackingNumber}.` : "";
    const url = order.trackingUrl ? ` ${order.trackingUrl}` : "";
    return `Hola, ${firstName} 🚚 Tu pedido ${order.orderNumber} ya va en camino.${tracking}${url}`;
  }

  if (order.status === "delivered") {
    return `Hola, ${firstName} 💙 Tu pedido ${order.orderNumber} aparece como entregado. Esperamos que todo haya llegado correctamente. Si necesitas ayuda con tu compra, estamos por aquí.`;
  }

  if (order.status === "cancelled") {
    return `Hola, ${firstName}. Tu pedido ${order.orderNumber} aparece como cancelado. Si necesitas apoyo con tu compra, estamos por aquí.`;
  }

  return `Hola, ${firstName} 👋 Ya recibimos tu pedido ${order.orderNumber} en Shop NeumoPractice. Estamos revisándolo y te mantendremos informado por aquí.`;
}

export function getCustomerWhatsAppLink(order: Order) {
  const number = normalizeWhatsAppNumber(order.customer.phone);

  if (!number) {
    return "";
  }

  return `https://wa.me/${number}?text=${encodeURIComponent(getWhatsAppOrderMessage(order))}`;
}

export function getShopWhatsAppFollowupLink(order: Order) {
  const number = normalizeWhatsAppNumber(shopContactConfig.whatsappBusinessNumber);

  if (!number) {
    return "";
  }

  const message = `Hola 👋 Acabo de realizar el pedido ${order.orderNumber} en Shop NeumoPractice y quiero recibir aquí las actualizaciones de mi envío.`;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export function exportOrdersCsv(orders: Order[]) {
  const header =
    "order_number,created_at,customer,phone,email,total,status,carrier,tracking_number,requires_invoice";
  const rows = orders.map((order) =>
    [
      order.orderNumber,
      order.createdAt,
      `${order.customer.firstName} ${order.customer.lastName}`.trim(),
      order.customer.phone,
      order.customer.email,
      order.total,
      order.status,
      order.carrier ?? "",
      order.trackingNumber ?? "",
      order.requiresInvoice ? "yes" : "no",
    ]
      .map((value) => `"${String(value).replaceAll('"', '""')}"`)
      .join(","),
  );

  return [header, ...rows].join("\n");
}

export function matchesOrderLookup(order: Order, orderNumber: string, contact: string) {
  const cleanOrder = orderNumber.trim().toUpperCase();
  const cleanContact = contact.trim().toLowerCase();
  const cleanPhone = normalizeWhatsAppNumber(contact);

  return (
    order.orderNumber.toUpperCase() === cleanOrder &&
    (order.customer.email.toLowerCase() === cleanContact ||
      normalizeWhatsAppNumber(order.customer.phone) === cleanPhone)
  );
}
