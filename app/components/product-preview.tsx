"use client";

import Image from "next/image";
import { useState } from "react";
import { assetPath } from "../../lib/site-data";

type PreviewView =
  | "dashboard"
  | "atendimentos"
  | "clientes"
  | "novo-orcamento"
  | "aparelhos"
  | "pecas"
  | "garantias"
  | "configuracoes";
type TourArea = "dashboard" | "novo-orcamento" | "atendimentos" | "pecas" | "clientes" | "aparelhos" | "garantias" | "configuracoes";

const previews: Record<PreviewView, { src: string; title: string; description: string }> = {
  dashboard: { src: "/assets/img/app/current/dashboard-principal.webp", title: "Visão geral", description: "Faturamento, alertas, estoque, garantias e prioridades logo na abertura." },
  atendimentos: { src: "/assets/img/app/current/atendimentos.webp", title: "Atendimentos", description: "Orçamentos, serviços, retiradas, vínculos e filtros em uma central." },
  clientes: { src: "/assets/img/app/current/clientes.webp", title: "Clientes", description: "Pesquisa, indicadores, aparelhos e relacionamento de cada cliente." },
  "novo-orcamento": { src: "/assets/img/app/current/novo-orcamento.webp", title: "Novo orçamento", description: "Cadastro guiado com revisão permanente do documento e número público." },
  aparelhos: { src: "/assets/img/app/current/aparelhos.webp", title: "Aparelhos", description: "Compras, estoque, vendas e resultados comerciais em uma central." },
  pecas: { src: "/assets/img/app/current/pesquisa-de-pecas.webp", title: "Pesquisa de peças", description: "Demandas, prioridades, fornecedores e oportunidades de atendimento." },
  garantias: { src: "/assets/img/app/current/garantias.webp", title: "Garantias", description: "Retornos, prazos e serviços ligados ao atendimento original." },
  configuracoes: { src: "/assets/img/app/current/configuracoes.webp", title: "Configurações", description: "Aparência, inicialização, tutoriais, ajuda e diagnóstico do aplicativo." },
};

const tourAreas: Array<{ id: TourArea; view: PreviewView; label: string; icon: string; group: string; description: string }> = [
  { id: "dashboard", view: "dashboard", label: "Visão geral", icon: "bi-grid-1x2", group: "Rotina", description: "Acompanhe prioridades, faturamento, estoque e alertas logo ao abrir o sistema." },
  { id: "novo-orcamento", view: "novo-orcamento", label: "Novo orçamento", icon: "bi-plus-circle", group: "Rotina", description: "Cadastre cliente, aparelho, relato, serviços e condições em uma sequência clara." },
  { id: "atendimentos", view: "atendimentos", label: "Atendimentos", icon: "bi-clock-history", group: "Rotina", description: "Encontre orçamentos e serviços por status, período, cliente, aparelho ou responsável." },
  { id: "pecas", view: "pecas", label: "Pesquisa de peças", icon: "bi-search", group: "Rotina", description: "Acompanhe peças procuradas, urgência, pesquisa e contato com o cliente." },
  { id: "clientes", view: "clientes", label: "Clientes", icon: "bi-people", group: "Cadastros", description: "Consulte contatos, aparelhos e todo o relacionamento de cada cliente." },
  { id: "aparelhos", view: "aparelhos", label: "Aparelhos", icon: "bi-phone", group: "Cadastros", description: "Veja compras, estoque e vendas de aparelhos em uma única central." },
  { id: "garantias", view: "garantias", label: "Garantias", icon: "bi-shield-check", group: "Gestão", description: "Acompanhe garantias abertas e mantenha o retorno ligado ao serviço original." },
  { id: "configuracoes", view: "configuracoes", label: "Configurações", icon: "bi-gear", group: "Gestão", description: "Ajuste aparência, inicialização, ajuda e preferências do aplicativo." },
];

const hotspots: Array<{ area: TourArea; label: string; className: string }> = [
  { area: "novo-orcamento", label: "Abrir novo orçamento", className: "hotspot-new" },
  { area: "dashboard", label: "Abrir visão geral", className: "hotspot-home" },
  { area: "atendimentos", label: "Abrir atendimentos", className: "hotspot-history" },
  { area: "clientes", label: "Abrir clientes", className: "hotspot-clients" },
];

export function ProductPreview() {
  const [active, setActive] = useState<TourArea>("dashboard");
  const area = tourAreas.find((item) => item.id === active) ?? tourAreas[0];
  const preview = previews[area.view];
  const groups = ["Rotina", "Cadastros", "Gestão"];

  return (
    <section className="authentic-product-preview" aria-label="Passeio pelas principais áreas do aplicativo">
      <div className="authentic-preview-toolbar">
        <span><i className="bi bi-grid" /> Conheça o sistema</span>
        <strong>{area.label}</strong>
      </div>
      <div className="authentic-preview-frame">
        <Image key={preview.src} src={assetPath(preview.src)} width={1440} height={900} priority loading="eager" sizes="(max-width: 991px) 100vw, 58vw" alt={`Tela real do aplicativo: ${preview.title}`} />
        {hotspots.map((hotspot) => (
          <button key={hotspot.area} type="button" className={`preview-hotspot ${hotspot.className} ${active === hotspot.area ? "active" : ""}`} aria-label={hotspot.label} aria-pressed={active === hotspot.area} onClick={() => setActive(hotspot.area)}>
            <span>{hotspot.label}</span>
          </button>
        ))}
      </div>
      <div className="authentic-preview-caption" aria-live="polite">
        <span><i className="bi bi-cursor" /> Escolha uma área para conhecer.</span>
        <p><strong>{area.label}</strong> — {area.description}</p>
        <div className="preview-tour-menu" aria-label="Áreas do aplicativo">
          {groups.map((group) => (
            <div className="preview-tour-group" key={group}>
              <small>{group}</small>
              <div>
                {tourAreas.filter((item) => item.group === group).map((item) => (
                  <button key={item.id} type="button" className={active === item.id ? "active" : ""} aria-pressed={active === item.id} onClick={() => setActive(item.id)}>
                    <i className={`bi ${item.icon}`} />{item.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
