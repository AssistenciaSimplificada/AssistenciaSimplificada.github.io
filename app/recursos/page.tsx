import type { Metadata } from "next";
import { FeatureExplorer } from "../components/feature-explorer";
import { SiteLink as Link } from "../components/site-link";
import { PRODUCT, resourceGroups } from "../../lib/site-data";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: `Recursos da versão ${PRODUCT.version} | ${PRODUCT.name}`,
  description: "Conheça orçamentos, agenda, técnicos, clientes, peças, aparelhos, vitrine, anotações, garantias, documentos, backup e segurança.",
  alternates: { canonical: "/recursos" },
};

const guideLinks: Record<string, string> = {
  layouts: "layouts",
  orcamentos: "novo-orcamento",
  clientes: "clientes",
  operacao: "manutencao",
  garantias: "garantias",
  aparelhos: "compra-venda",
  documentos: "documentos",
  gestao: "automacoes",
  seguranca: "backup",
};

export default function RecursosPage() {
  return (
    <main className="as-resources-page">
      <header className="as-resource-intro">
        <div className="container" data-motion="signal">
          <span className="as-kicker"><i className="bi bi-grid-1x2" /> Versão {PRODUCT.version}</span>
          <h1>Uma assistência inteira, conectada pelo mesmo atendimento.</h1>
          <p>Explore as áreas do aplicativo com capturas da versão atual, em modo escuro e com dados fictícios.</p>
          <div className="as-hero-actions">
            <a className="btn btn-primary btn-lg" href="#explorar">Explorar recursos</a>
            <Link className="btn btn-outline-light btn-lg" href="/guia">Abrir o guia</Link>
          </div>
        </div>
      </header>

      <section className="as-section" id="explorar">
        <div className="container">
          <div className="as-section-heading">
            <span className="as-kicker">Escolha uma área</span>
            <h2>Veja o recurso e a tela onde ele acontece.</h2>
            <p>As imagens foram capturadas no modo demonstração seguro, com dados fictícios separados da base real.</p>
          </div>
          <FeatureExplorer />
        </div>
      </section>

      <section className="as-section as-resource-catalog">
        <div className="container">
          <div className="as-section-heading">
            <span className="as-kicker">Inventário conferido</span>
            <h2>Das funções principais aos detalhes que evitam retrabalho.</h2>
            <p>O sistema organiza a operação sem esconder as ações menores que fazem diferença no balcão, na bancada e na gestão.</p>
          </div>
          <div className="as-resource-ledger">
            {resourceGroups.map((group, index) => (
              <article id={group.id} key={group.id} data-motion="screen">
                <div className="as-ledger-mark">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <i className={`bi ${group.icon}`} />
                </div>
                <div>
                  <span className="as-kicker">{group.kicker}</span>
                  <h2>{group.title}</h2>
                  <p>{group.summary}</p>
                  <Link className="text-link" href={`/guia#${guideLinks[group.id]}`}>Ver passo a passo <i className="bi bi-arrow-right" /></Link>
                </div>
                <ul>{group.items.map((item) => <li key={item}>{item}</li>)}</ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="as-final-cta">
        <div className="container">
          <span className="as-kicker">Todos os recursos em qualquer modalidade</span>
          <h2>Escolha o prazo da licença, não uma versão reduzida do produto.</h2>
          <p>Mensal, semestral, anual e permanente usam o mesmo conjunto de recursos.</p>
          <div className="as-hero-actions">
            <Link className="btn btn-primary btn-lg" href="/planos">Consultar planos</Link>
            <Link className="btn btn-outline-light btn-lg" href="/faq">Tirar dúvidas</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
