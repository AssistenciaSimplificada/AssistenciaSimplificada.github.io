import type { Metadata } from "next";
import { GuideSearch } from "../components/guide-search";
import { PageHero } from "../components/page-hero";

export const metadata: Metadata = { title: "Guia completo | Orçamentos Simplificados", description: "Manual pesquisável do aplicativo: instalação, orçamentos, clientes, aparelhos, garantias, documentos, backup e segurança." };

export default function GuiaPage() { return <main><PageHero eyebrow="Manual completo" title="Aprenda no ritmo da sua operação." description="Pesquise uma tarefa, filtre por área e siga orientações baseadas na versão atual do aplicativo." /><section className="guide-section"><div className="container"><div className="guide-notice"><i className="bi bi-info-circle" /><div><strong>Guia da versão 8.0.1</strong><span>Os nomes de telas e regras abaixo foram comparados com o código e a ajuda interna do aplicativo.</span></div></div><GuideSearch /></div></section></main>; }
