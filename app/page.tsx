import Image from "next/image";
import type { CSSProperties } from "react";
import { DownloadAppButton } from "./components/download-app-button";
import { HeroShowcase } from "./components/hero-showcase";
import { MediaGallery } from "./components/media-gallery";
import { OperationStory } from "./components/operation-story";
import { ScrollMotion } from "./components/scroll-motion";
import { SiteLink as Link } from "./components/site-link";
import { assetPath, PRODUCT, resourceGroups } from "../lib/site-data";

export const dynamic = "force-static";

const evidenceScreens = [
  ["atendimento-detalhado.webp", "Atendimento aberto", "Serviços, equipe, valor, status e próximas ações no mesmo cartão."],
  ["orcamento-detalhes.webp", "Orçamento auditável", "Aprovação, diagnóstico, valores, prazo e linha do tempo em uma visualização."],
  ["clientes.webp", "Clientes e empresas", "Contatos, aparelhos, histórico, atenção interna e portabilidade de dados."],
  ["estoque-de-pecas.webp", "Estoque de peças", "Saldos, reservas por orçamento, custos e movimentações sem quantidade negativa."],
  ["backup.webp", "Backup e restauração", "Cópias protegidas, teste de restauração, importação e exportação completa."],
  ["licenca.webp", "Licença transparente", "Prazo, instalação, renovação, observações administrativas e estado de validação."],
] as const;

export default function Home() {
  return (
    <main className="as-site">
      <ScrollMotion />

      <section className="as-hero">
        <div className="as-hero-grid container">
          <div className="as-hero-copy" data-motion="signal">
            <span className="as-kicker"><i className="bi bi-windows" /> Gestão completa para assistências técnicas</span>
            <h1>Cada aparelho no lugar.<br /><em>Cada etapa sob controle.</em></h1>
            <p>Orçamentos, bancada, peças, clientes, documentos e garantia conectados em um aplicativo Windows feito para a rotina real da assistência.</p>
            <div className="as-hero-actions">
              <DownloadAppButton className="btn btn-primary btn-lg" />
              <a className="btn btn-outline-light btn-lg" href={PRODUCT.trialLink}><i className="bi bi-play-circle" /> Testar por {PRODUCT.trialDays} dia</a>
            </div>
            <div className="as-trust-grid" aria-label="Características principais">
              <span><i className="bi bi-database-lock" /><strong>Banco local criptografado</strong><small>Operação preservada no computador</small></span>
              <span><i className="bi bi-shield-check" /><strong>Backup protegido</strong><small>Cópia externa e restauração validada</small></span>
              <span><i className="bi bi-patch-check" /><strong>Versão {PRODUCT.version}</strong><small>Instalador e atualizações assinados</small></span>
            </div>
          </div>
          <HeroShowcase />
        </div>
        <div className="as-hero-gridlines" aria-hidden="true" />
      </section>

      <section className="as-proof-strip" aria-label="Resumo do produto">
        <div className="container">
          <span><strong>1 fluxo conectado</strong> da entrada à garantia</span>
          <span><strong>Todos os recursos</strong> em qualquer modalidade</span>
          <span><strong>Dados demonstrativos</strong> separados do banco real</span>
          <Link href="/planos">Ver planos <i className="bi bi-arrow-right" /></Link>
        </div>
      </section>

      <section className="as-section as-outcomes" data-motion="stagger">
        <div className="container">
          <div className="as-section-heading">
            <span className="as-kicker">O problema não é falta de trabalho</span>
            <h2>É o trabalho se espalhar entre conversa, papel e memória.</h2>
            <p>A Assistência Simplificada transforma cada atendimento em um registro pesquisável, com responsáveis, prazos e documentos no lugar certo.</p>
          </div>
          <div className="as-outcome-grid">
            <article><span>01</span><i className="bi bi-search" /><h3>Encontre sem caçar</h3><p>Pesquise por cliente, telefone, orçamento, OS, aparelho, IMEI, serviço ou responsável.</p></article>
            <article><span>02</span><i className="bi bi-arrow-left-right" /><h3>Continue sem redigitar</h3><p>Cliente, aparelho, técnico, peças, pagamento, documentos e garantia compartilham o mesmo contexto.</p></article>
            <article><span>03</span><i className="bi bi-journal-check" /><h3>Decida com histórico</h3><p>Aprovações, revisões, contatos, alterações sensíveis e motivos ficam registrados para consulta.</p></article>
          </div>
        </div>
      </section>

      <section className="as-section as-flow-section">
        <div className="container">
          <div className="as-section-heading as-heading-dark">
            <span className="as-kicker">Da recepção ao pós-atendimento</span>
            <h2>O sistema acompanha o que acontece — na ordem em que acontece.</h2>
            <p>Role para percorrer o fluxo. Cada etapa usa uma tela real da versão atual.</p>
          </div>
          <OperationStory />
        </div>
      </section>

      <section className="as-section as-capabilities" data-motion="stagger">
        <div className="container">
          <div className="as-section-heading">
            <span className="as-kicker">Uma operação, oito áreas conectadas</span>
            <h2>Profundo onde precisa. Simples no balcão.</h2>
            <p>Os recursos são completos, mas aparecem dentro do fluxo certo — sem obrigar a equipe a montar controles paralelos.</p>
          </div>
          <div className="as-capability-grid">
            {resourceGroups.map((group, index) => (
              <article key={group.id}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <i className={`bi ${group.icon}`} />
                <small>{group.kicker}</small>
                <h3>{group.title}</h3>
                <p>{group.summary}</p>
                <Link href={`/recursos#${group.id}`}>Explorar área <i className="bi bi-arrow-up-right" /></Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="as-section as-remote-section" data-motion="draw">
        <div className="container as-remote-grid">
          <div className="as-remote-visual">
            <Image src={assetPath("/assets/img/app/current/tecnicos.webp")} width={1440} height={900} loading="lazy" sizes="(max-width: 991px) 100vw, 55vw" alt="Configuração real dos técnicos e avisos recebidos" />
            <div className="as-security-orbit" aria-hidden="true"><i className="bi bi-lock" /><span>8h</span><small>convite individual</small></div>
          </div>
          <div className="as-remote-copy">
            <span className="as-kicker">O técnico pode responder fora do balcão</span>
            <h2>Um link temporário. Só o atendimento necessário.</h2>
            <p>O painel completo continua no computador principal. Para outro dispositivo, a loja envia um convite individual e revisa a resposta antes de alterar o orçamento.</p>
            <ul className="as-check-list">
              <li>Validade de 8 horas e senha numérica opcional</li>
              <li>A senha nunca é incluída no endereço do convite</li>
              <li>Editar o orçamento invalida o link anterior</li>
              <li>Múltiplas peças e valores por serviço</li>
              <li>Diagnóstico e resultado só entram após a confirmação da loja</li>
            </ul>
            <Link className="btn btn-primary" href="/recursos#operacao">Conhecer o fluxo técnico</Link>
          </div>
        </div>
      </section>

      <section className="as-section as-evidence" id="telas-reais">
        <div className="container">
          <div className="as-section-heading as-heading-dark">
            <span className="as-kicker">Sem ilustração genérica</span>
            <h2>Esta é a versão que você instala.</h2>
            <p>Capturas realizadas no ambiente demonstrativo da versão {PRODUCT.version}, com dados fictícios e os mesmos fluxos do aplicativo.</p>
          </div>
          <div className="as-evidence-grid">
            {evidenceScreens.map(([file, title, caption], index) => (
              <figure key={file} data-motion="screen" style={{ "--screen-index": index } as CSSProperties}>
                <div><Image src={assetPath(`/assets/img/app/current/${file}`)} width={1440} height={900} loading="lazy" sizes="(max-width: 767px) 100vw, 50vw" alt={`${title} na versão ${PRODUCT.version}`} /></div>
                <figcaption><span>{String(index + 1).padStart(2, "0")}</span><strong>{title}</strong><p>{caption}</p><small><i className="bi bi-check-circle" /> versão {PRODUCT.version}</small></figcaption>
              </figure>
            ))}
          </div>
          <div className="as-centered-action"><Link className="btn btn-outline-light btn-lg" href="/recursos">Ver todos os recursos <i className="bi bi-arrow-right" /></Link></div>
        </div>
      </section>

      <section className="as-section as-documents" data-motion="signal">
        <div className="container">
          <div className="as-section-heading">
            <span className="as-kicker">Documentos da própria operação</span>
            <h2>O atendimento termina com uma entrega profissional.</h2>
            <p>Orçamento, ordem de serviço, retirada, compra e venda, ficha técnica, garantia, transferência de dados e pós-formatação usam os dados já registrados.</p>
          </div>
          <MediaGallery />
        </div>
      </section>

      <section className="as-section as-continuity">
        <div className="container as-continuity-grid">
          <div>
            <span className="as-kicker">Continuidade da loja</span>
            <h2>Fechar uma janela não pode significar perder um dia de trabalho.</h2>
            <p>Banco local criptografado, backups autenticados, cópia externa configurável, verificação antes de restaurar e cópia de recuperação ao minimizar protegem a rotina.</p>
            <div className="as-continuity-points"><span><i className="bi bi-device-ssd" /> Base local</span><span><i className="bi bi-cloud-check" /> Cópia externa</span><span><i className="bi bi-fingerprint" /> Auditoria</span><span><i className="bi bi-arrow-repeat" /> Atualização assinada</span></div>
          </div>
          <Image src={assetPath("/assets/img/app/current/backup.webp")} width={1440} height={900} loading="lazy" sizes="(max-width: 991px) 100vw, 50vw" alt="Central de backup da versão atual" />
        </div>
      </section>

      <section className="as-final-cta">
        <div className="container">
          <div className="as-cta-signal" aria-hidden="true"><span /><span /><span /></div>
          <span className="as-kicker">Pronto para organizar a próxima entrada?</span>
          <h2>Conheça o sistema com os seus próprios olhos.</h2>
          <p>Baixe a versão {PRODUCT.version}, solicite o teste gratuito ou compare as modalidades. Todos os planos liberam os mesmos recursos.</p>
          <div className="as-hero-actions">
            <DownloadAppButton className="btn btn-primary btn-lg" />
            <a className="btn btn-outline-light btn-lg" href={PRODUCT.trialLink}><i className="bi bi-whatsapp" /> Solicitar teste grátis</a>
            <Link className="btn btn-outline-light btn-lg" href="/planos">Comparar licenças</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
