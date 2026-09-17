import type { Metadata } from "next";
import { SiteLink as Link } from "../components/site-link";
import { PageHero } from "../components/page-hero";
import { PRODUCT } from "../../lib/site-data";
import { SITE_COMMERCIAL_CONFIG } from "../../lib/product-config";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: `Política de Privacidade | ${PRODUCT.name}`,
  description: `Como a ${PRODUCT.name} armazena e protege dados de lojas, clientes e aparelhos.`,
  alternates: { canonical: "/privacidade" },
};

export default function PrivacidadePage() {
  return (
    <main className="as-secondary-page">
      <PageHero eyebrow="Transparência" title="Política de Privacidade." description="O que é armazenado, onde fica, por que é usado e quais cuidados fazem parte do produto." />
      <section className="legal-section">
        <div className="container">
          <aside className="legal-index">
            <strong>Nesta página</strong>
            <a href="#escopo">Escopo</a><a href="#responsaveis">Responsáveis</a><a href="#dados">Dados tratados</a><a href="#finalidades">Finalidades</a><a href="#armazenamento">Armazenamento</a><a href="#compartilhamento">Compartilhamento</a><a href="#seguranca">Segurança</a><a href="#retencao">Retenção</a><a href="#direitos">Direitos</a>
          </aside>
          <article className="legal-copy">
            <p className="legal-date">Atualizada em {SITE_COMMERCIAL_CONFIG.legalLastUpdated}</p>
            <section id="escopo"><h2>1. Escopo</h2><p>Esta política descreve o tratamento de dados realizado pelo site comercial, pelo aplicativo {PRODUCT.name} e pelos fluxos de licenciamento e sincronização associados. A loja que cadastra seus próprios clientes é responsável por informar e cumprir as bases legais aplicáveis ao seu atendimento.</p></section>
            <section id="responsaveis"><h2>2. Responsáveis pelo tratamento</h2><p>A loja é responsável pelos dados de clientes e atendimentos que cadastra no aplicativo. {PRODUCT.authorName} é responsável pelos dados tratados diretamente pelo site, pelo licenciamento, pelo suporte e pela infraestrutura do produto. Solicitações sobre esses fluxos podem ser enviadas ao WhatsApp <a href={PRODUCT.contactLink}>{PRODUCT.whatsappDisplay}</a>.</p></section>
            <section id="dados"><h2>3. Dados tratados</h2><p>Conforme o uso, podem ser armazenados dados da empresa, usuários internos, clientes, contatos, CPF ou CNPJ, e-mail, endereço, aparelhos, IMEI, números de série, fotos de recebimento, relatos, diagnósticos, serviços, valores, pagamentos, garantias, compras, vendas, documentos e registros de auditoria.</p><p>O licenciamento também trata identificadores da licença, instalação e máquina, versão do aplicativo e eventos necessários à ativação, validação periódica, revogação e sincronização autorizada.</p><p>Quando a loja envia um link individual ao técnico, a página temporária trata somente os dados necessários para identificar o atendimento e receber diagnóstico e valores de serviços. A resposta fica pendente de revisão no aplicativo principal.</p><p>Quando a loja cria um link de acompanhamento para o cliente, é publicada uma cópia reduzida com número do atendimento, aparelho, status, prazo, tempo de manutenção, etapas, serviços e valores públicos. A primeira foto de recebimento só é incluída quando a loja escolhe essa opção. CPF, IMEI, senha do aparelho, notas internas, custos e margens não fazem parte dessa cópia.</p><p>Credenciais digitadas nas fichas de transferência e pós-formatação são temporárias: não são gravadas no orçamento, banco, backup ou nuvem. O PDF gerado pode exibi-las e deve ser tratado como documento sensível.</p></section>
            <section id="finalidades"><h2>4. Finalidades</h2><p>Os dados são usados para registrar atendimentos, gerar documentos, acompanhar etapas, localizar histórico, proteger acessos, criar indicadores, apoiar o licenciamento e permitir análises relacionadas à operação das lojas. Comunicações de ofertas dependem da autorização registrada pela loja; a revogação retira o cliente das seleções futuras. O site comercial não vende dados de clientes.</p></section>
            <section id="armazenamento"><h2>5. Armazenamento local e sincronização</h2><p>O banco principal fica no computador da loja em SQLite criptografado. Backups usam proteção autenticada e a loja pode configurar uma cópia externa. Quando a sincronização prevista no produto estiver habilitada, dados operacionais aprovados podem ser enviados de forma protegida à infraestrutura configurada.</p><p>O modo demonstração usa dados fictícios, uma base separada e não envia seus registros à sincronização.</p></section>
            <section id="compartilhamento"><h2>6. Serviços externos</h2><p>O aplicativo pode abrir o WhatsApp com uma mensagem preparada, consultar ativação e validação da licença, verificar atualizações assinadas, disponibilizar links temporários para o técnico ou para o acompanhamento do cliente e utilizar a infraestrutura de sincronização. O envio final de mensagens depende da confirmação do usuário no WhatsApp. Cada serviço externo possui seus próprios termos e práticas.</p></section>
            <section id="seguranca"><h2>7. Medidas de segurança</h2><p>O produto aplica criptografia ao banco local, autenticação em backups, validação de licenças, permissões por usuário, auditoria, bloqueio de operações sensíveis e assinatura de atualizações. Nenhuma medida elimina todos os riscos; a loja deve proteger o Windows, as contas, o equipamento e as cópias de segurança.</p></section>
            <section id="retencao"><h2>8. Retenção e exclusão</h2><p>Enquanto a licença estiver válida, os registros permanecem conforme a necessidade da operação, obrigações legais e decisões da loja. Funções de exclusão exigem permissões e confirmação; alguns eventos mínimos de auditoria, licença, ativação, segurança e prevenção de abuso podem ser preservados para rastreabilidade.</p><p>No vencimento ou na revogação, os links públicos são suspensos. As cópias operacionais na nuvem de licenças pagas são excluídas definitivamente após 7 dias corridos sem renovação. Nas licenças de teste, a exclusão ocorre 2 dias após o vencimento. O banco e os backups existentes no computador da loja não são atingidos.</p><p>Links de acompanhamento também possuem validade própria de até 180 dias e podem ser substituídos ou desativados antes disso. A desinstalação, por si só, não substitui um processo formal de cópia ou exclusão.</p></section>
            <section id="direitos"><h2>9. Direitos e solicitações</h2><p>Solicitações sobre correção, acesso ou exclusão de dados cadastrados pela assistência devem ser encaminhadas primeiro à própria loja. Questões sobre site, licença, suporte ou infraestrutura podem ser enviadas diretamente a {PRODUCT.authorName} pelo WhatsApp <a href={PRODUCT.contactLink}>{PRODUCT.whatsappDisplay}</a>. Consulte também os <Link href="/termos">Termos de Uso</Link>.</p></section>
          </article>
        </div>
      </section>
    </main>
  );
}
