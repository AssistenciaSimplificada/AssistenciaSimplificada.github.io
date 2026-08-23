import Image from "next/image";
import { SiteLink as Link } from "./site-link";
import { assetPath, PRODUCT } from "../../lib/site-data";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <Link href="/" className="footer-brand"><Image src={assetPath("/assets/branding/icon-192.png")} width={42} height={42} alt="" /><span><strong>{PRODUCT.name}</strong><small>Gestão para assistência técnica</small></span></Link>
            <p>Organização da entrada do aparelho à retirada, com histórico, documentos e controle da operação.</p>
            <span className="version-chip">Versão atual {PRODUCT.version}</span>
          </div>
          <div><h2>Conheça</h2><Link href="/recursos">Recursos</Link><Link href="/planos">Planos</Link><Link href="/faq">Perguntas frequentes</Link></div>
          <div><h2>Aprenda</h2><Link href="/guia">Guia completo</Link><Link href="/guia#novo-orcamento">Criar orçamento</Link><Link href="/guia#backup">Backup e segurança</Link></div>
          <div><h2>Informações</h2><Link href="/termos">Termos de uso</Link><Link href="/privacidade">Privacidade</Link><Link href="/faq#suporte">Suporte</Link><a href={PRODUCT.trialLink}>Teste grátis de 1 dia</a></div>
        </div>
        <div className="footer-bottom"><span>© 2026 {PRODUCT.name}</span><a href={PRODUCT.contactLink}><i className="bi bi-whatsapp" /> {PRODUCT.whatsappDisplay}</a><span>Aplicativo para Windows 64 bits</span></div>
      </div>
    </footer>
  );
}
