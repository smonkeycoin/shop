"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { orderRepository } from "@/lib/orderRepository";
import type { CreateOrderInput, Order, OrderStatus, TrackingInput } from "@/types/orders";

type OrderContextValue = {
  orders: Order[];
  createOrder: (input: CreateOrderInput) => Order;
  getOrder: (orderNumber: string) => Order | undefined;
  updateOrderStatus: (orderNumber: string, status: OrderStatus) => Order | undefined;
  updateTracking: (orderNumber: string, tracking: TrackingInput) => Order | undefined;
  addInternalNote: (orderNumber: string, note: string) => Order | undefined;
  cancelOrder: (orderNumber: string) => Order | undefined;
  createDemoOrder: () => Order;
  clearDemoOrders: () => void;
};

const OrderContext = createContext<OrderContextValue | null>(null);

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);

  const refreshOrders = useCallback(() => {
    setOrders(orderRepository.getOrders());
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(refreshOrders);

    window.addEventListener("storage", refreshOrders);
    window.addEventListener("shop-neumopractice-orders", refreshOrders);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("storage", refreshOrders);
      window.removeEventListener("shop-neumopractice-orders", refreshOrders);
    };
  }, [refreshOrders]);

  const createOrder = useCallback(
    (input: CreateOrderInput) => {
      const order = orderRepository.createOrder(input);
      refreshOrders();
      return order;
    },
    [refreshOrders],
  );

  const updateOrderStatus = useCallback(
    (orderNumber: string, status: OrderStatus) => {
      const order = orderRepository.updateOrderStatus(orderNumber, status);
      refreshOrders();
      return order;
    },
    [refreshOrders],
  );

  const updateTracking = useCallback(
    (orderNumber: string, tracking: TrackingInput) => {
      const order = orderRepository.updateTracking(orderNumber, tracking);
      refreshOrders();
      return order;
    },
    [refreshOrders],
  );

  const addInternalNote = useCallback(
    (orderNumber: string, note: string) => {
      const order = orderRepository.addInternalNote(orderNumber, note);
      refreshOrders();
      return order;
    },
    [refreshOrders],
  );

  const cancelOrder = useCallback(
    (orderNumber: string) => {
      const order = orderRepository.cancelOrder(orderNumber);
      refreshOrders();
      return order;
    },
    [refreshOrders],
  );

  const createDemoOrder = useCallback(() => {
    const order = orderRepository.createOrder({
      customer: {
        firstName: "Cliente",
        lastName: "Demo",
        phone: "+52 998 123 4567",
        email: "cliente.demo@neumopractice.local",
      },
      shippingAddress: {
        street: "Av. Demo",
        exteriorNumber: "100",
        interiorNumber: "2",
        neighborhood: "Centro",
        postalCode: "77500",
        city: "Cancún",
        state: "Quintana Roo",
        references: "Entrega después de las 4 PM.",
      },
      items: [
        {
          id: "demo-vortex",
          productId: "vortex-camara-espaciadora",
          sku: "NP-VOR-001-P02",
          name: "VORTEX Cámara Espaciadora",
          variant: "Pediátrica 0-2 años",
          image: "/mockup-assets/product-vortex.png",
          quantity: 1,
          unitPrice: 1250,
          total: 1250,
        },
        {
          id: "demo-neilmed",
          productId: "neilmed-pedia-mist",
          sku: "NP-NLM-005",
          name: "NeilMed Pedia Mist",
          variant: "Opción única",
          image: "/mockup-assets/product-neilmed.png",
          quantity: 1,
          unitPrice: 320,
          total: 320,
        },
      ],
      subtotal: 1570,
      shipping: 150,
      total: 1720,
      currency: "MXN",
      shippingMethod: "Envío estándar",
      whatsappOptIn: true,
      customerNotes: "Referencias para entrega únicamente.",
      requiresInvoice: true,
    });

    refreshOrders();
    return order;
  }, [refreshOrders]);

  const clearDemoOrders = useCallback(() => {
    orderRepository.clearOrders();
    refreshOrders();
  }, [refreshOrders]);

  const value = useMemo<OrderContextValue>(
    () => ({
      orders,
      createOrder,
      getOrder: (orderNumber) =>
        orders.find((order) => order.orderNumber.toUpperCase() === orderNumber.toUpperCase()),
      updateOrderStatus,
      updateTracking,
      addInternalNote,
      cancelOrder,
      createDemoOrder,
      clearDemoOrders,
    }),
    [
      addInternalNote,
      cancelOrder,
      clearDemoOrders,
      createDemoOrder,
      createOrder,
      orders,
      updateOrderStatus,
      updateTracking,
    ],
  );

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}

export function useOrders() {
  const context = useContext(OrderContext);

  if (!context) {
    throw new Error("useOrders must be used inside OrderProvider");
  }

  return context;
}
