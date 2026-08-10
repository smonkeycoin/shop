import type { Currency } from "./commerce";

export type OrderStatus =
  | "new"
  | "confirmed"
  | "preparing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type OrderCustomer = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
};

export type ShippingAddress = {
  street: string;
  exteriorNumber: string;
  interiorNumber?: string;
  neighborhood: string;
  postalCode: string;
  city: string;
  state: string;
  references?: string;
};

export type OrderItem = {
  id: string;
  productId?: string;
  bundleId?: string;
  sku: string;
  name: string;
  variant?: string;
  image?: string;
  quantity: number;
  unitPrice: number;
  total: number;
};

export type Order = {
  id: string;
  orderNumber: string;
  createdAt: string;
  updatedAt: string;
  status: OrderStatus;
  customer: OrderCustomer;
  shippingAddress: ShippingAddress;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  currency: Currency;
  shippingMethod: string;
  trackingNumber?: string;
  carrier?: string;
  trackingUrl?: string;
  whatsappOptIn: boolean;
  customerNotes?: string;
  internalNotes?: string;
  requiresInvoice: boolean;
};

export type CreateOrderInput = {
  customer: OrderCustomer;
  shippingAddress: ShippingAddress;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  currency: Currency;
  shippingMethod: string;
  whatsappOptIn: boolean;
  customerNotes?: string;
  requiresInvoice: boolean;
};

export type TrackingInput = {
  carrier?: string;
  trackingNumber?: string;
  trackingUrl?: string;
};
