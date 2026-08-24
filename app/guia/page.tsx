import type { Metadata } from "next";
import { PRODUCT } from "@/lib/site-data";
import { GuideSearch } from "../components/guide-search";
import { PageHero } from "../components/page-hero";

export const metadata: Metadata = { title: "Guia da versão 8.2 | Orçamentos Simplificados", description: "Manual pesquisável: instalação, ativação, Atendimentos, clientes, aparelhos, garantias, documentos, backup e segurança.", alternates: { canonical: "/guia" } };

export default function GuiaPage() { return <main><PageHero eyebrow="Manual completo" title="Aprenda no ritmo da sua operação." description="Pesquise uma tarefa, filtre por área e siga o passo a passo de cada rotina." /><section className="guide-section"><div className="container"><div className="guide-notice"><i className="bi bi-info-circle" /><div><strong>Guia da versão {PRODUCT.version}</strong><span>Use a busca para ir direto ao atendimento, documento ou configuração que precisa.</span></div></div><GuideSearch /></div></section></main>; }
