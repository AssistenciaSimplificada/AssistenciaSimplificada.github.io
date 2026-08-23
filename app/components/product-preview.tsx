"use client";

import Image from "next/image";
import { useState } from "react";
import { assetPath } from "../../lib/site-data";

type PreviewView =
  | "inicio"
  | "historico"
  | "clientes"
  | "novo"
  | "aparelhos"
  | "estoque"
  | "garantias"
  | "relatorios"
  | "configuracoes";
type TourArea = "inicio" | "novo" | "historico" | "clientes" | "aparelhos" | "estoque" | "garantias" | "relatorios" | "configuracoes";

const previews: Record<PreviewView, { src: string; title: string; description: string }> = {
  inicio: { src: "/assets/img/app/inicio-real.png", title: "Visão geral", description: "Indicadores, alertas e prioridades da operação." },
  historico: { src: "/assets/img/app/historico-real.png", title: "Histórico", description: "Atendimentos, filtros, vínculos e andamento em uma única tela." },
  clientes: { src: "/assets/img/app/clientes-real.png", title: "Clientes", description: "Pesquisa, aparelhos e histórico de cada cliente." },
  novo: { src: "/assets/img/app/novo-orcamento-real.png", title: "Novo orçamento", description: "Cadastro guiado do cliente, aparelho, serviço e condições." },
  aparelhos: { src: "/assets/img/app/aparelhos-real.png", title: "Aparelhos", description: "Compras, estoque, vendas e imagens reunidos em uma central." },
  estoque: { src: "/assets/img/app/estoque-real.png", title: "Estoque de peças", description: "Saldos, custos, compatibilidade e movimentações de peças." },
  garantias: { src: "/assets/img/app/garantias-real.png", title: "Garantias", description: "Retornos, prazos e histórico ligados ao atendimento original." },
  relatorios: { src: "/assets/img/app/relatorios-real.png", title: "Relatórios", description: "Exportação contábil e indicadores da operação." },
  configuracoes: { src: "/assets/img/app/configuracoes-real.png", title: "Configurações", description: "Aparência, inicialização, ajuda e preferências do aplicativo." },
};

const tourAreas: Array<{ id: TourArea; view: PreviewView; label: string; icon: string; group: string; description: string }> = [
  { id: "inicio", view: "inicio", label: "Visão geral", icon: "bi-speedometer2", group: "Rotina", description: "Acompanhe prioridades, valores e alertas logo ao abrir o sistema." },
  { id: "novo", view: "novo", label: "Novo orçamento", icon: "bi-plus-circle", group: "Rotina", description: "Cadastre cliente, aparelho, relato, serviços e condições em uma sequência clara." },
  { id: "historico", view: "historico", label: "Histórico", icon: "bi-clock-history", group: "Rotina", description: "Encontre atendimentos por status, período, cliente, aparelho ou responsável." },
  { id: "clientes", view: "clientes", label: "Clientes", icon: "bi-people", group: "Atendimento", description: "Consulte contatos, aparelhos e todo o relacionamento de cada cliente." },
  { id: "aparelhos", view: "aparelhos", label: "Aparelhos", icon: "bi-phone", group: "Atendimento", description: "Veja compras, estoque, vendas e imagens de aparelhos em uma única central." },
  { id: "estoque", view: "estoque", label: "Estoque de peças", icon: "bi-box-seam", group: "Atendimento", description: "Controle entradas, usos, saldos mínimos, custos e compatibilidade das peças." },
  { id: "garantias", view: "garantias", label: "Garantias", icon: "bi-shield-check", group: "Gestão", description: "Acompanhe garantias abertas e mantenha o retorno ligado ao serviço original." },
  { id: "relatorios", view: "relatorios", label: "Relatórios", icon: "bi-bar-chart", group: "Gestão", description: "Exporte dados contábeis e reúna indicadores para entender o desempenho da loja." },
  { id: "configuracoes", view: "configuracoes", label: "Configurações", icon: "bi-gear", group: "Gestão", description: "Ajuste aparência, inicialização, ajuda e preferências do aplicativo." },
];

const hotspots: Array<{ area: TourArea; label: string; className: string }> = [
  { area: "novo", label: "Abrir novo orçamento", className: "hotspot-new" },
  { area: "inicio", label: "Abrir visão geral", className: "hotspot-home" },
  { area: "historico", label: "Abrir histórico", className: "hotspot-history" },
  { area: "clientes", label: "Abrir clientes", className: "hotspot-clients" },
];

export function ProductPreview() {
  const [active, setActive] = useState<TourArea>("inicio");
  const area = tourAreas.find((item) => item.id === active) ?? tourAreas[0];
  const preview = previews[area.view];
  const groups = ["Rotina", "Atendimento", "Gestão"];

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
