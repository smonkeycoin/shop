import { CheckCircle2, Circle, PackageCheck } from "lucide-react";
import { orderStatusSteps } from "@/lib/orders";
import type { OrderStatus } from "@/types/orders";

export function OrderStatusTracker({ status }: { status: OrderStatus }) {
  if (status === "cancelled") {
    return (
      <div className="order-cancelled-state">
        <Circle size={20} aria-hidden="true" />
        <strong>Pedido cancelado</strong>
      </div>
    );
  }

  const activeIndex = orderStatusSteps.findIndex((step) => step.status === status);

  return (
    <ol className="order-status-tracker" aria-label="Estado del pedido">
      {orderStatusSteps.map((step, index) => {
        const complete = index < activeIndex || status === "delivered";
        const active = index === activeIndex && status !== "delivered";

        return (
          <li className={`${complete ? "complete" : ""} ${active ? "active" : ""}`} key={step.status}>
            <span>
              {complete ? <CheckCircle2 size={18} aria-hidden="true" /> : <PackageCheck size={18} aria-hidden="true" />}
            </span>
            <strong>{step.customerLabel}</strong>
          </li>
        );
      })}
    </ol>
  );
}
