import { Headphones, ShieldCheck, Stethoscope, Truck } from "lucide-react";

const benefits = [
  {
    icon: Truck,
    title: "Envíos rápidos a todo México",
    subtitle: "Cobertura nacional",
  },
  {
    icon: ShieldCheck,
    title: "Productos originales y garantizados",
    subtitle: "Distribuidores autorizados",
  },
  {
    icon: Stethoscope,
    title: "Especialistas en terapia respiratoria",
    subtitle: "Respaldo profesional",
  },
  {
    icon: Headphones,
    title: "Atención personalizada",
    subtitle: "Soporte para profesionales",
  },
];

export function TrustBar() {
  return (
    <section className="section-shell trust-bar" aria-label="Beneficios de compra">
      {benefits.map((benefit) => {
        const Icon = benefit.icon;

        return (
          <article className="trust-item" key={benefit.title}>
            <span className="trust-icon" aria-hidden="true">
              <Icon size={22} />
            </span>
            <div>
              <h3>{benefit.title}</h3>
              <p>{benefit.subtitle}</p>
            </div>
          </article>
        );
      })}
    </section>
  );
}
