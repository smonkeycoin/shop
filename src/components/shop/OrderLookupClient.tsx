"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { matchesOrderLookup } from "@/lib/orders";
import { Breadcrumbs } from "./Breadcrumbs";
import { useOrders } from "./OrderProvider";

export function OrderLookupClient() {
  const router = useRouter();
  const { orders } = useOrders();
  const [orderNumber, setOrderNumber] = useState("");
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const order = orders.find((candidate) => matchesOrderLookup(candidate, orderNumber, contact));

    if (!order) {
      setMessage("No encontramos un pedido con esos datos.");
      return;
    }

    router.push(`/pedido/${order.orderNumber}`);
  }

  return (
    <section className="section-shell lookup-page">
      <Breadcrumbs items={[{ label: "Seguimiento" }]} />
      <div className="lookup-panel">
        <div>
          <span className="catalog-eyebrow">SEGUIMIENTO</span>
          <h1>Sigue tu pedido</h1>
          <p>Consulta pedidos creados localmente durante esta simulación.</p>
        </div>
        <form className="lookup-form" onSubmit={handleSubmit}>
          <label>
            Número de pedido
            <input placeholder="NP-100042" value={orderNumber} onChange={(event) => setOrderNumber(event.target.value)} />
          </label>
          <label>
            Email o WhatsApp
            <input value={contact} onChange={(event) => setContact(event.target.value)} />
          </label>
          {message ? <p className="field-error" aria-live="polite">{message}</p> : null}
          <button className="button-primary" type="submit">
            <Search size={17} aria-hidden="true" />
            Consultar pedido
          </button>
        </form>
      </div>
    </section>
  );
}
