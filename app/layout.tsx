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
  description: "Organize Atendimentos, clientes, técnicos, peças, prazos, garantias, automações e documentos em um aplicativo Windows para assistências técnicas.",
  authors: [{ name: "Gabriel Schmeisk", url: SITE_URL }],
  creator: "Gabriel Schmeisk",
  publisher: "Assistência Simplificada",
  keywords: ["software para assistência técnica", "gestão de assistência técnica", "ordem de serviço", "orçamento para conserto", "Gabriel Schmeisk", "Assistência Simplificada"],
  alternates: { canonical: "/" },
  referrer: "strict-origin-when-cross-origin",
  icons: {
    icon: [{ url: absoluteSiteAsset("/favicon.svg"), type: "image/svg+xml" }, { url: absoluteSiteAsset("/assets/branding/icon-192.png"), sizes: "192x192", type: "image/png" }],
    apple: [{ url: absoluteSiteAsset("/assets/branding/icon-512.png"), sizes: "512x512", type: "image/png" }],
  },
  openGraph: {
    title: "Assistência Simplificada",
    description: "Atendimentos, técnicos, prazos, peças, garantias e automações em um aplicativo Windows para assistência técnica.",
    url: "/",
    siteName: "Assistência Simplificada",
    images: [absoluteSiteAsset("/og.png")],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Assistência Simplificada",
    description: "Atendimentos, técnicos, prazos, peças, garantias e automações em um aplicativo Windows para assistência técnica.",
    images: [absoluteSiteAsset("/og.png")],
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "Assistência Simplificada",
      url: SITE_URL,
      logo: absoluteSiteAsset("/assets/branding/icon-512.png"),
      founder: { "@type": "Person", name: "Gabriel Schmeisk" },
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${SITE_URL}/#software`,
      name: "Assistência Simplificada",
      url: SITE_URL,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Windows 10, Windows 11",
      author: { "@type": "Person", name: "Gabriel Schmeisk" },
      publisher: { "@id": `${SITE_URL}/#organization` },
      description: metadata.description,
      offers: { "@type": "AggregateOffer", priceCurrency: "BRL", lowPrice: "27.99", highPrice: "119.99", offerCount: 4 },
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: "Assistência Simplificada",
      url: SITE_URL,
      inLanguage: "pt-BR",
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
    {
      "@type": "Person",
      "@id": `${SITE_URL}/#gabriel-schmeisk`,
      name: "Gabriel Schmeisk",
      jobTitle: "Criador da Assistência Simplificada",
      worksFor: { "@id": `${SITE_URL}/#organization` },
    },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} /><SiteHeader />{children}<SiteFooter /><BackToTop /></body></html>;
}
