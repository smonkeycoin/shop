"use client";

import { FormEvent, useState } from "react";
import { Mail } from "lucide-react";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    setMessage(
      isValid
        ? "Gracias. El formulario visual quedó validado localmente."
        : "Ingresa un correo válido para continuar.",
    );
  }

  return (
    <section className="section-shell newsletter-section">
      <div className="newsletter-panel">
        <div className="newsletter-copy">
          <span className="newsletter-icon" aria-hidden="true">
            <Mail size={24} />
          </span>
          <div>
            <h2>Suscríbete a nuestro newsletter</h2>
            <p>
              Recibe novedades, lanzamientos y consejos prácticos para hacer más simple el cuidado respiratorio.
            </p>
          </div>
        </div>

        <form className="newsletter-form" onSubmit={handleSubmit} noValidate>
          <label className="sr-only" htmlFor="newsletter-email">
            Tu correo electrónico
          </label>
          <input
            id="newsletter-email"
            type="email"
            placeholder="Tu correo electrónico"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <button type="submit">Suscribirme</button>
          <p className="newsletter-status" aria-live="polite">
            {message}
          </p>
        </form>
      </div>
    </section>
  );
}
