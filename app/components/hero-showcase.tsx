"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { assetPath, CURRENT_RELEASE, PRODUCT } from "../../lib/site-data";

const scenes = [
  {
    id: "visao-geral",
    label: "Visão geral",
    icon: "bi-grid-1x2",
    src: "/assets/img/app/current/dashboard-principal.webp",
    title: "A loja inteira em uma abertura",
    detail: "Faturamento, pendências, estoque, garantias e prioridades.",
    signal: "9 pendências organizadas",
  },
  {
    id: "atendimento",
    label: "Atendimentos",
    icon: "bi-wrench-adjustable-circle",
    src: "/assets/img/app/current/atendimentos.webp",
    title: "Histórico completo sem perder registros",
    detail: "Busca, filtros, indicadores globais e páginas acessíveis em bases extensas.",
    signal: "Consulta o banco completo",
  },
  {
    id: "orcamento",
    label: "Orçamento",
    icon: "bi-file-earmark-check",
    src: "/assets/img/app/current/orcamento-detalhes.webp",
    title: "Aprovação e execução sem perder contexto",
    detail: "Versão aceita, responsável, diagnóstico, valores e linha do tempo.",
    signal: "Registro de aprovação imutável",
  },
  {
    id: "garantia",
    label: "Garantia",
    icon: "bi-shield-check",
    src: "/assets/img/app/current/garantias.webp",
    title: "O pós-atendimento continua conectado",
    detail: "Retorno ligado ao serviço original, com prazo, decisão e responsável.",
    signal: "5 garantias demonstrativas",
  },
] as const;

export function HeroShowcase() {
  const [activeId, setActiveId] = useState<(typeof scenes)[number]["id"]>(scenes[0].id);
  const [paused, setPaused] = useState(false);
  const activeIndex = scenes.findIndex((scene) => scene.id === activeId);
  const active = useMemo(() => scenes[Math.max(0, activeIndex)], [activeIndex]);

  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => {
      setActiveId((current) => {
        const index = scenes.findIndex((scene) => scene.id === current);
        return scenes[(index + 1) % scenes.length].id;
      });
    }, 5600);
    return () => window.clearInterval(timer);
  }, [paused]);

  return (
    <section
      className="as-product-stage"
      data-motion="hero-stage"
      aria-label="Telas reais do aplicativo"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="as-stage-bar">
        <span><i className="bi bi-windows" /> Aplicativo real</span>
        <span className="as-stage-version">versão {CURRENT_RELEASE.label} {CURRENT_RELEASE.version}</span>
      </div>
      <div className="as-stage-screen" data-scene={active.id}>
        <Image
          key={active.id}
          className="is-active"
          src={assetPath(active.src)}
          width={2880}
          height={1800}
          unoptimized
          priority={active.id === scenes[0].id}
          loading={active.id === scenes[0].id ? "eager" : "lazy"}
          sizes="(max-width: 991px) 100vw, 58vw"
          alt={`Tela real da ${PRODUCT.name}: ${active.label}`}
        />
      </div>
      <div className="as-whatsapp-proof" aria-hidden="true">
        <span><i className="bi bi-whatsapp" /></span>
        <div><small>Mensagem pronta para o cliente</small><strong>Olá, Carlos! O serviço foi concluído e seu aparelho está pronto.</strong></div>
        <i className="bi bi-check2-circle" />
      </div>
        <div className="as-screen-signal" aria-live="polite">
          <span>{active.signal}</span>
          <strong>{active.title}</strong>
          <small>{active.detail}</small>
          <a href={assetPath(active.src)} target="_blank" rel="noopener noreferrer">Abrir captura em alta resolução</a>
        </div>
      <div className="as-stage-tabs" role="tablist" aria-label="Escolha uma tela">
        {scenes.map((scene, index) => (
          <button
            key={scene.id}
            type="button"
            role="tab"
            aria-selected={scene.id === active.id}
            className={scene.id === active.id ? "is-active" : ""}
            onClick={() => setActiveId(scene.id)}
          >
            <span>{String(index + 1).padStart(2, "0")}</span>
            <i className={`bi ${scene.icon}`} />
            {scene.label}
          </button>
        ))}
      </div>
    </section>
  );
}
