import type { CreateOrderInput, Order, OrderStatus, TrackingInput } from "@/types/orders";

const ORDERS_STORAGE_KEY = "shop-neumopractice-orders-v1";
const ORDER_COUNTER_STORAGE_KEY = "shop-neumopractice-order-counter-v1";
const ORDER_COUNTER_START = 100000;

export const orderRepository = {
  getOrders,
  getOrder,
  createOrder,
  updateOrderStatus,
  updateTracking,
  addInternalNote,
  cancelOrder,
  replaceOrders,
  clearOrders,
};

function getOrders(): Order[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = window.localStorage.getItem(ORDERS_STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function getOrder(orderNumber: string) {
  return getOrders().find((order) => order.orderNumber.toUpperCase() === orderNumber.toUpperCase());
}

function createOrder(input: CreateOrderInput) {
  const now = new Date().toISOString();
  const order: Order = {
    ...input,
    id: crypto.randomUUID(),
    orderNumber: nextOrderNumber(),
    createdAt: now,
    updatedAt: now,
    status: "new",
  };

  replaceOrders([order, ...getOrders()]);
  return order;
}

function updateOrderStatus(orderNumber: string, status: OrderStatus) {
  return updateOrder(orderNumber, { status });
}

function updateTracking(orderNumber: string, tracking: TrackingInput) {
  return updateOrder(orderNumber, tracking);
}

function addInternalNote(orderNumber: string, internalNotes: string) {
  return updateOrder(orderNumber, { internalNotes });
}

function cancelOrder(orderNumber: string) {
  return updateOrderStatus(orderNumber, "cancelled");
}

function replaceOrders(orders: Order[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
  window.dispatchEvent(new Event("shop-neumopractice-orders"));
}

function clearOrders() {
  replaceOrders([]);
}

function updateOrder(orderNumber: string, patch: Partial<Order>) {
  let updatedOrder: Order | undefined;
  const orders = getOrders().map((order) => {
    if (order.orderNumber.toUpperCase() !== orderNumber.toUpperCase()) {
      return order;
    }

    updatedOrder = {
      ...order,
      ...patch,
      updatedAt: new Date().toISOString(),
    };

    return updatedOrder;
  });

  replaceOrders(orders);
  return updatedOrder;
}

function nextOrderNumber() {
  const existingOrders = getOrders();
  const existingNumbers = new Set(existingOrders.map((order) => order.orderNumber));
  let counter = readCounter();
  let next = "";

  do {
    counter += 1;
    next = `NP-${counter}`;
  } while (existingNumbers.has(next));

  writeCounter(counter);
  return next;
}

function readCounter() {
  if (typeof window === "undefined") {
    return ORDER_COUNTER_START;
  }

  const stored = Number(window.localStorage.getItem(ORDER_COUNTER_STORAGE_KEY));
  return Number.isFinite(stored) && stored >= ORDER_COUNTER_START ? stored : ORDER_COUNTER_START;
}

function writeCounter(value: number) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(ORDER_COUNTER_STORAGE_KEY, String(value));
}
