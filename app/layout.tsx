import type { Metadata } from "next";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./globals.css";
import { BackToTop } from "./components/back-to-top";
import { SiteFooter } from "./components/site-footer";
import { SiteHeader } from "./components/site-header";
import { assetPath, SITE_URL } from "../lib/site-data";

export const dynamic = "force-static";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Orçamentos Simplificados | Gestão para assistência técnica",
  description: "Organize orçamentos, clientes, aparelhos, serviços, peças, garantias e documentos em um aplicativo Windows feito para assistências técnicas.",
  alternates: { canonical: "/" },
  referrer: "strict-origin-when-cross-origin",
  icons: {
    icon: [{ url: assetPath("/favicon.svg"), type: "image/svg+xml" }, { url: assetPath("/assets/branding/icon-192.png"), sizes: "192x192", type: "image/png" }],
    apple: [{ url: assetPath("/assets/branding/icon-512.png"), sizes: "512x512", type: "image/png" }],
  },
  openGraph: {
    title: "Orçamentos Simplificados",
    description: "Mais organização da entrada do aparelho até a entrega.",
    url: "/",
    siteName: "Orçamentos Simplificados",
    images: [assetPath("/og.png")],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Orçamentos Simplificados",
    description: "Mais organização da entrada do aparelho até a entrega.",
    images: [assetPath("/og.png")],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body><SiteHeader />{children}<SiteFooter /><BackToTop /></body></html>;
}
