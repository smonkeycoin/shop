import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { OrderProvider } from "@/components/shop/OrderProvider";
import { ShopProvider } from "@/components/shop/ShopProvider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const title = "Shop NeumoPractice | Cuidado respiratorio";
const description = "Productos seleccionados para hacer más simple el cuidado respiratorio cotidiano.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title,
    description,
    url: "/",
    siteName: "Shop NeumoPractice",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Shop NeumoPractice | Todo para respirar mejor.",
      },
    ],
    locale: "es_MX",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/opengraph-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es-MX" className={`${inter.variable} antialiased`} data-scroll-behavior="smooth">
      <body>
        <ShopProvider>
          <OrderProvider>{children}</OrderProvider>
        </ShopProvider>
      </body>
    </html>
  );
}
