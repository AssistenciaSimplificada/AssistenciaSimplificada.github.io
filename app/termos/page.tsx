import type { Metadata } from "next";
import { SiteLink as Link } from "../components/site-link";
import { PageHero } from "../components/page-hero";
import { PRODUCT } from "../../lib/site-data";
import { SITE_COMMERCIAL_CONFIG } from "../../lib/product-config";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: `Termos de uso | ${PRODUCT.name}`,
  description: `Condições gerais de uso do site e do aplicativo ${PRODUCT.name}.`,
  alternates: { canonical: "/termos" },
};

export default function TermosPage() {
  return (
    <main className="as-secondary-page">
      <PageHero eyebrow="Informações legais" title="Termos de uso." description="Condições gerais para uso responsável do site, do instalador e do aplicativo." />
      <section className="legal-section">
        <div className="container">
          <aside className="legal-index">
            <strong>Nesta página</strong>
            {["aceite", "fornecedor", "licenca", "contratacao", "responsabilidades", "dados", "atualizacoes", "disponibilidade", "contato"].map((id) => (
              <a key={id} href={`#${id}`}>
                {id.replace("dados", "Dados e privacidade").replace("aceite", "Aceite").replace("fornecedor", "Fornecedor").replace("licenca", "Licença").replace("contratacao", "Contratação e arrependimento").replace("responsabilidades", "Responsabilidades").replace("atualizacoes", "Atualizações").replace("disponibilidade", "Disponibilidade").replace("contato", "Contato")}
              </a>
            ))}
          </aside>
          <article className="legal-copy">
            <p className="legal-date">Atualizado em {SITE_COMMERCIAL_CONFIG.legalLastUpdated}</p>
            <section id="aceite"><h2>1. Aceite</h2><p>Ao instalar ou usar a {PRODUCT.name}, o usuário declara ter lido estes termos e concordado com as condições apresentadas no instalador e nesta página. Se não concordar, não deve concluir a instalação nem utilizar o produto.</p></section>
            <section id="fornecedor"><h2>2. Fornecedor</h2><p>A {PRODUCT.name} é fornecida por {PRODUCT.authorName}, com atendimento comercial, suporte e solicitações de privacidade pelo WhatsApp <a href={PRODUCT.contactLink}>{PRODUCT.whatsappDisplay}</a>. Este é o canal eletrônico direto para registrar pedidos relacionados à contratação.</p></section>
            <section id="licenca"><h2>3. Licença de uso</h2><p>A licença autoriza o uso do aplicativo na instalação e máquina validadas, pelo período contratado. Mesmo a modalidade permanente continua sujeita à validação periódica, revogação e transferência autorizada. A licença não transfere propriedade do software, código, marca ou mecanismos de emissão. Chaves e arquivos de licença não devem ser alterados, compartilhados publicamente ou usados para contornar a validação.</p><p>Quando uma licença vence ou é revogada, as funções comerciais e os links públicos vinculados à loja são suspensos. Isso inclui acompanhamento e aprovação de clientes, convites de avaliação técnica, Vitrine e edição compartilhada de preços.</p></section>
            <section id="contratacao"><h2>4. Contratação, cancelamento e direito de arrependimento</h2><p>A contratação é atendida pelo WhatsApp e não há cobrança automática no site. Nas contratações realizadas fora de estabelecimento comercial, o consumidor pode exercer o direito de arrependimento em até 7 dias corridos, contados da assinatura ou do recebimento do produto ou serviço, conforme o artigo 49 do Código de Defesa do Consumidor.</p><p>Para solicitar o cancelamento nesse prazo, envie uma mensagem ao <a href={PRODUCT.contactLink}>{PRODUCT.whatsappDisplay}</a> identificando a contratação. Confirmado o pedido, a licença será encerrada e os valores pagos serão devolvidos integralmente, sem multa ou retenção, pelo meio adequado à forma de pagamento. Esta regra não limita outros direitos assegurados pela legislação aplicável.</p></section>
            <section id="responsabilidades"><h2>5. Responsabilidades da loja</h2><p>A loja é responsável pela exatidão dos registros, pela base legal do tratamento de dados de seus clientes, pela guarda do computador e backups e por conceder acesso somente a pessoas autorizadas. Cada usuário deve proteger sua senha e encerrar a sessão quando deixar o equipamento sem supervisão.</p><p>Links individuais enviados ao técnico são temporários e devem ser compartilhados somente com o profissional responsável pelo atendimento. A loja deve revisar diagnóstico e valores recebidos antes de aplicá-los ao orçamento.</p><p>Documentos com credenciais de transferência ou pós-formatação devem ser entregues somente ao cliente e excluídos quando deixarem de ser necessários.</p></section>
            <section id="dados"><h2>6. Dados e privacidade</h2><p>O banco principal é armazenado localmente em formato criptografado. Dados de clientes e aparelhos podem ser sincronizados de forma protegida para apoiar a operação licenciada e análises previstas no produto.</p><p>Após o vencimento ou a revogação de uma <strong>licença paga</strong>, as cópias operacionais mantidas na nuvem ficam disponíveis para recuperação por <strong>7 dias corridos</strong>. Sem renovação nesse prazo, elas são excluídas definitivamente. Nas <strong>licenças de teste</strong>, a exclusão definitiva ocorre <strong>2 dias após o vencimento</strong>.</p><p>A exclusão abrange dados sincronizados de clientes, links e convites públicos, recibos técnicos de sincronização, dados aprendidos pela loja e conteúdo publicado na Vitrine. Ela não apaga o banco existente no computador nem os backups locais. Registros mínimos de licença, ativação, auditoria, segurança e prevenção de abuso podem ser conservados pelo período necessário.</p><p>Depois da exclusão definitiva, a restauração depende dos dados e backups locais que a loja mantiver. Os detalhes e os direitos aplicáveis estão na <Link href="/privacidade">Política de Privacidade</Link>.</p></section>
            <section id="atualizacoes"><h2>7. Atualizações</h2><p>Atualizações assinadas podem corrigir falhas, melhorar compatibilidade, alterar a interface ou acrescentar funções. O aplicativo pode baixá-las conforme o canal escolhido e instalá-las no fechamento. Uma versão beta pode apresentar comportamento ainda em validação.</p></section>
            <section id="disponibilidade"><h2>8. Disponibilidade e limites</h2><p>O produto foi projetado para a plataforma indicada na página de planos. A operação local tolera interrupções dentro da janela válida da licença, mas ativação, validação periódica, revogação, sincronização, atualização e outros serviços externos dependem de rede ou internet. O usuário deve manter backups adequados e verificar documentos antes de entregá-los.</p></section>
            <section id="contato"><h2>9. Contato</h2><p>Fale diretamente com {PRODUCT.authorName} pelo WhatsApp <a href={PRODUCT.contactLink}>{PRODUCT.whatsappDisplay}</a>. Ao relatar um problema, não envie senhas, bancos completos ou documentos com dados pessoais sem orientação específica e canal protegido.</p></section>
          </article>
        </div>
      </section>
    </main>
  );
}
