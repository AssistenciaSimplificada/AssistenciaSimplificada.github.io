"use client";

import Image from "next/image";
import { useState } from "react";
import { assetPath, resourceGroups } from "../../lib/site-data";

const screenByResource: Record<string, string> = {
  layouts: "/assets/img/app/current/escolha-layout.webp",
  orcamentos: "/assets/img/app/current/atendimento-detalhado.webp",
  clientes: "/assets/img/app/current/clientes.webp",
  operacao: "/assets/img/app/current/tecnicos.webp",
  garantias: "/assets/img/app/current/garantias.webp",
  aparelhos: "/assets/img/app/current/aparelhos.webp",
  documentos: "/assets/img/app/current/orcamento-detalhes.webp",
  gestao: "/assets/img/app/current/dashboard-principal.webp",
  seguranca: "/assets/img/app/current/backup.webp",
};

export function FeatureExplorer() {
  const [activeId, setActiveId] = useState(resourceGroups[0].id);
  const active = resourceGroups.find((group) => group.id === activeId) ?? resourceGroups[0];

  return (
    <section className="as-feature-explorer" aria-label="Explorador de recursos">
      <div className="as-feature-tabs" role="tablist" aria-label="Áreas do aplicativo">
        {resourceGroups.map((group, index) => (
          <button
            key={group.id}
            type="button"
            role="tab"
            aria-selected={group.id === activeId}
            className={group.id === activeId ? "is-active" : ""}
            onClick={() => setActiveId(group.id)}
          >
            <span>{String(index + 1).padStart(2, "0")}</span>
            <i className={`bi ${group.icon}`} />
            <strong>{group.title}</strong>
            <small>{group.kicker}</small>
          </button>
        ))}
      </div>
      <div className="as-feature-panel" role="tabpanel" aria-live="polite">
        <div className="as-feature-copy">
          <span className="as-kicker">{active.kicker}</span>
          <h2>{active.title}</h2>
          <p>{active.summary}</p>
          <ul>{active.items.map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
        <div className="as-feature-image">
          <Image
            key={active.id}
            src={assetPath(screenByResource[active.id])}
            width={1440}
            height={900}
            unoptimized
            loading="lazy"
            sizes="(max-width: 991px) 100vw, 52vw"
            alt={`Tela real do recurso ${active.title}`}
          />
          <span><i className="bi bi-check2-circle" /> Interface estável · dados fictícios</span>
        </div>
      </div>
    </section>
  );
}
