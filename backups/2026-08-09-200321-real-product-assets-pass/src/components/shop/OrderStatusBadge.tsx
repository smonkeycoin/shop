import type { OrderStatus } from "@/types/orders";
import { orderStatusLabels } from "@/lib/orders";

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <span className={`order-status-badge ${status}`}>{orderStatusLabels[status]}</span>;
}
