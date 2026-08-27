"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { assetPath } from "../../lib/site-data";

const stages = [
  {
    id: "receber",
    number: "01",
    eyebrow: "Receber",
    title: "Cliente e aparelho entram uma vez.",
    text: "Cadastre pessoa ou empresa, contatos, aparelho, acessórios, relato e condição visual. Clientes com atenção interna são sinalizados antes de um novo orçamento.",
    src: "/assets/img/app/current/novo-orcamento.webp",
    bullets: ["Autocompletar clientes", "Aparelhos e acessórios", "Aviso de atenção interna"],
  },
  {
    id: "avaliar",
    number: "02",
    eyebrow: "Avaliar",
    title: "O técnico responde só o que precisa.",
    text: "Convite individual válido por 8 horas, senha opcional e revogação automática após edição. Diagnóstico, resultado e múltiplas peças ou valores voltam para revisão da loja.",
    src: "/assets/img/app/current/tecnicos.webp",
    bullets: ["Senha de 4 a 12 dígitos", "Link temporário e revogável", "Resposta revisada pela loja"],
  },
  {
    id: "aprovar",
    number: "03",
    eyebrow: "Aprovar",
    title: "A versão aceita fica registrada.",
    text: "Orçamentos com alternativas podem seguir para aprovação antes da escolha final. Canal, responsável, valor aceito, descontos e revisões permanecem auditáveis.",
    src: "/assets/img/app/current/orcamento-detalhes.webp",
    bullets: ["Alternativas para o cliente", "Desconto editável", "Aprovação preservada"],
  },
  {
    id: "executar",
    number: "04",
    eyebrow: "Executar",
    title: "A bancada sabe qual é a próxima ação.",
    text: "Equipe, serviços, valores, pagamento e status ocupam o mesmo cartão. Revisões durante a manutenção criam nova proposta sem apagar o orçamento aprovado.",
    src: "/assets/img/app/current/atendimento-detalhado.webp",
    bullets: ["Ações separadas de ferramentas", "Pagamento e saldo", "Revisão sem sobrescrever"],
  },
  {
    id: "entregar",
    number: "05",
    eyebrow: "Entregar e acompanhar",
    title: "Retirada, documentos e garantia fecham o ciclo.",
    text: "Acessórios para devolver ganham destaque, documentos são gerados na pasta escolhida e qualquer retorno de garantia permanece ligado ao atendimento original.",
    src: "/assets/img/app/current/garantias.webp",
    bullets: ["Conferência de retirada", "PDFs padronizados", "Garantia vinculada"],
  },
] as const;

export function OperationStory() {
  const [active, setActive] = useState<(typeof stages)[number]["id"]>(stages[0].id);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const cards = Array.from(root.querySelectorAll<HTMLElement>("[data-story-stage]"));
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((left, right) => right.intersectionRatio - left.intersectionRatio)[0];
        const id = visible?.target.getAttribute("data-story-stage");
        if (id) setActive(id as (typeof stages)[number]["id"]);
      },
      { threshold: [0.35, 0.6, 0.85], rootMargin: "-20% 0px -35%" },
    );
    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="as-story" ref={rootRef}>
      <div className="as-story-media" aria-live="polite">
        <div className="as-story-frame">
          {stages.map((stage) => (
            <Image
              key={stage.id}
              className={stage.id === active ? "is-active" : ""}
              src={assetPath(stage.src)}
              width={1440}
              height={900}
              loading="lazy"
              sizes="(max-width: 991px) 100vw, 52vw"
              alt={`Tela real do fluxo: ${stage.eyebrow}`}
            />
          ))}
          <div className="as-story-progress" aria-hidden="true">
            {stages.map((stage) => <span key={stage.id} className={stage.id === active ? "is-active" : ""} />)}
          </div>
        </div>
      </div>
      <div className="as-story-copy">
        {stages.map((stage) => (
          <article key={stage.id} data-story-stage={stage.id} className={stage.id === active ? "is-active" : ""}>
            <span className="as-story-number">{stage.number}</span>
            <div>
              <span className="as-kicker">{stage.eyebrow}</span>
              <h3>{stage.title}</h3>
              <p>{stage.text}</p>
              <ul>{stage.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
