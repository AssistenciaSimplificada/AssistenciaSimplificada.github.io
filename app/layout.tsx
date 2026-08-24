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
  title: "Orçamentos Simplificados | Atendimentos para assistência técnica",
  description: "Organize Atendimentos, clientes, aparelhos, peças, pagamentos, garantias e documentos em um aplicativo Windows para assistências técnicas.",
  alternates: { canonical: "/" },
  referrer: "strict-origin-when-cross-origin",
  icons: {
    icon: [{ url: assetPath("/favicon.svg"), type: "image/svg+xml" }, { url: assetPath("/assets/branding/icon-192.png"), sizes: "192x192", type: "image/png" }],
    apple: [{ url: assetPath("/assets/branding/icon-512.png"), sizes: "512x512", type: "image/png" }],
  },
  openGraph: {
    title: "Orçamentos Simplificados",
    description: "Atendimentos, peças, aparelhos, garantias e gestão em um aplicativo Windows para assistência técnica.",
    url: "/",
    siteName: "Orçamentos Simplificados",
    images: [assetPath("/og.png")],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Orçamentos Simplificados",
    description: "Atendimentos, peças, aparelhos, garantias e gestão em um aplicativo Windows para assistência técnica.",
    images: [assetPath("/og.png")],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body><SiteHeader />{children}<SiteFooter /><BackToTop /></body></html>;
}
