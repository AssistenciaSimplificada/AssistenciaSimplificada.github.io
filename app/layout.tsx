import type { Metadata } from "next";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./globals.css";
import { BackToTop } from "./components/back-to-top";
import { SiteFooter } from "./components/site-footer";
import { SiteHeader } from "./components/site-header";
import { SITE_URL } from "../lib/site-data";

export const dynamic = "force-static";
const absoluteSiteAsset = (relativePath: string) =>
  new URL(relativePath.replace(/^\/+/, ""), `${SITE_URL.replace(/\/+$/, "")}/`).toString();

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Assistência Simplificada | Gestão para assistência técnica",
  description: "Organize Atendimentos, clientes, aparelhos, peças, pagamentos, garantias e documentos em um aplicativo Windows para assistências técnicas.",
  alternates: { canonical: "/" },
  referrer: "strict-origin-when-cross-origin",
  icons: {
    icon: [{ url: absoluteSiteAsset("/favicon.svg"), type: "image/svg+xml" }, { url: absoluteSiteAsset("/assets/branding/icon-192.png"), sizes: "192x192", type: "image/png" }],
    apple: [{ url: absoluteSiteAsset("/assets/branding/icon-512.png"), sizes: "512x512", type: "image/png" }],
  },
  openGraph: {
    title: "Assistência Simplificada",
    description: "Atendimentos, peças, aparelhos, garantias e gestão em um aplicativo Windows para assistência técnica.",
    url: "/",
    siteName: "Assistência Simplificada",
    images: [absoluteSiteAsset("/og.png")],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Assistência Simplificada",
    description: "Atendimentos, peças, aparelhos, garantias e gestão em um aplicativo Windows para assistência técnica.",
    images: [absoluteSiteAsset("/og.png")],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body><SiteHeader />{children}<SiteFooter /><BackToTop /></body></html>;
}
