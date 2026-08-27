import type { Metadata } from "next";
import { SiteLink as Link } from "../components/site-link";
import { PageHero } from "../components/page-hero";
import { PRODUCT, plans } from "../../lib/site-data";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: `Planos e licenças | ${PRODUCT.name}`,
  description: "Escolha licença mensal, semestral, anual ou permanente. Todos os recursos estão incluídos.",
  alternates: { canonical: "/planos" },
};

const comparedResources = [
  "Orçamentos e Atendimentos",
  "Clientes e aparelhos",
  "Garantias e templates",
  "Compra e venda de aparelhos",
  "Automações, alertas e relatórios",
  "Usuários, backup e segurança",
];

export default function PlanosPage() {
  return (
    <main className="as-secondary-page">
      <PageHero
        eyebrow="Licenciamento simples"
        title="Todos os recursos. Você escolhe o período."
        description="Sem módulos escondidos por plano: a equipe recebe o sistema completo em qualquer modalidade."
      />
      <section className="pricing-section" id="licencas">
        <div className="container">
          <div className="trial-card">
            <div>
              <span className="trial-icon"><i className="bi bi-stars" /></span>
              <span className="eyebrow">Experimente antes de decidir</span>
              <h2>Teste grátis por {PRODUCT.trialDays} dia{PRODUCT.trialDays === 1 ? "" : "s"}</h2>
              <p>Conheça o fluxo com dados fictícios, separados da base real, sem pagamento e sem compromisso.</p>
            </div>
            <a className="btn btn-primary btn-lg" href={PRODUCT.trialLink}>
              <i className="bi bi-whatsapp" /> Solicitar teste grátis
            </a>
          </div>

          <div className="pricing-grid">
            {plans.map((plan) => (
              <article key={plan.name} className={`pricing-card ${plan.featured ? "featured" : ""}`}>
                {plan.badge && <span className="pricing-badge">{plan.badge}</span>}
                <span className="pricing-period">Licença por</span>
                <h2>{plan.name}</h2>
                <div className="price">{plan.price}</div>
                <p>{plan.description}</p>
                <ul>
                  <li><i className="bi bi-check-circle-fill" /> Todos os recursos atuais</li>
                  <li><i className="bi bi-check-circle-fill" /> Atualizações assinadas</li>
                  <li><i className="bi bi-check-circle-fill" /> Banco e documentos preservados</li>
                  <li><i className="bi bi-check-circle-fill" /> Uso em um computador</li>
                </ul>
                <a className={`btn ${plan.featured ? "btn-primary" : "btn-outline-dark"}`} href={plan.purchaseLink}>
                  <i className="bi bi-whatsapp" /> Adquirir {plan.name}
                </a>
              </article>
            ))}
          </div>

          <div className="pricing-note">
            <i className="bi bi-shield-check" />
            <p><strong>Compra assistida pelo WhatsApp.</strong> Cada botão informa a modalidade e o valor escolhido. Nenhuma cobrança é feita pelo site. Nas contratações à distância, o consumidor pode exercer o direito de arrependimento em até 7 dias corridos, com devolução integral dos valores pagos. Consulte os <Link href="/termos">Termos de Uso</Link>. A licença padrão autoriza um computador; transferências devem ser combinadas com o suporte.</p>
          </div>

          <div className="comparison-wrap">
            <div className="section-heading centered">
              <span className="eyebrow">Comparação direta</span>
              <h2>O sistema completo em qualquer duração.</h2>
            </div>
            <div className="table-responsive">
              <table className="plan-table">
                <thead><tr><th>Recurso</th><th>1 mês</th><th>6 meses</th><th>1 ano</th><th>Permanente</th></tr></thead>
                <tbody>
                  {comparedResources.map((resource) => (
                    <tr key={resource}>
                      <th>{resource}</th>
                      {plans.map((plan) => <td key={plan.name} aria-label="Incluído"><i className="bi bi-check-circle-fill" aria-hidden="true" /></td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <section className="acquire-section" id="como-adquirir">
        <div className="container">
          <div className="row g-5 align-items-center">
            <div className="col-lg-6">
              <span className="eyebrow">Como adquirir</span>
              <h2>Ativação por chave.</h2>
              <p>Depois da compra, você recebe uma chave de ativação para informar no aplicativo antes de criar a conta administrativa. Se precisar transferir o uso para outro computador, solicite orientação ao suporte.</p>
            </div>
            <div className="col-lg-6">
              <ol className="acquire-steps">
                <li><span>1</span><div><strong>Escolha o período</strong><p>Defina a modalidade adequada à loja.</p></div></li>
                <li><span>2</span><div><strong>Receba a chave</strong><p>A compra assistida confirma o plano e fornece a ativação.</p></div></li>
                <li><span>3</span><div><strong>Ative e configure</strong><p>Confirme a chave, crie a conta administrativa e conclua o assistente inicial.</p></div></li>
              </ol>
            </div>
          </div>
          <div className="contact-box">
            <div><h2>Atendimento direto pelo WhatsApp</h2><p>{PRODUCT.whatsappDisplay} — tire dúvidas ou solicite seu teste grátis de {PRODUCT.trialDays} dia{PRODUCT.trialDays === 1 ? "" : "s"}.</p></div>
            <div className="d-flex flex-wrap gap-2">
              <a className="btn btn-outline-light" href={PRODUCT.contactLink}><i className="bi bi-whatsapp" /> Tirar uma dúvida</a>
              <a className="btn btn-primary" href={PRODUCT.trialLink}>Testar gratuitamente</a>
            </div>
          </div>
        </div>
      </section>

      <section className="final-cta">
        <div className="container">
          <div className="cta-panel">
            <span className="eyebrow">Compatibilidade</span>
            <h2>{PRODUCT.platform}</h2>
            <p>O aplicativo completo é instalado no computador principal da assistência.</p>
            <Link className="btn btn-outline-light" href="/faq">Ver perguntas frequentes</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
