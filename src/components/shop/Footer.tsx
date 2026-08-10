import Link from "next/link";
import { Clock, Mail } from "lucide-react";
import { Logo } from "./Logo";

const informationLinks = [
  ["Nosotros", "/nosotros"],
  ["Envíos y devoluciones", "/envios-y-devoluciones"],
  ["Términos y condiciones", "/terminos-y-condiciones"],
  ["Aviso de privacidad", "/aviso-de-privacidad"],
];

const helpLinks = [
  ["Preguntas frecuentes", "/preguntas-frecuentes"],
  ["Guía de compra", "/guia-de-compra"],
  ["Contacto", "/contacto"],
];

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="section-shell footer-main">
        <div className="footer-brand">
          <Logo />
          <p>
            Tienda especializada en productos para terapia respiratoria y cuidado respiratorio cotidiano.
            Seleccionamos soluciones con enfoque comercial responsable.
          </p>
        </div>

        <FooterLinks title="Información" links={informationLinks} />
        <FooterLinks title="Ayuda" links={helpLinks} />

        <div className="footer-column">
          <h2>Contacto</h2>
          <ul>
            <li className="contact-line">
              <Mail size={17} aria-hidden="true" />
              <Link href="mailto:ventas@neumopractice.com">ventas@neumopractice.com</Link>
            </li>
            <li className="contact-line">
              <Clock size={17} aria-hidden="true" />
              <span>Lunes a Viernes 9:00 - 18:00 hrs</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="section-shell footer-bottom">
        <span>© 2024 shop.neumopractice.com. Todos los derechos reservados.</span>
        <span>Desarrollado para hacer más simple el cuidado respiratorio.</span>
      </div>
    </footer>
  );
}

function FooterLinks({ title, links }: { title: string; links: string[][] }) {
  return (
    <div className="footer-column">
      <h2>{title}</h2>
      <ul>
        {links.map(([label, href]) => (
          <li key={href}>
            <Link href={href}>{label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
