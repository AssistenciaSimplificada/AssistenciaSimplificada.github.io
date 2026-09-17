import Image from "next/image";
import { SiteLink as Link } from "./site-link";
import { assetPath, CURRENT_RELEASE, PRODUCT } from "../../lib/site-data";

export function SiteFooter() {
  const currentYear = new Date().getFullYear();
  const copyrightYears = currentYear > PRODUCT.copyrightStartYear
    ? `${PRODUCT.copyrightStartYear}–${currentYear}`
    : String(PRODUCT.copyrightStartYear);
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <Link href="/" className="footer-brand" aria-label={`${PRODUCT.name} — início`}>
              <Image
                className="footer-brand-logo"
                src={assetPath("/assets/branding/logos/logo-horizontal-fundo-escuro.svg")}
                width={240}
                height={63}
                alt={PRODUCT.name}
              />
            </Link>
            <p>Orçamentos, bancada, peças, clientes, documentos, retirada e garantia conectados em um aplicativo Windows.</p>
            <span className="version-chip">Versão {CURRENT_RELEASE.label} {PRODUCT.version} · imagens atuais</span>
          </div>
          <div><h2>Conheça</h2><Link href="/recursos">Recursos</Link><Link href="/planos">Planos</Link><Link href="/faq">Perguntas frequentes</Link></div>
          <div><h2>Aprenda</h2><Link href="/guia">Guia completo</Link><Link href="/guia#novo-orcamento">Criar orçamento</Link><Link href="/guia#automacoes">Automações e alertas</Link><Link href="/guia#backup">Backup e segurança</Link></div>
          <div><h2>Informações</h2><a href={PRODUCT.termsLink}>Termos de uso</a><a href={PRODUCT.privacyLink}>Privacidade</a><a href={PRODUCT.supportLink}>Suporte</a><a href={PRODUCT.trialLink}>Teste grátis de {PRODUCT.trialDays} dia</a></div>
        </div>
        <div className="footer-bottom"><span>© {copyrightYears} {PRODUCT.name} · Criado por {PRODUCT.authorName}</span><a href={PRODUCT.contactLink}><i className="bi bi-whatsapp" /> {PRODUCT.whatsappDisplay}</a><span>{PRODUCT.platform}</span></div>
      </div>
    </footer>
  );
}
