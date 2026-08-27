import type { Metadata } from "next";
import { SiteLink as Link } from "../components/site-link";
import { PageHero } from "../components/page-hero";
import { faqs, PRODUCT } from "../../lib/site-data";

export const dynamic = "force-static";
export const metadata: Metadata = { title: `Perguntas frequentes | ${PRODUCT.name}`, description: "Respostas sobre Windows, licença, internet, link técnico, documentos, garantia, backup, atualização e usuários.", alternates: { canonical: "/faq" } };

export default function FaqPage() {
  return (
    <main className="as-secondary-page">
      <PageHero eyebrow="Dúvidas objetivas" title="Antes de instalar, saiba como funciona." description="Compatibilidade, licenças, internet, segurança e rotina explicadas sem letras miúdas." />
      <section className="faq-section">
        <div className="container">
          <div className="faq-layout">
            <aside>
              <span className="eyebrow">Neste FAQ</span>
              <h2>Informações essenciais</h2>
              <p>Do banco local ao convite do técnico: confira as regras que afetam a sua operação.</p>
              <Link className="btn btn-primary" href="/guia">Abrir o guia completo</Link>
            </aside>
            <div className="faq-list">{faqs.map((item, index) => <details key={item.q} open={index === 0}><summary><span>{item.q}</span><i className="bi bi-plus-lg" /></summary><p>{item.a}</p></details>)}</div>
          </div>
          <div className="support-card" id="suporte">
            <div className="support-icon"><i className="bi bi-headset" /></div>
            <div><span className="eyebrow">Suporte</span><h2>Precisa relatar um problema?</h2><p>Informe a tela, a ação realizada e a mensagem exibida. Envie capturas sem dados pessoais. Para licença, não compartilhe senhas, banco, backups ou documentos.</p></div>
            <a className="btn btn-outline-light" href={PRODUCT.contactLink}>Falar com o suporte</a>
          </div>
        </div>
      </section>
    </main>
  );
}
