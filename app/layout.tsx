import type { Metadata } from "next";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./globals.css";
import { BackToTop } from "./components/back-to-top";
import { SiteFooter } from "./components/site-footer";
import { SiteHeader } from "./components/site-header";
import { assetPath } from "../lib/site-data";

export const dynamic = "force-static";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://orcamentos-simplificados.bielzinhovale.chatgpt.site";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Orçamentos Simplificados | Gestão para assistência técnica",
  description: "Organize orçamentos, clientes, aparelhos, serviços, peças, garantias e documentos em um aplicativo Windows feito para assistências técnicas.",
  icons: { icon: assetPath("/assets/branding/icon-192.png") },
  openGraph: {
    title: "Orçamentos Simplificados",
    description: "Mais organização da entrada do aparelho até a entrega.",
    images: [assetPath("/og.png")],
    locale: "pt_BR",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body><SiteHeader />{children}<SiteFooter /><BackToTop /></body></html>;
}
