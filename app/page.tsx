import Image from "next/image";
import type { CSSProperties } from "react";
import { DownloadAppButton } from "./components/download-app-button";
import { HeroShowcase } from "./components/hero-showcase";
import { OperationStory } from "./components/operation-story";
import { WelcomeOffer } from "./components/welcome-offer";
import { SiteLink as Link } from "./components/site-link";
import { assetPath, CURRENT_RELEASE, PRODUCT, resourceGroups } from "../lib/site-data";

export const dynamic = "force-static";

const evidenceScreens = [
  ["atendimentos.webp", "Fila de atendimentos", "Busca no banco completo, filtros e páginas para nunca perder um orçamento."],
  ["orcamento-detalhes.webp", "Orçamento com contexto", "Aprovação, diagnóstico, valores, prazo e linha do tempo no mesmo lugar."],
  ["tecnicos.webp", "Resposta do técnico", "A equipe recebe só o que precisa e a loja revisa antes de enviar ao cliente."],
  ["clientes.webp", "Cliente identificado", "Contatos, aparelhos, histórico e avisos internos para atender com segurança."],
  ["estoque-de-pecas.webp", "Peças sem surpresa", "Reservas, procura, recebimento e movimentação sem planilhas paralelas."],
  ["garantias.webp", "Pós-atendimento", "Retirada e garantia continuam ligadas ao atendimento original."],
] as const;

const statusColumns = [
  { label: "Aguardando aprovação", count: "03", tone: "yellow", items: ["Troca de tela · Carlos", "Conector de carga · Ariane"] },
  { label: "Em manutenção", count: "02", tone: "blue", items: ["iPhone 11 · João", "Samsung A32 · Beatriz"] },
  { label: "Prontos para retirada", count: "04", tone: "green", items: ["Moto G84 · 14:20", "Redmi Note · ontem"] },
] as const;

const releaseMessage = CURRENT_RELEASE.isPrerelease
  ? "Canal Beta opcional para avaliação."
  : "Versão estável recomendada para o uso diário.";

export default function Home() {
  return (
    <main className="as-site">
      <WelcomeOffer />

      <section className="as-hero" aria-labelledby="hero-title">
        <div className="as-hero-grid container">
          <div className="as-hero-copy" data-motion="signal">
            <span className="as-kicker"><i className="bi bi-inbox" /> Menos mensagens perdidas. Mais controle.</span>
            <h1 id="hero-title">Saiba o que falta antes de abrir o WhatsApp.</h1>
            <p>Uma assistência tranquila começa quando a equipe sabe qual orçamento aguarda resposta, qual aparelho está na bancada e qual cliente precisa ser avisado agora.</p>
            <div className="as-hero-actions"><DownloadAppButton className="btn btn-primary btn-lg" /><a className="btn btn-outline-light btn-lg" href={PRODUCT.trialLink}><i className="bi bi-play-circle" /> Testar por {PRODUCT.trialDays} dia</a></div>
            <div className="as-hero-note"><i className="bi bi-check2-circle" /> Sem assinatura automática · dados locais protegidos · Versão {CURRENT_RELEASE.label} {PRODUCT.version} · {releaseMessage}</div>
          </div>
          <HeroShowcase />
          <div className="as-trust-grid" aria-label="Por que a equipe confia no aplicativo" data-motion="trust">
            <span><i className="bi bi-kanban" /><strong>Prioridades visíveis</strong><small>O próximo passo fica claro</small></span>
            <span><i className="bi bi-whatsapp" /><strong>Mensagem no momento certo</strong><small>Texto pronto, envio sob controle</small></span>
            <span><i className="bi bi-shield-check" /><strong>Cliente mais seguro</strong><small>Status, prazo e documentos claros</small></span>
          </div>
        </div>
        <div className="as-hero-gridlines" aria-hidden="true" />
      </section>

      <section className="as-proof-strip" aria-label="Resumo do produto"><div className="container"><span><strong>1 painel para decidir</strong> o que merece atenção</span><span><strong>1 histórico por aparelho</strong> do balcão à garantia</span><span><strong>1 cliente informado</strong> sem promessas confusas</span><Link href="/planos">Ver planos <i className="bi bi-arrow-right" /></Link></div></section>

      <section className="as-section as-clarity-section" data-motion="rise"><div className="container"><div className="as-section-heading"><span className="as-kicker">A rotina real da assistência</span><h2>Chega de descobrir o problema depois que o cliente pergunta.</h2><p>O aplicativo transforma conversas soltas em uma fila visual: cada orçamento tem dono, status, prazo e uma ação simples para a equipe executar.</p></div><div className="as-clarity-grid"><article className="as-clarity-card as-before"><div className="as-card-label"><i className="bi bi-exclamation-triangle" /> Antes</div><h3>O WhatsApp virou sua lista de tarefas.</h3><ul><li>Mensagens misturadas com assuntos pessoais</li><li>Orçamento sem resposta e sem responsável</li><li>Cliente pergunta “já ficou pronto?”</li></ul><div className="as-chaos-stack"><span>“Oi, conseguiu ver meu celular?”</span><span>“Qual era mesmo o valor?”</span><span>“A peça chegou?”</span></div></article><div className="as-clarity-arrow" aria-hidden="true"><i className="bi bi-arrow-right" /></div><article className="as-clarity-card as-after"><div className="as-card-label"><i className="bi bi-check2-circle" /> Depois</div><h3>A bancada mostra o próximo passo.</h3><ul><li>Cards separados por etapa e urgência</li><li>Lembretes para aprovação, peças e retirada</li><li>Mensagem pronta sem procurar o histórico</li></ul><div className="as-mini-board"><strong>Hoje na loja</strong><span><b className="dot yellow" /> 03 aguardando aprovação</span><span><b className="dot blue" /> 02 em manutenção</span><span><b className="dot green" /> 04 prontos para retirada</span></div></article></div></div></section>

      <section className="as-section as-board-section" data-motion="signal"><div className="container as-board-layout"><div className="as-board-copy"><span className="as-kicker">A visão que acalma a equipe</span><h2>Abra o app e saiba o que está acontecendo.</h2><p>Em vez de procurar por nome em dezenas de conversas, a loja começa pelo estado da operação. Cada coluna aponta para uma decisão concreta.</p><div className="as-board-checks"><span><i className="bi bi-funnel" /> Filtre por etapa</span><span><i className="bi bi-clock-history" /> Veja o que está atrasado</span><span><i className="bi bi-person-check" /> Identifique o responsável</span></div><Link className="btn btn-primary" href="/recursos#gestao">Ver como funciona <i className="bi bi-arrow-up-right" /></Link></div><div className="as-status-board" aria-label="Demonstração do painel Hoje na loja"><div className="as-board-top"><span><i className="bi bi-grid-1x2" /> Hoje na loja</span><small>quarta-feira · 10:32</small></div><div className="as-board-columns">{statusColumns.map((column) => <div className="as-board-column" key={column.label}><div className="as-column-title"><span><b className={`dot ${column.tone}`} /> {column.label}</span><strong>{column.count}</strong></div>{column.items.map((item) => <div className="as-board-item" key={item}><span>{item}</span><i className="bi bi-chevron-right" /></div>)}<small className="as-board-link">Ver todos <i className="bi bi-arrow-right" /></small></div>)}</div></div></div></section>

      <section className="as-section as-customer-section" data-motion="rise"><div className="container as-customer-grid"><div className="as-customer-visual"><div className="as-device-frame as-monitor-frame"><div className="as-frame-top"><span /><span /><span /></div><Image src={assetPath("/assets/img/app/current/orcamento-detalhes.webp")} width={2880} height={1800} unoptimized loading="lazy" sizes="(max-width: 991px) 100vw, 56vw" alt="Orçamento detalhado na tela do aplicativo" /></div><div className="as-customer-message"><span className="as-message-icon"><i className="bi bi-whatsapp" /></span><div><small>Mensagem preparada</small><strong>Seu aparelho está pronto para retirada.</strong><span>O cliente recebe contexto, prazo e o próximo passo.</span></div><i className="bi bi-check2-all" /></div></div><div className="as-customer-copy"><span className="as-kicker">Confiança também é comunicação</span><h2>O cliente não precisa insistir para descobrir o status.</h2><p>Quando o orçamento é aprovado, quando a peça chega ou quando o aparelho está pronto, o sistema prepara a mensagem correta para o contato escolhido.</p><ol className="as-customer-steps"><li><b>01</b><span><strong>Status compreensível</strong><small>Sem código interno ou linguagem técnica desnecessária.</small></span></li><li><b>02</b><span><strong>Mensagem revisável</strong><small>A assistência confirma o texto antes de abrir o WhatsApp.</small></span></li><li><b>03</b><span><strong>Histórico preservado</strong><small>O que foi enviado continua ligado ao atendimento.</small></span></li></ol><Link className="text-link" href="/guia#documentos">Conhecer mensagens e templates <i className="bi bi-arrow-right" /></Link></div></div></section>

      <section className="as-section as-flow-section"><div className="container"><div className="as-section-heading as-heading-dark" data-motion="rise"><span className="as-kicker">Da recepção ao pós-atendimento</span><h2>O sistema acompanha o que acontece — na ordem em que acontece.</h2><p>Role para percorrer o fluxo. As capturas mostram a interface do aplicativo com dados fictícios.</p></div><OperationStory /></div></section>

      <section className="as-section as-workbench-section" data-motion="rise"><div className="container as-workbench-grid"><div className="as-workbench-copy"><span className="as-kicker">Uma bancada mais tranquila</span><h2>Menos cobrança interrompendo o reparo.</h2><p>Com responsáveis, prazos e alertas reunidos, a equipe trabalha no aparelho sem depender de memória ou de uma segunda planilha.</p><div className="as-workbench-pills"><span><i className="bi bi-phone" /> Aparelho identificado</span><span><i className="bi bi-box-seam" /> Peça rastreada</span><span><i className="bi bi-shield-check" /> Garantia ligada</span></div></div><div className="as-bench-visual"><div className="as-bench-sticker as-bench-sticker-top"><i className="bi bi-lightning-charge-fill" /> PRIORIDADE 02</div><div className="as-bench-tool as-bench-tool-one"><i className="bi bi-phone" /><span>Samsung A32</span><b>em manutenção</b></div><div className="as-bench-tool as-bench-tool-two"><i className="bi bi-check2-circle" /><span>Peça conferida</span></div><Image src={assetPath("/assets/img/app/current/atendimento-detalhado.webp")} width={2880} height={1800} unoptimized loading="lazy" sizes="(max-width: 991px) 100vw, 58vw" alt="Atendimento detalhado com status e ações da bancada" /><div className="as-bench-tag"><i className="bi bi-tools" /><span><strong>Próxima ação</strong><small>Conferir peça recebida</small></span></div><div className="as-bench-sticker as-bench-sticker-bottom">BANCADA AO VIVO <i className="bi bi-arrow-up-right" /></div></div></div></section>

      <section className="as-section as-capabilities" data-motion="stagger"><div className="container"><div className="as-section-heading" data-motion="rise"><span className="as-kicker">Uma operação, áreas conectadas</span><h2>Completo sem parecer complicado.</h2><p>Os recursos aparecem dentro do fluxo certo, com nomes que a equipe entende e ações que levam ao próximo passo.</p></div><div className="as-capability-grid">{resourceGroups.slice(0, 6).map((group, index) => <article key={group.id}><span>{String(index + 1).padStart(2, "0")}</span><i className={`bi ${group.icon}`} /><small>{group.kicker}</small><h3>{group.title}</h3><p>{group.summary}</p><Link href={`/recursos#${group.id}`}>Explorar área <i className="bi bi-arrow-up-right" /></Link></article>)}</div></div></section>

      <section className="as-section as-evidence" id="telas-reais"><div className="container"><div className="as-section-heading as-heading-dark" data-motion="rise"><span className="as-kicker">Interface que a equipe reconhece</span><h2>Veja o que acontece dentro do aplicativo.</h2><p>Capturas reais da versão {CURRENT_RELEASE.label} {CURRENT_RELEASE.version}, com dados fictícios e sem promessas abstratas.</p></div><div className="as-evidence-grid">{evidenceScreens.map(([file, title, caption], index) => <figure key={file} data-motion="screen" style={{ "--screen-index": index } as CSSProperties}><div><a href={assetPath(`/assets/img/app/current/${file}`)} target="_blank" rel="noopener noreferrer" aria-label={`Abrir ${title} em alta resolução`}><Image src={assetPath(`/assets/img/app/current/${file}`)} width={2880} height={1800} unoptimized loading="lazy" alt={`${title} na interface ${CURRENT_RELEASE.label} ${CURRENT_RELEASE.version}`} /></a></div><figcaption><span>{String(index + 1).padStart(2, "0")}</span><strong>{title}</strong><p>{caption}</p><small><i className="bi bi-check-circle" /> versão {CURRENT_RELEASE.label} {CURRENT_RELEASE.version}</small></figcaption></figure>)}</div><div className="as-centered-action"><Link className="btn btn-outline-light btn-lg" href="/recursos">Ver todos os recursos <i className="bi bi-arrow-right" /></Link></div></div></section>

      <section className="as-section as-continuity"><div className="container as-continuity-grid"><div><span className="as-kicker">Continuidade da loja</span><h2>Fechar uma janela não pode significar perder um dia de trabalho.</h2><p>Banco local criptografado, backups autenticados, cópia externa configurável e atualização assinada protegem a rotina sem esconder o que está acontecendo.</p><div className="as-continuity-points"><span><i className="bi bi-device-ssd" /> Base local</span><span><i className="bi bi-cloud-check" /> Cópia externa</span><span><i className="bi bi-fingerprint" /> Auditoria</span><span><i className="bi bi-arrow-repeat" /> Atualização assinada</span></div></div><Image src={assetPath("/assets/img/app/current/backup.webp")} width={2880} height={1800} unoptimized loading="lazy" sizes="(max-width: 991px) 100vw, 50vw" alt="Central de backup na interface do aplicativo, com dados fictícios" /></div></section>

      <section className="as-final-cta"><div className="container"><div className="as-cta-signal" aria-hidden="true"><span /><span /><span /></div><span className="as-kicker">A próxima entrada pode ser mais simples</span><h2>Faça a assistência respirar entre uma mensagem e outra.</h2><p>Baixe a versão {PRODUCT.version}, solicite o teste gratuito ou compare as modalidades. Todos os planos liberam os mesmos recursos.</p><div className="as-hero-actions"><DownloadAppButton className="btn btn-primary btn-lg" /><a className="btn btn-outline-light btn-lg" href={PRODUCT.trialLink}><i className="bi bi-whatsapp" /> Solicitar teste grátis</a><Link className="btn btn-outline-light btn-lg" href="/planos">Comparar licenças</Link></div></div></section>
    </main>
  );
}
