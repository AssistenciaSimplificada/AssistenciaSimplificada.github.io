import type { Metadata } from "next";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./globals.css";
import "./marketing-refresh.css";
import { BackToTop } from "./components/back-to-top";
import { SiteFooter } from "./components/site-footer";
import { SiteHeader } from "./components/site-header";
import { PRODUCT, SITE_URL } from "../lib/site-data";
import { SITE_COMMERCIAL_CONFIG } from "../lib/product-config";

export const dynamic = "force-static";
const absoluteSiteAsset = (relativePath: string) =>
  new URL(relativePath.replace(/^\/+/, ""), `${SITE_URL.replace(/\/+$/, "")}/`).toString();

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: `${PRODUCT.name} | Sistema para assistência técnica`,
  description: `Organize orçamentos, ordens de serviço, técnicos, peças, clientes, pagamentos, documentos, retirada e garantia em um aplicativo Windows.`,
  authors: [{ name: PRODUCT.authorName, url: SITE_URL }],
  creator: PRODUCT.authorName,
  publisher: PRODUCT.name,
  keywords: ["software para assistência técnica", "gestão de assistência técnica", "ordem de serviço", "orçamento para conserto", PRODUCT.authorName, PRODUCT.name],
  alternates: { canonical: "/" },
  referrer: "strict-origin-when-cross-origin",
  icons: {
    icon: [{ url: absoluteSiteAsset("/favicon.svg"), type: "image/svg+xml" }, { url: absoluteSiteAsset("/assets/branding/icon-192.png"), sizes: "192x192", type: "image/png" }],
    apple: [{ url: absoluteSiteAsset("/assets/branding/icon-512.png"), sizes: "512x512", type: "image/png" }],
  },
  openGraph: {
    title: `Cada aparelho no lugar. Cada etapa sob controle. | ${PRODUCT.name}`,
    description: "Gestão completa para assistências técnicas no Windows: do orçamento à garantia.",
    url: "/",
    siteName: PRODUCT.name,
    images: [absoluteSiteAsset("/og.png")],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `Cada aparelho no lugar. Cada etapa sob controle. | ${PRODUCT.name}`,
    description: "Gestão completa para assistências técnicas no Windows: do orçamento à garantia.",
    images: [absoluteSiteAsset("/og.png")],
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: PRODUCT.name,
      url: SITE_URL,
      logo: absoluteSiteAsset("/assets/branding/icon-512.png"),
      founder: { "@type": "Person", name: PRODUCT.authorName },
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${SITE_URL}/#software`,
      name: PRODUCT.name,
      softwareVersion: PRODUCT.version,
      url: SITE_URL,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Windows 10, Windows 11",
      author: { "@type": "Person", name: PRODUCT.authorName },
      publisher: { "@id": `${SITE_URL}/#organization` },
      description: metadata.description,
      featureList: [
        "Orçamentos e ordens de serviço",
        "Aprovação e revisão imutável",
        "Painel e convite temporário para técnicos",
        "Clientes, aparelhos e atenção interna",
        "Peças, estoque, compras e vendas",
        "Garantias, retiradas e aparelhos abandonados",
        "PDFs, etiquetas e templates",
        "Backup protegido e restauração validada",
      ],
      offers: {
        "@type": "AggregateOffer",
        priceCurrency: "BRL",
        lowPrice: (SITE_COMMERCIAL_CONFIG.plans.monthly.priceCents / 100).toFixed(2),
        highPrice: (SITE_COMMERCIAL_CONFIG.plans.permanent.priceCents / 100).toFixed(2),
        offerCount: Object.keys(SITE_COMMERCIAL_CONFIG.plans).length,
      },
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: PRODUCT.name,
      url: SITE_URL,
      inLanguage: "pt-BR",
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
    {
      "@type": "Person",
      "@id": `${SITE_URL}/#gabriel-schmeisk`,
      name: PRODUCT.authorName,
      jobTitle: `Criador da ${PRODUCT.name}`,
      worksFor: { "@id": `${SITE_URL}/#organization` },
    },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} /><SiteHeader />{children}<SiteFooter /><BackToTop /></body></html>;
}
