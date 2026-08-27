import type { Metadata } from "next";
import { GuideSearch } from "../components/guide-search";
import { PageHero } from "../components/page-hero";
import { PRODUCT } from "../../lib/site-data";

export const dynamic = "force-static";
export const metadata: Metadata = { title: `Guia da versão ${PRODUCT.version} | ${PRODUCT.name}`, description: "Manual pesquisável: instalação, orçamentos, técnicos, clientes, garantias, documentos, automações, backup e segurança.", alternates: { canonical: "/guia" } };

export default function GuiaPage() {
  return (
    <main className="as-secondary-page">
      <PageHero eyebrow="Manual completo" title="Da primeira ativação ao pós-atendimento." description="Pesquise uma tarefa, filtre por área e siga os fluxos conferidos na versão atual." />
      <section className="guide-section">
        <div className="container">
          <div className="guide-notice"><i className="bi bi-info-circle" /><div><strong>Guia da versão {PRODUCT.version}</strong><span>Inclui os fluxos atuais de técnicos, portabilidade, atenção interna, garantia, nomes de exibição, backup e licença.</span></div></div>
          <GuideSearch />
        </div>
      </section>
    </main>
  );
}
