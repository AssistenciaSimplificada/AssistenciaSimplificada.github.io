import type { Metadata } from "next";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./globals.css";
import { BackToTop } from "./components/back-to-top";
import { SiteFooter } from "./components/site-footer";
import { SiteHeader } from "./components/site-header";

export const metadata: Metadata = {
  title: "Orçamentos Simplificados | Gestão para assistência técnica",
  description: "Organize orçamentos, clientes, aparelhos, serviços, peças, garantias e documentos em um aplicativo Windows feito para assistências técnicas.",
  icons: { icon: "/assets/branding/icon-192.png" },
  openGraph: {
    title: "Orçamentos Simplificados",
    description: "Mais organização da entrada do aparelho até a entrega.",
    images: ["/og.png"],
    locale: "pt_BR",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body><SiteHeader />{children}<SiteFooter /><BackToTop /></body></html>;
}
