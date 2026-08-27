import { PRODUCT_CONFIG, SITE_COMMERCIAL_CONFIG } from "./product-config";

export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";
export const assetPath = (path: string) => `${BASE_PATH}${path}`;
export const SITE_URL = PRODUCT_CONFIG.urls.officialWebsite;

export const SITE_CONFIG = {
  whatsappNumber: PRODUCT_CONFIG.support.whatsapp,
  whatsappDisplay: PRODUCT_CONFIG.support.whatsappDisplay,
  supportEmail: PRODUCT_CONFIG.support.email,
  productVersion: PRODUCT_CONFIG.version,
  platform: PRODUCT_CONFIG.platform.display,
  trialDays: PRODUCT_CONFIG.trialDays,
  plans: {
    monthly: SITE_COMMERCIAL_CONFIG.plans.monthly.price,
    semiannual: SITE_COMMERCIAL_CONFIG.plans.semiannual.price,
    annual: SITE_COMMERCIAL_CONFIG.plans.annual.price,
    permanent: SITE_COMMERCIAL_CONFIG.plans.permanent.price,
  },
} as const;

export const GITHUB_RELEASES = {
  download: `https://github.com/${PRODUCT_CONFIG.urls.releaseRepository}/releases/latest/download/${PRODUCT_CONFIG.artifacts.windowsInstallerPrefix}-${SITE_CONFIG.productVersion}.exe`,
  fallback: `https://github.com/${PRODUCT_CONFIG.urls.releaseRepository}/releases/latest`,
} as const;

export const whatsappLink = (message: string) =>
  `https://wa.me/${SITE_CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;

export const PRODUCT = {
  name: PRODUCT_CONFIG.name,
  version: SITE_CONFIG.productVersion,
  platform: SITE_CONFIG.platform,
  authorName: PRODUCT_CONFIG.authorName,
  copyrightStartYear: PRODUCT_CONFIG.copyrightStartYear,
  trialDays: PRODUCT_CONFIG.trialDays,
  purchaseLink: "/planos",
  contactLink: whatsappLink(
    `Olá! Quero conhecer melhor a ${PRODUCT_CONFIG.name} para minha assistência técnica.`,
  ),
  trialLink: whatsappLink(
    `Olá! Quero solicitar o teste grátis de ${PRODUCT_CONFIG.trialDays} dia da ${PRODUCT_CONFIG.name}. Pode me ajudar com a ativação?`,
  ),
  whatsappDisplay: SITE_CONFIG.whatsappDisplay,
  supportEmail: PRODUCT_CONFIG.support.email,
  supportLink: PRODUCT_CONFIG.urls.support,
  documentationLink: PRODUCT_CONFIG.urls.documentation,
  termsLink: PRODUCT_CONFIG.urls.terms,
  privacyLink: PRODUCT_CONFIG.urls.privacy,
};

export const plans = [
  {
    name: "1 mês",
    price: SITE_CONFIG.plans.monthly,
    description: "Para começar com baixo compromisso e usar o sistema completo.",
    purchaseLink: whatsappLink(
      `Olá! Quero adquirir a licença mensal (1 mês) da ${PRODUCT_CONFIG.name} por ${SITE_CONFIG.plans.monthly}. Pode me orientar sobre a ativação?`,
    ),
  },
  {
    name: "6 meses",
    price: SITE_CONFIG.plans.semiannual,
    description: "Seis meses de acesso ao sistema completo por um valor único.",
    purchaseLink: whatsappLink(
      `Olá! Quero adquirir a licença semestral (6 meses) da ${PRODUCT_CONFIG.name} por ${SITE_CONFIG.plans.semiannual}. Pode me orientar sobre a ativação?`,
    ),
  },
  {
    name: "1 ano",
    price: SITE_CONFIG.plans.annual,
    description: "Doze meses para manter toda a operação organizada e atualizada.",
    featured: true,
    badge: "Melhor custo-benefício",
    purchaseLink: whatsappLink(
      `Olá! Quero adquirir a licença anual (1 ano) da ${PRODUCT_CONFIG.name} por ${SITE_CONFIG.plans.annual}. Pode me orientar sobre a ativação?`,
    ),
  },
  {
    name: "Permanente",
    price: SITE_CONFIG.plans.permanent,
    description: "Licença sem vencimento para esta instalação, com pagamento único.",
    purchaseLink: whatsappLink(
      `Olá! Quero adquirir a licença permanente da ${PRODUCT_CONFIG.name} por ${SITE_CONFIG.plans.permanent}. Pode me orientar sobre a ativação?`,
    ),
  },
];

export type ResourceGroup = {
  id: string;
  kicker: string;
  title: string;
  summary: string;
  icon: string;
  items: string[];
};

export const resourceGroups: ResourceGroup[] = [
  {
    id: "orcamentos",
    kicker: "Atendimento",
    title: "Orçamentos e Atendimentos",
    summary: "Registre a entrada, acompanhe cada etapa e reencontre orçamentos, serviços, retiradas e aparelhos vinculados.",
    icon: "bi-clipboard2-check",
    items: ["Cadastro guiado de cliente e aparelho", "Serviços definidos e itens sem preço no mesmo orçamento", "Alternativas salvas em Aguardando aprovação antes da escolha do cliente", "Desconto, entrada, saldo restante e condição de pagamento", "Aprovação imutável, revisão preservada e versão aceita", "Validade, expiração, arquivamento, vínculos e tentativas de contato"],
  },
  {
    id: "clientes",
    kicker: "Relacionamento",
    title: "Clientes e aparelhos",
    summary: "Encontre rapidamente o histórico de pessoas e empresas, mesmo quando a base já tiver milhares de registros.",
    icon: "bi-people",
    items: ["Pesquisa por nome, telefone, CPF/CNPJ, e-mail, aparelho, IMEI ou série", "Autocompletar com aviso imediato de atenção interna", "Perfil com contatos, aparelhos, atendimentos e motivos registrados", "Importação por CSV com prévia, duplicidades e backup automático", "Exportação completa e portátil dos dados de clientes", "Filtros de atividade, recorrência, VIP, consentimento e possíveis duplicados"],
  },
  {
    id: "operacao",
    kicker: "Oficina",
    title: "Técnicos, manutenção e peças",
    summary: "Acompanhe o trabalho em andamento, o que aguarda análise e as peças que ainda precisam ser encontradas.",
    icon: "bi-tools",
    items: ["Painel principal local e convite individual protegido por 8 horas", "Senha opcional de 4 a 12 dígitos, nunca incluída no link", "Revogação, geração com intervalo de segurança e invalidação ao editar", "Diagnóstico, resultado da avaliação e múltiplas peças ou valores por serviço", "Resposta aplicada somente após revisão da loja", "Procura de peças e estoque com custo, movimentação e reserva por orçamento"],
  },
  {
    id: "garantias",
    kicker: "Pós-atendimento",
    title: "Garantias e retiradas",
    summary: "Documente a entrega, acompanhe retornos e mantenha cada decisão registrada.",
    icon: "bi-shield-check",
    items: ["Garantia criada a partir do atendimento finalizado", "Aviso configurável ao técnico responsável pelo retorno", "Prazo padrão da loja e prazo individual ajustável por garantia", "Avaliação, decisão, serviços e peças registrados na conclusão", "Acessórios recebidos destacados para conferência na retirada", "Acompanhamento de aparelhos abandonados e contatos realizados"],
  },
  {
    id: "aparelhos",
    kicker: "Comércio",
    title: "Compra, estoque e venda de aparelhos",
    summary: "Módulo opcional da empresa para registrar procedência, identificadores, estado, entrada no estoque e venda ao comprador.",
    icon: "bi-phone",
    items: ["Ativação ou desativação pela empresa sem apagar o histórico", "Compra de usados com declaração de procedência", "IMEI, série, acessórios, avaliação e testes", "Estados Em análise, Disponível, Retirada de peças, Vendido e Cancelado", "Venda com preenchimento a partir do estoque", "Comprovantes próprios de compra e venda"],
  },
  {
    id: "documentos",
    kicker: "Documentação",
    title: "Templates, PDFs e mensagens",
    summary: "Centralize os modelos da loja, gere documentos padronizados e prepare mensagens para o contato escolhido.",
    icon: "bi-file-earmark-pdf",
    items: ["Templates de documentos, mensagens, garantia e dados da empresa em uma só área", "Orçamento, ordem de serviço e comprovante de retirada", "Ficha técnica, garantia e etiquetas", "Transferência de dados e guia após formatação", "Downloads automáticos na pasta escolhida", "Mensagens preparadas com histórico e confirmação do atendente"],
  },
  {
    id: "gestao",
    kicker: "Gestão",
    title: "Indicadores, automações e alertas",
    summary: "Leia a operação com dados reais e configure lembretes para o ritmo da sua assistência.",
    icon: "bi-graph-up-arrow",
    items: ["Faturamento, ticket médio e atendimentos finalizados", "Evolução de vendas com período selecionável", "Tempos de manutenção, funil e desempenho técnico", "Central de automações com prazos configuráveis", "Alertas persistentes, lembretes de arquivados e repetição limitada", "Exportação contábil em CSV e PDF"],
  },
  {
    id: "seguranca",
    kicker: "Controle",
    title: "Usuários, backup e segurança",
    summary: "Separe acessos, mantenha rastreabilidade e proteja o banco usado no dia a dia.",
    icon: "bi-lock",
    items: ["Assistente inicial com ativação antes da criação da conta administrativa", "Nome de exibição e permissões por grupo de função", "Auditoria de alterações e ações sensíveis", "Banco local criptografado e backups autenticados", "Restauração testada, cópia externa e recuperação ao minimizar", "Atualizações assinadas, aviso offline e validação periódica da licença"],
  },
];

export const documents = [
  { src: assetPath("/assets/img/documentos/orcamento.png"), title: "Orçamento profissional", caption: "Cliente, aparelho, avaliação técnica, serviços e valores em um PDF padronizado." },
  { src: assetPath("/assets/img/documentos/orcamento-detalhes.png"), title: "Condições, aprovação e assinatura", caption: "Valores, forma de pagamento, aprovação do cliente, garantias e assinaturas no fechamento do orçamento." },
  { src: assetPath("/assets/img/documentos/comprovante-retirada.png"), title: "Comprovante de retirada", caption: "Serviços realizados, valores, declaração de entrega e responsáveis em uma página clara." },
  { src: assetPath("/assets/img/documentos/compra-usado.png"), title: "Comprovante de compra de usado", caption: "Procedência, identificadores, testes, valor e assinaturas." },
  { src: assetPath("/assets/img/documentos/ficha-tecnica.png"), title: "Ficha técnica", caption: "Diagnóstico, testes e informações do aparelho organizados para a bancada." },
  { src: assetPath("/assets/img/documentos/pasta-garantia.png"), title: "Conclusão de garantia", caption: "Avaliação, serviços, peças substituídas, decisão e responsáveis em um comprovante próprio." },
];

export const visualGallery = documents;

export const faqs = [
  { q: "Para quem o aplicativo foi desenvolvido?", a: "Para assistências técnicas, lojas de celulares e informática, técnicos independentes e negócios que precisam controlar entrada e saída de equipamentos, orçamentos, manutenção, documentos e garantia." },
  { q: "Preciso instalar alguma coisa?", a: "Sim. O aplicativo completo é instalado no computador Windows 64 bits da assistência. O instalador inclui os termos e prepara a estrutura local necessária." },
  { q: "Em quais computadores o aplicativo funciona?", a: "A versão atual é feita para Windows 10 ou Windows 11 em 64 bits. Ela é instalada no computador principal da assistência. O painel operacional completo fica nesse computador; o convite individual de avaliação pode ser aberto pelo técnico em outro computador ou celular durante as 8 horas de validade." },
  { q: "Precisa de internet para trabalhar?", a: "Os dados operacionais ficam no computador. Depois de uma validação online válida, a janela offline assinada pode chegar a 24 horas, sem ultrapassar o vencimento comercial ou o fim do teste. O cabeçalho avisa quando a conexão cai; é preciso reconectar dentro desse prazo para renovar a licença, receber revogações e usar sincronização e atualizações." },
  { q: "Onde os dados ficam salvos?", a: "O banco principal fica no computador da loja em SQLite criptografado. O aplicativo oferece backups protegidos e uma cópia externa configurável. Quando a sincronização estiver habilitada e autorizada, os eventos previstos nos termos podem seguir para a infraestrutura do produto." },
  { q: "Como a licença é ativada?", a: "Na primeira abertura, informe no aplicativo a chave de ativação recebida após a compra. A autorização é vinculada à instalação e o acesso só é liberado depois da confirmação da chave." },
  { q: "Posso usar a mesma licença em mais de um computador?", a: "A contratação padrão autoriza um computador por licença. Para transferir o uso ou contratar outra ativação, fale com o suporte." },
  { q: "O que acontece quando a licença vence?", a: "Os dados permanecem preservados no computador. As funções comerciais aguardam uma renovação ou nova ativação válida." },
  { q: "A licença permanente vence?", a: "A modalidade permanente não possui data final de uso e continua sujeita às regras de uso, revogação e transferência previstas nos termos." },
  { q: "Todos os planos possuem os mesmos recursos?", a: "Sim. A diferença entre 1 mês, 6 meses, 1 ano e permanente é o período da licença. Alguns módulos operacionais, como comércio de aparelhos e estoque, podem ser ligados ou desligados pela própria empresa para adaptar a interface à rotina, sem mudar o plano contratado nem apagar o histórico." },
  { q: "Quanto custa a licença?", a: `A licença mensal custa ${SITE_CONFIG.plans.monthly}; a semestral, ${SITE_CONFIG.plans.semiannual}; a anual, ${SITE_CONFIG.plans.annual}; e a permanente, ${SITE_CONFIG.plans.permanent}. A compra é combinada diretamente pelo WhatsApp, sem cobrança automática no site.` },
  { q: "Posso cancelar e pedir reembolso?", a: `Nas contratações realizadas à distância, o consumidor pode exercer o direito de arrependimento em até 7 dias corridos, contados da assinatura ou do recebimento do produto ou serviço. O pedido é registrado diretamente pelo WhatsApp ${SITE_CONFIG.whatsappDisplay}; a licença é encerrada e os valores pagos são devolvidos integralmente, sem multa ou retenção.` },
  { q: "Posso testar antes de comprar?", a: `Sim. O teste grátis libera o aplicativo por ${PRODUCT_CONFIG.trialDays} dia${PRODUCT_CONFIG.trialDays === 1 ? "" : "s"} para conhecer os recursos e o modo demonstração. A solicitação é feita pelo WhatsApp e não exige pagamento.` },
  { q: "O sistema gera documentos e permite impressão?", a: "Sim. O sistema prepara orçamento, ordem de serviço, comprovante de retirada, ficha técnica, garantia, etiquetas, compra e venda de aparelhos, transferência de dados, pós-formatação e relatórios. Os arquivos são baixados automaticamente e podem ser impressos conforme o fluxo." },
  { q: "Como funciona a garantia?", a: "A garantia é aberta a partir de um orçamento finalizado. Ela mantém cliente, aparelho e origem do atendimento, registra avaliação, decisão, andamento e responsável, e permite gerar comprovante. Exclusões exigem permissão e confirmação." },
  { q: "Posso configurar validade, arquivamento e vencimento dos orçamentos?", a: "Sim. A loja define a validade padrão e pode ajustar cada orçamento. Por padrão, o vencimento ocorre em 15 dias e as pendências de aprovação podem ser arquivadas após 7 dias. A expiração automática, os dias úteis e os lembretes podem ser configurados em Administração." },
  { q: "Como o técnico informa diagnóstico e valores à distância?", a: "Em Aguardando técnico, a loja pode enviar um link individual válido por 8 horas. O técnico vê apenas o atendimento necessário e informa o defeito constatado, o resultado da avaliação e uma ou mais alternativas de peça e valor por serviço. A resposta gera um aviso e só altera o orçamento depois da revisão e confirmação da loja." },
  { q: "Como o link do técnico é protegido?", a: "O convite usa um token longo e individual, expira em 8 horas e pode exigir uma senha numérica opcional de 4 a 12 dígitos. A senha nunca aparece no endereço. A loja pode revogar o acesso ou gerar outro link; editar o orçamento invalida o convite anterior, e a resposta do técnico continua dependendo da revisão da loja." },
  { q: "As notificações continuam aparecendo se eu não visualizar?", a: "Os alertas operacionais importantes permanecem disponíveis até serem vistos. Depois que um prazo configurado é atingido, os lembretes podem reaparecer até duas vezes por dia, inclusive para orçamentos arquivados. A loja também pode iniciar o aplicativo com o Windows para manter o acompanhamento ativo." },
  { q: "Consigo importar, exportar clientes e restaurar um backup?", a: "Sim. A Central de Backup valida a integridade antes da restauração, permite cópia externa e oferece importação por CSV com prévia, detecção de conflitos e backup automático. A exportação gera um arquivo portátil com os dados cadastrados. Restauração e importação exigem uma conta autorizada." },
  { q: "O backup continua protegido se eu clicar no X ou o computador desligar?", a: "Ao fechar a janela, o aplicativo pode continuar minimizado e avisa que a proteção segue em segundo plano. O banco usa transações e cópias autenticadas para reduzir risco de corrupção; no próximo uso, a restauração ainda é testada antes de substituir os dados atuais. A cópia externa continua recomendada para falha física do computador." },
  { q: "Como funciona a transferência de dados?", a: "Atendimentos compatíveis recebem uma ficha própria para identificar aparelho de origem e destino, contas, números, autorizações e conferências. Campos vazios não aparecem no PDF, e credenciais digitadas não são salvas no cadastro, banco, backup ou nuvem." },
  { q: "Como baixo e atualizo o aplicativo?", a: "O botão Baixar app consulta a release mais recente no repositório oficial. Depois de instalado, o aplicativo verifica pacotes assinados, pode prepará-los em segundo plano e conclui a instalação no fechamento. O canal beta é opcional." },
  { q: "É possível usar em celular?", a: "O aplicativo completo é para Windows. No celular, o técnico pode abrir o convite individual protegido e válido por 8 horas enviado pela assistência; esse recurso não substitui a instalação completa." },
  { q: "Posso usar mais de um usuário?", a: "Sim. Administradores podem criar operadores e configurar perfis como atendente, técnico, gerente ou personalizado, liberando apenas os grupos necessários. O atendimento usa o nome de exibição, não o login." },
  { q: "Como funciona o nome de exibição dos usuários?", a: "Contas individuais usam nome e sobrenome. O primeiro nome precisa corresponder ao nome-base do login e o sobrenome não pode repetir o de outro usuário da mesma loja; se já existir, o sistema pede outro. A conta principal da loja não segue essa limitação." },
  { q: "As observações da licença aparecem no aplicativo?", a: "Sim. Prazo, dias restantes e a observação administrativa definida no licenciador são exibidos na área da licença. Mensagens de encerramento e do fim do teste também orientam a loja sobre o motivo e o próximo passo." },
  { q: "Consigo mudar a pasta dos PDFs?", a: "Sim. Os documentos são baixados automaticamente em Downloads por padrão, e uma conta administrativa pode escolher outra pasta nas Configurações." },
  { q: "O sistema envia a mensagem sozinho?", a: "O aplicativo prepara e confere o texto no endereço do WhatsApp. O envio final depende da confirmação no próprio WhatsApp, preservando o controle do atendente." },
];

export type GuideArticle = { id: string; category: string; title: string; summary: string; body: string[]; steps?: string[]; tips?: string[]; image?: { src: string; alt: string; caption: string } };

export const guideArticles: GuideArticle[] = [
  { id: "instalacao", category: "Começar", title: "Instalação e primeiro acesso", summary: "Ative a licença e conclua o assistente inicial antes de começar.", body: ["Use um computador com Windows 10 ou 11 em 64 bits. Execute o instalador oficial e conclua os termos apresentados.", "Na primeira abertura, a licença é confirmada antes da criação da conta administrativa. Em seguida, o assistente inicial ajuda a cadastrar a empresa, definir preferências de prazo e preparar o primeiro técnico."], steps: ["Baixar a versão mais recente", "Concluir a instalação no Windows", "Informar a chave de ativação", "Criar a conta administrativa", "Concluir o assistente inicial"], tips: ["O painel completo fica restrito ao computador principal; para outro dispositivo, envie um convite individual de 8 horas."] },
  { id: "configuracao", category: "Começar", title: "Configurar a empresa", summary: "Aplique nome, contatos, endereço, logotipo e preferências aos documentos.", body: ["Em Administração, abra Dados da empresa. Preencha somente informações oficiais e revise a prévia.", "O aplicativo limita campos longos para proteger o layout. Depois de salvar, a identidade da loja aparece na navegação, PDFs e mensagens."], steps: ["Cadastrar nome e razão comercial", "Informar telefone, CNPJ, endereço e Instagram", "Escolher logotipo PNG, JPG ou WebP", "Revisar horários de atendimento e textos de garantia"] },
  { id: "novo-orcamento", category: "Orçamentos", title: "Criar um orçamento", summary: "Cadastre cliente, aparelho, serviços, valores e condições em cinco etapas.", body: ["Abra Novo orçamento. Clientes já cadastrados aparecem como sugestões enquanto você digita nome ou telefone.", "Campos do cliente: nome completo, Telefone / WhatsApp, outros números, CPF/CNPJ, e-mail, endereço e observação de contato. O nome exige primeiro e segundo nome.", "Campos do aparelho: tipo, marca, modelo, cor, IMEI, série, acessórios, relato do cliente, diagnóstico técnico, estado visual, acesso protegido e fotos de recebimento.", "Em Serviços e peças, escolha descrição, quantidade, valor unitário e complemento. Condições e pagamento reúne status, sinal, desconto, forma de pagamento, validade e prazo estimado.", "Adicione cada serviço ou peça, revise valores, prazo, desconto, entrada e forma de pagamento. Ao personalizar o prazo estimado, o novo valor pode ser salvo como padrão para os próximos orçamentos."], steps: ["Selecionar ou cadastrar o cliente", "Identificar o aparelho", "Registrar relato, diagnóstico e condições", "Adicionar serviços e peças", "Revisar e salvar"], tips: ["Quando o preço ainda não existe, use Aguardando técnico. PDF e envio ficam protegidos até os valores serem preenchidos.", "A validade padrão é de 15 dias, mas pode ser alterada pela loja ou no próprio orçamento.", "Enter avança pelos campos obrigatórios; Shift + Enter cria uma nova linha em textos longos."] },
  { id: "aprovacao", category: "Orçamentos", title: "Registrar aprovação e desconto", summary: "Guarde quem aprovou, por qual canal e exatamente qual versão foi aceita.", body: ["Ao enviar o orçamento para aprovação, o sistema mantém a versão preparada. Registre o canal e quem aprovou antes de iniciar a manutenção.", "Após sete dias em Aguardando aprovação, o sistema pode oferecer desconto. Informe a porcentagem no modal; o valor é atualizado, o desconto fica indicado e uma mensagem é preparada para o cliente."], steps: ["Abrir o orçamento em Atendimentos", "Revisar serviços e valor", "Informar canal e quem aprovou", "Registrar e iniciar manutenção"] },
  { id: "atendimentos", category: "Operação", title: "Pesquisar e acompanhar Atendimentos", summary: "Encontre orçamentos, serviços e retiradas, agrupando os registros vinculados.", body: ["Pesquise por orçamento, OS, cliente, telefone, aparelho, IMEI, serviço ou responsável. Combine filtros de status, aparelho e período.", "As visões de ativos, encerrados e aparelhos abandonados mantêm o trabalho separado. Orçamentos vinculados aparecem juntos com o resumo do atendimento."], steps: ["Escolher Ativos, Encerrados ou Aparelhos abandonados", "Aplicar pesquisa e filtros", "Ordenar por atualização, criação, valor ou status", "Abrir o registro desejado"] },
  { id: "manutencao", category: "Operação", title: "Controlar manutenção e painel técnico", summary: "Registre o trabalho real e deixe o técnico informar somente o que precisa.", body: ["O tempo começa quando o orçamento entra em Em manutenção e termina ao passar para Pronto para retirada. Durações inferiores a 15 minutos não entram nos indicadores; serviços que pulam a manutenção também não contam.", "Em Aguardando técnico, selecione um técnico quando houver profissionais disponíveis. A loja configura quais avisos cada profissional recebe, inclusive quando um aparelho entra em garantia.", "O painel completo abre somente no computador principal. Em outro dispositivo, o técnico usa um convite individual de 8 horas. A loja pode exigir senha numérica de 4 a 12 dígitos, revogar o acesso ou gerar outro link; a senha nunca entra no endereço e qualquer edição no orçamento invalida o convite anterior.", "O técnico informa diagnóstico, resultado da avaliação e múltiplas alternativas de peça e valor por serviço. Nada é aplicado até a loja revisar e confirmar. Se uma peça estiver indisponível, o atendimento pode ser encaminhado para Procurar peças sem redigitação."], steps: ["Selecionar o técnico e preparar o convite", "Definir a senha opcional e enviar o link", "Revisar a resposta técnica recebida", "Aplicar ou descartar diagnóstico, resultado e valores", "Encaminhar peças indisponíveis para procura", "Registrar aprovação e iniciar a manutenção", "Concluir em Pronto para retirada"], tips: ["O aplicativo abre uma mensagem por vez: primeiro o contato principal do fluxo e depois oferece a ação complementar ao técnico."] },
  { id: "pecas", category: "Operação", title: "Peças procuradas e estoque", summary: "Acompanhe demandas sem estoque e movimentações das peças reais.", body: ["Em Peças, registre cliente, item, modelo compatível, fornecedor e urgência. Enquanto estiver Procurando, use Pesquisei hoje para agendar nova conferência em sete dias.", "Quando encontrar, use Encontrada / avisar. Ao terminar, registre Venda ou Desistência. O estoque real controla saldos, custos e movimentações sem permitir quantidade negativa."], steps: ["Cadastrar a procura ou peça", "Revisar lembretes", "Registrar pesquisa ou entrada", "Avisar o cliente", "Finalizar o resultado"] },
  { id: "clientes", category: "Relacionamento", title: "Clientes e aparelhos", summary: "Consulte cadastros, histórico e vínculos comerciais sem perder o nome completo.", body: ["A busca aceita dados pessoais e identificadores do aparelho. Nomes longos aparecem abreviados apenas nos cartões; o perfil e os documentos mantêm o nome completo.", "Uma atenção interna deixa um aviso visível no perfil e assim que o cliente é escolhido em um novo orçamento; o atendente pode abrir o motivo antes de continuar.", "Compras e vendas aparecem no perfil como Comprado ou Vendido. Remover um aparelho do perfil não altera documentos antigos. A portabilidade exporta os cadastros e a importação por CSV mostra prévia, duplicidades e conflitos antes de gravar.", "Ofertas autorizadas registram origem e data do consentimento. Se a autorização for retirada, o cliente deixa de aparecer nas campanhas futuras; sorteios também respeitam os filtros de elegibilidade."], tips: ["Possíveis duplicados apenas sinaliza cadastros semelhantes; o sistema nunca une clientes automaticamente."] },
  { id: "compra-venda", category: "Aparelhos", title: "Comprar e vender aparelhos", summary: "Documente procedência, estoque, estado e comprador.", body: ["Na compra de usado, selecione um vendedor existente ou cadastre seus dados. Registre IMEIs, série, estado, acessórios, testes e valor.", "Disponível para venda envia o item ao estoque. Ao vender, selecione o aparelho para preencher seus identificadores, informe o comprador e gere o comprovante."], steps: ["Cadastrar compra e procedência", "Conferir identidade e IMEI", "Definir o estado do aparelho", "Disponibilizar no estoque", "Registrar a venda"], image: { src: assetPath("/assets/img/documentos/compra-usado.png"), alt: "Comprovante de compra de aparelho usado", caption: "Procedência, identificadores, avaliação e assinaturas em um só documento." } },
  { id: "garantias", category: "Pós-atendimento", title: "Abrir e concluir uma garantia", summary: "Vincule o retorno ao serviço original e registre a decisão técnica.", body: ["A garantia nasce de um orçamento finalizado. Localize por cliente, aparelho, IMEI, orçamento ou número da garantia.", "A loja define um prazo padrão nos Templates. Em cada garantia, uma conta autorizada pode ajustar o prazo e os demais campos aplicáveis sem alterar documentos antigos.", "Registre avaliação, decisão, serviços e peças realizados. O andamento guarda responsáveis e mudanças. Uma conta autorizada pode excluir uma garantia criada incorretamente, removendo também a mensagem correspondente de Atendimentos e preservando a auditoria necessária."], steps: ["Abrir a partir do atendimento finalizado", "Revisar ou ajustar o prazo", "Avaliar o problema e registrar a decisão", "Informar serviços e peças e gerar o comprovante"], image: { src: assetPath("/assets/img/documentos/comprovante-retirada.png"), alt: "Comprovante de retirada gerado pelo aplicativo", caption: "Entrega, serviços, valores e responsáveis reunidos de forma clara." } },
  { id: "documentos", category: "Templates", title: "Configurar templates, PDFs e mensagens", summary: "Mantenha modelos e documentos da loja em uma área central.", body: ["A categoria Templates reúne os modelos de mensagens, os textos e regras de garantia e as configurações dos documentos. Assim, a equipe não precisa procurar essas opções em áreas diferentes.", "PDFs, comprovantes, fichas, etiquetas e relatórios são gravados automaticamente em Downloads. Administradores podem escolher outra pasta.", "Quando o cliente possui vários números, selecione qual contato receberá a mensagem. O aplicativo confere se o texto preparado chegou ao endereço do WhatsApp; o atendente confirma o envio no WhatsApp."], tips: ["Produtos vinculados geram uma pasta única de retirada e garantia, mas cada produto mantém serviços, valores e obrigações separados."], image: { src: assetPath("/assets/img/documentos/orcamento.png"), alt: "Orçamento em PDF", caption: "Cliente, aparelho, avaliação técnica e valores apresentados com clareza." } },
  { id: "transferencia", category: "Templates", title: "Transferência de dados e pós-formatação", summary: "Crie checklists temporários sem gravar credenciais no cadastro.", body: ["Em serviços de transferência, identifique origem, destino, números, contas e tipos de dados autorizados. Campos vazios não aparecem no PDF.", "Após formatação, gere um guia com contas novas, recuperação, telefone, PIN e Wi-Fi. As credenciais existem apenas enquanto a ficha está aberta e não são salvas no orçamento, banco, backup ou nuvem."], tips: ["O PDF pode conter senhas legíveis. Entregue somente ao cliente e apague cópias quando não forem mais necessárias."] },
  { id: "indicadores", category: "Gestão", title: "Ler indicadores e relatórios", summary: "Entenda o que entra em faturamento, tempos, funil e previsão.", body: ["Faturamento e ticket médio consideram atendimentos finalizados no período. Valores ativos, cancelados, rejeitados ou expirados não entram.", "O funil usa a data de criação do orçamento. A previsão de demanda é local e pondera os três meses mais recentes. Relatórios contábeis podem incluir serviços finalizados, vendas e compras de usados."], tips: ["O painel de exceções sinaliza situações; ele não altera registros automaticamente."] },
  { id: "automacoes", category: "Administração", title: "Configurar prazos, automações e notificações", summary: "Adapte vencimentos e lembretes à rotina da loja.", body: ["Na Central de automações, escolha a validade padrão dos orçamentos, o cancelamento por prazo esgotado e quando uma aprovação pendente deve ser arquivada. Os padrões iniciais são 15 dias de validade e 7 dias para arquivamento.", "Você pode considerar apenas dias úteis, lembrar orçamentos arquivados e definir os prazos de cada aviso. Notificações operacionais importantes permanecem disponíveis até serem visualizadas.", "Depois que um prazo é atingido, o aplicativo pode repetir o lembrete até duas vezes por dia. Ative a inicialização com o Windows quando quiser manter esse acompanhamento disponível durante a rotina."], steps: ["Abrir Administração e Central de automações", "Revisar validade e arquivamento", "Escolher dias corridos ou úteis", "Configurar lembretes e notificações", "Salvar e acompanhar os avisos"] },
  { id: "usuarios", category: "Administração", title: "Usuários, nomes de exibição e auditoria", summary: "Entregue a cada pessoa somente as funções necessárias e identifique corretamente cada atendimento.", body: ["Administradores criam operadores com perfis de atendente, técnico, gerente ou personalizado. Grupos sensíveis, como restauração, exclusão, vendas e auditoria, podem ser liberados separadamente.", "As contas individuais recebem nome e sobrenome de exibição. O primeiro nome acompanha o nome-base do login e o sobrenome deve ser único na loja; a conta principal da loja é exceção. Documentos e responsáveis passam a mostrar o nome de exibição, não o identificador usado para entrar.", "A matriz auditável resume acessos efetivos e pode ser recolhida. Mudanças importantes guardam responsável, estado anterior e novo estado."], steps: ["Criar uma conta individual", "Definir nome e sobrenome de exibição", "Escolher o perfil", "Ajustar permissões adicionais", "Entregar senha temporária", "Revisar logs periodicamente"] },
  { id: "backup", category: "Segurança", title: "Backup, restauração e portabilidade", summary: "Proteja a operação, valide arquivos e leve os dados com revisão.", body: ["O aplicativo cria backups protegidos, pode manter uma cópia externa e prepara uma cópia de recuperação ao ser minimizado. Ao clicar no X, a interface explica quando o processo continua em segundo plano.", "Antes da restauração, a Central de Backup testa a integridade e rejeita arquivos alterados ou incompatíveis. Não edite o banco manualmente; confira a origem e use apenas o fluxo do aplicativo.", "A portabilidade exporta os dados de clientes e aceita importação por CSV compatível. A prévia mostra conflitos e duplicidades, e um backup automático é criado antes da gravação."], steps: ["Configurar uma pasta externa", "Criar e guardar uma cópia atual", "Testar o arquivo antes de restaurar", "Revisar a prévia de importação", "Confirmar e conferir os registros"], tips: ["Mantenha pelo menos uma cópia protegida em local separado do computador principal."] },
  { id: "atualizacoes", category: "Segurança", title: "Atualizações e licença", summary: "Mantenha o aplicativo atualizado e com os dados preservados.", body: ["O canal estável recebe versões oficiais. O canal beta é opcional. Uma atualização válida pode ser baixada e instalada no fechamento.", "Se a licença expirar ou for revogada, os dados continuam preservados e as funções comerciais aguardam uma autorização válida."], steps: ["Verificar o canal nas Configurações", "Fechar o aplicativo para instalar uma atualização pronta", "Informar uma nova chave de ativação quando necessário"] },
  { id: "atalhos", category: "Produtividade", title: "Atalhos de teclado", summary: "Trabalhe sem tirar as mãos do teclado.", body: ["F1 abre a Ajuda; Ctrl + N ou F2 cria orçamento; Ctrl + K abre a pesquisa; Ctrl + S ou F3 salva; F4 adiciona serviço; F6 abre Atendimentos; Esc fecha janelas.", "Alt + 1 a Alt + 5 navega entre áreas principais. Nos formulários, Enter avança para a próxima ação obrigatória e Shift + Enter cria linha em textos longos."] },
];
