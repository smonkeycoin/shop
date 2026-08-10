import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Shop NeumoPractice | Productos para terapia respiratoria",
  description:
    "Productos especializados para terapia respiratoria, higiene nasal, nebulización, aerocámaras y monitoreo respiratorio.",
  openGraph: {
    title: "Shop NeumoPractice | Productos para terapia respiratoria",
    description:
      "Tienda especializada en productos respiratorios seleccionados para pacientes, familias y profesionales de la salud.",
    url: "https://shop.neumopractice.com",
    siteName: "Shop NeumoPractice",
    locale: "es_MX",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es-MX" className={`${inter.variable} antialiased`} data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
