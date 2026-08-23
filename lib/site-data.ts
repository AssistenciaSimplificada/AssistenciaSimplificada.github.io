export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";
export const assetPath = (path: string) => `${BASE_PATH}${path}`;
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://gabrielschmeisk.github.io/orcamentos-simplificados-site";

const WHATSAPP_NUMBER = "5516994241388";
export const whatsappLink = (message: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

export const PRODUCT = {
  name: "Orçamentos Simplificados",
  version: "8.0.2",
  platform: "Windows 10 ou 11, 64 bits",
  purchaseLink: "/planos",
  contactLink: whatsappLink(
    "Olá! Quero conhecer melhor o Orçamentos Simplificados para minha assistência técnica.",
  ),
  trialLink: whatsappLink(
    "Olá! Quero solicitar o teste grátis de 1 dia do Orçamentos Simplificados. Pode me ajudar com a ativação?",
  ),
  whatsappDisplay: "(16) 99424-1388",
  supportLink: "/faq#suporte",
};

export const plans = [
  {
    name: "1 mês",
    price: "R$ 59,90",
    description: "Para começar com baixo compromisso e usar o sistema completo.",
    purchaseLink: whatsappLink(
      "Olá! Quero adquirir a licença mensal (1 mês) do Orçamentos Simplificados por R$ 59,90. Pode me orientar sobre a ativação?",
    ),
  },
  {
    name: "6 meses",
    price: "R$ 299,90",
    description: "Economize R$ 59,50 em relação à renovação mensal.",
    purchaseLink: whatsappLink(
      "Olá! Quero adquirir a licença semestral (6 meses) do Orçamentos Simplificados por R$ 299,90. Pode me orientar sobre a ativação?",
    ),
  },
  {
    name: "1 ano",
    price: "R$ 499,90",
    description: "Economize R$ 218,90 e mantenha a operação tranquila por um ano.",
    featured: true,
    badge: "Melhor custo-benefício",
    purchaseLink: whatsappLink(
      "Olá! Quero adquirir a licença anual (1 ano) do Orçamentos Simplificados por R$ 499,90. Pode me orientar sobre a ativação?",
    ),
  },
  {
    name: "Permanente",
    price: "R$ 999,90",
    description: "Licença sem vencimento para esta instalação, com pagamento único.",
    purchaseLink: whatsappLink(
      "Olá! Quero adquirir a licença permanente do Orçamentos Simplificados por R$ 999,90. Pode me orientar sobre a ativação?",
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
    title: "Orçamentos e ordens de serviço",
    summary: "Registre o que entrou, o que foi relatado, o diagnóstico, os serviços, valores, prazos e aprovações.",
    icon: "bi-clipboard2-check",
    items: ["Cadastro guiado de cliente e aparelho", "Serviços, peças, desconto, entrada e condição de pagamento", "Aprovação registrada com canal, responsável e versão aceita", "Status do orçamento e linha do tempo auditável", "Atendimentos com aparelhos vinculados e documentos conjuntos", "Oferta de desconto para aprovações paradas há 7 dias"],
  },
  {
    id: "clientes",
    kicker: "Relacionamento",
    title: "Clientes e aparelhos",
    summary: "Encontre rapidamente o histórico de pessoas e empresas, mesmo quando a base já tiver milhares de registros.",
    icon: "bi-people",
    items: ["Pesquisa por nome, telefone, CPF/CNPJ, e-mail, aparelho, IMEI ou série", "Autocompletar dados em orçamentos e áreas operacionais", "Perfil com contatos, aparelhos e atendimentos", "Identificação de aparelhos comprados ou vendidos", "Filtros de atividade, recorrência, VIP e possíveis duplicados", "Sorteio usando apenas clientes elegíveis do filtro atual"],
  },
  {
    id: "operacao",
    kicker: "Oficina",
    title: "Técnicos, manutenção e peças",
    summary: "Acompanhe o trabalho em andamento, o que aguarda análise e as peças que ainda precisam ser encontradas.",
    icon: "bi-tools",
    items: ["Painel técnico para a mesma rede local", "Aviso ao técnico com o relato informado pelo cliente", "Tempo de manutenção a partir de 15 minutos", "Estoque real de peças com custo e movimentação", "Lista de peças procuradas, urgência e lembretes", "Ficha técnica compacta de 17 × 15 cm em folha A4"],
  },
  {
    id: "garantias",
    kicker: "Pós-atendimento",
    title: "Garantias e retiradas",
    summary: "Documente a entrega, acompanhe retornos e mantenha cada decisão registrada.",
    icon: "bi-shield-check",
    items: ["Garantia criada a partir do atendimento finalizado", "Avaliação, decisão, andamento e responsável", "Pesquisa por cliente, aparelho, IMEI e número", "Exclusão controlada de garantia preenchida incorretamente", "Pasta única para retirada de produtos vinculados", "Acompanhamento de aparelhos prontos há 30 dias ou mais"],
  },
  {
    id: "aparelhos",
    kicker: "Comércio",
    title: "Compra, estoque e venda de aparelhos",
    summary: "Registre procedência, identificadores, estado, entrada no estoque e a venda ao comprador.",
    icon: "bi-phone",
    items: ["Compra de usados com declaração de procedência", "IMEI, série, acessórios, avaliação e testes", "Estados Em análise, Disponível, Retirada de peças, Vendido e Cancelado", "Identificação comercial PayJoy", "Venda com preenchimento a partir do estoque", "Comprovantes próprios de compra e venda"],
  },
  {
    id: "documentos",
    kicker: "Documentação",
    title: "PDFs e mensagens prontos para usar",
    summary: "Gere documentos com os dados da loja e abra mensagens preparadas para o contato escolhido.",
    icon: "bi-file-earmark-pdf",
    items: ["Orçamento, ordem de serviço e comprovante de retirada", "Ficha técnica, garantia e etiquetas", "Ficha de transferência de dados", "Guia de contas após formatação", "Downloads automáticos na pasta escolhida", "Mensagens personalizáveis com conferência antes de abrir o WhatsApp"],
  },
  {
    id: "gestao",
    kicker: "Gestão",
    title: "Indicadores, alertas e relatórios",
    summary: "Leia a operação com números calculados a partir dos registros reais da assistência.",
    icon: "bi-graph-up-arrow",
    items: ["Faturamento, ticket médio e atendimentos finalizados", "Tempos de manutenção e desempenho técnico", "Funil comercial e comparação com período anterior", "Previsão local de demanda", "Alertas de aprovações, pagamentos, duplicidades e peças urgentes", "Exportação contábil em CSV e PDF"],
  },
  {
    id: "seguranca",
    kicker: "Controle",
    title: "Usuários, backup e segurança",
    summary: "Separe acessos, mantenha rastreabilidade e proteja o banco usado no dia a dia.",
    icon: "bi-lock",
    items: ["Perfis e permissões por grupo de função", "Auditoria de alterações e ações sensíveis", "Banco SQLite local criptografado", "Backups autenticados e protegidos contra alteração", "Restauração e transferência controladas", "Atualizações assinadas com canais estável e beta"],
  },
];

export const documents = [
  { src: assetPath("/assets/img/documentos/orcamento.png"), title: "Orçamento profissional", caption: "Cliente, aparelho, avaliação técnica, serviços e valores em um PDF padronizado." },
  { src: assetPath("/assets/img/documentos/orcamento-detalhes.png"), title: "Condições, aprovação e assinatura", caption: "Valores, forma de pagamento, aprovação do cliente, garantias e assinaturas no fechamento do orçamento." },
  { src: assetPath("/assets/img/documentos/comprovante-retirada.png"), title: "Comprovante de retirada", caption: "Serviços realizados, valores, declaração de entrega e responsáveis em uma página clara." },
  { src: assetPath("/assets/img/documentos/compra-usado.png"), title: "Comprovante de compra de usado", caption: "Procedência, identificadores, testes, valor e assinaturas." },
  { src: assetPath("/assets/img/documentos/ficha-tecnica.png"), title: "Ficha técnica", caption: "Diagnóstico, testes e informações do aparelho organizados para a bancada." },
  { src: assetPath("/assets/img/documentos/pasta-garantia.png"), title: "Pasta de garantia", caption: "Produtos vinculados reunidos para a entrega, mantendo cada serviço identificado separadamente." },
];

export const visualGallery = documents;

export const faqs = [
  { q: "Para quem o aplicativo foi desenvolvido?", a: "Para assistências técnicas, lojas de celulares e informática, técnicos independentes e negócios que precisam controlar entrada e saída de equipamentos, orçamentos, manutenção, documentos e garantia." },
  { q: "Preciso instalar alguma coisa?", a: "Sim. O aplicativo completo é instalado no computador Windows 64 bits da assistência. O instalador inclui os termos e prepara a estrutura local necessária." },
  { q: "Em quais computadores o aplicativo funciona?", a: "A versão atual é feita para Windows 10 ou Windows 11 em 64 bits. Ela é instalada no computador principal da assistência. O painel do técnico pode ser aberto em outro computador ou celular na mesma rede local enquanto o aplicativo principal estiver aberto." },
  { q: "Precisa de internet para trabalhar?", a: "A operação principal usa o banco local e continua disponível sem internet. Conexão é necessária para funções externas, como abrir mensagens no WhatsApp, verificar ou baixar atualizações e sincronizações habilitadas." },
  { q: "Onde os dados ficam salvos?", a: "O banco principal fica no computador da loja em SQLite criptografado. O aplicativo também oferece backups protegidos. Dados operacionais aprovados podem participar da sincronização protegida prevista no produto e nos termos." },
  { q: "O que acontece quando a licença vence?", a: "Os dados permanecem preservados no computador. As funções comerciais ficam bloqueadas até que uma renovação válida seja importada." },
  { q: "A licença permanente vence?", a: "A modalidade permanente não possui data de vencimento. Ela continua sujeita à validação da instalação e aos termos de uso aplicáveis." },
  { q: "Todos os planos possuem os mesmos recursos?", a: "Sim. A diferença entre 1 mês, 6 meses, 1 ano e permanente é o período da licença; não existem módulos escondidos por modalidade." },
  { q: "Quanto custa a licença?", a: "A licença mensal custa R$ 59,90; a semestral, R$ 299,90; a anual, R$ 499,90; e a permanente, R$ 999,90. A compra é combinada diretamente pelo WhatsApp, sem cobrança automática no site." },
  { q: "Posso testar antes de comprar?", a: "Sim. O teste grátis libera o aplicativo por 1 dia para conhecer os recursos e o modo demonstração. A solicitação é feita pelo WhatsApp e não exige pagamento." },
  { q: "O sistema gera documentos e permite impressão?", a: "Sim. O sistema prepara orçamento, ordem de serviço, comprovante de retirada, ficha técnica, garantia, etiquetas, compra e venda de aparelhos, transferência de dados, pós-formatação e relatórios. Os arquivos são baixados automaticamente e podem ser impressos conforme o fluxo." },
  { q: "Como funciona a garantia?", a: "A garantia é aberta a partir de um orçamento finalizado. Ela mantém cliente, aparelho e origem do atendimento, registra avaliação, decisão, andamento e responsável, e permite gerar comprovante. Exclusões exigem permissão e confirmação." },
  { q: "Como funciona a transferência de dados?", a: "Atendimentos compatíveis recebem uma ficha própria para identificar aparelho de origem e destino, contas, números, autorizações e conferências. Campos vazios não aparecem no PDF, e credenciais digitadas não são salvas no cadastro, banco, backup ou nuvem." },
  { q: "As atualizações são automáticas?", a: "O aplicativo verifica atualizações assinadas. Quando uma versão estável aplicável é encontrada, ela pode ser baixada automaticamente e instalada no fechamento. O canal beta também é suportado, e a passagem de beta para estável foi tratada na versão atual." },
  { q: "É possível usar em celular?", a: "O aplicativo completo é para Windows. O celular pode acessar o painel técnico pela rede local, com funções operacionais limitadas; não é uma instalação completa do sistema." },
  { q: "Posso usar mais de um usuário?", a: "Sim. Administradores podem criar operadores e configurar perfis como atendente, técnico, gerente ou personalizado, liberando apenas os grupos necessários." },
  { q: "Consigo mudar a pasta dos PDFs?", a: "Sim. Os documentos são baixados automaticamente em Downloads por padrão, e uma conta administrativa pode escolher outra pasta nas Configurações." },
  { q: "O sistema envia a mensagem sozinho?", a: "O aplicativo prepara e confere o texto no endereço do WhatsApp. O envio final depende da confirmação no próprio WhatsApp, preservando o controle do atendente." },
];

export type GuideArticle = { id: string; category: string; title: string; summary: string; body: string[]; steps?: string[]; tips?: string[]; image?: { src: string; alt: string; caption: string } };

export const guideArticles: GuideArticle[] = [
  { id: "instalacao", category: "Começar", title: "Instalação e primeiro acesso", summary: "Prepare o computador, instale, ative a licença e entre com uma conta.", body: ["Use um computador com Windows 10 ou 11 em 64 bits. Execute o instalador e conclua os termos apresentados.", "Na primeira abertura, gere a solicitação de licença, envie o arquivo ao responsável pelo licenciamento e importe o arquivo recebido. Depois, entre com seu usuário e senha."], steps: ["Concluir a instalação no Windows", "Gerar o arquivo .orcrequest", "Importar o arquivo .orclicense", "Entrar e configurar os dados da empresa"], tips: ["Se o Windows exibir uma confirmação de rede, permita apenas em redes privadas."] },
  { id: "configuracao", category: "Começar", title: "Configurar a empresa", summary: "Aplique nome, contatos, endereço, logotipo e preferências aos documentos.", body: ["Em Administração, abra Dados da empresa. Preencha somente informações oficiais e revise a prévia.", "O aplicativo limita campos longos para proteger o layout. Depois de salvar, a identidade da loja aparece na navegação, PDFs e mensagens."], steps: ["Cadastrar nome e razão comercial", "Informar telefone, CNPJ, endereço e Instagram", "Escolher logotipo PNG, JPG ou WebP", "Revisar horários de atendimento e textos de garantia"] },
  { id: "novo-orcamento", category: "Orçamentos", title: "Criar um orçamento", summary: "Cadastre cliente, aparelho, serviços, valores e condições em cinco etapas.", body: ["Abra Novo orçamento. Clientes já cadastrados aparecem como sugestões enquanto você digita nome ou telefone.", "Campos do cliente: nome completo, Telefone / WhatsApp, outros números, CPF/CNPJ, e-mail, endereço e observação de contato. O nome exige primeiro e segundo nome.", "Campos do aparelho: tipo, marca, modelo, cor, IMEI, série, acessórios, relato do cliente, diagnóstico técnico, estado visual, acesso protegido e fotos de recebimento.", "Em Serviços e peças, escolha descrição, quantidade, valor unitário e complemento. Condições e pagamento reúne status, sinal, desconto, forma de pagamento, validade e prazo estimado.", "Adicione cada serviço ou peça, revise valores, prazo, desconto, entrada e forma de pagamento. Salve para registrar o atendimento."], steps: ["Selecionar ou cadastrar o cliente", "Identificar o aparelho", "Registrar relato, diagnóstico e condições", "Adicionar serviços e peças", "Revisar e salvar"], tips: ["Quando o preço ainda não existe, use Aguardando técnico. PDF e envio ficam protegidos até os valores serem preenchidos.", "Enter avança pelos campos obrigatórios; Shift + Enter cria uma nova linha em textos longos."] },
  { id: "aprovacao", category: "Orçamentos", title: "Registrar aprovação e desconto", summary: "Guarde quem aprovou, por qual canal e exatamente qual versão foi aceita.", body: ["Ao enviar o orçamento para aprovação, o sistema mantém a versão preparada. Registre o canal e quem aprovou antes de iniciar a manutenção.", "Após sete dias em Aguardando aprovação, o sistema pode oferecer desconto. Informe a porcentagem no modal; o valor é atualizado, o desconto fica indicado e uma mensagem é preparada para o cliente."], steps: ["Abrir o orçamento no Histórico", "Revisar serviços e valor", "Informar canal e quem aprovou", "Registrar e iniciar manutenção"] },
  { id: "historico", category: "Operação", title: "Pesquisar e acompanhar o Histórico", summary: "Encontre atendimentos, agrupe status e mantenha registros vinculados juntos.", body: ["Pesquise por orçamento, OS, cliente, telefone, aparelho, IMEI, serviço ou responsável. Combine filtros de status, aparelho e período.", "Status iguais reúne atendimentos pela etapa do fluxo. Os filtros escolhidos ficam salvos no computador. Orçamentos vinculados são exibidos juntos, mesmo quando apenas um foi atualizado."], steps: ["Escolher Ativos ou Encerrados", "Aplicar pesquisa e filtros", "Ordenar por atualização, criação, valor ou status", "Abrir o registro desejado"] },
  { id: "manutencao", category: "Operação", title: "Controlar manutenção e painel técnico", summary: "Registre o trabalho real e deixe o técnico atualizar somente o que precisa.", body: ["O tempo começa quando o orçamento entra em Em manutenção e termina ao passar para Pronto para retirada. Durações inferiores a 15 minutos não entram nos indicadores; serviços que pulam a manutenção também não contam.", "O painel técnico funciona na rede local. Mantenha o aplicativo principal aberto, copie o endereço em Configurações e entre com uma conta autorizada."], steps: ["Registrar aprovação", "Alterar para Em manutenção", "Atualizar diagnóstico, observações e prazo", "Concluir em Pronto para retirada"] },
  { id: "pecas", category: "Operação", title: "Peças procuradas e estoque", summary: "Acompanhe demandas sem estoque e movimentações das peças reais.", body: ["Em Peças, registre cliente, item, modelo compatível, fornecedor e urgência. Enquanto estiver Procurando, use Pesquisei hoje para agendar nova conferência em sete dias.", "Quando encontrar, use Encontrada / avisar. Ao terminar, registre Venda ou Desistência. O estoque real controla saldos, custos e movimentações sem permitir quantidade negativa."], steps: ["Cadastrar a procura ou peça", "Revisar lembretes", "Registrar pesquisa ou entrada", "Avisar o cliente", "Finalizar o resultado"] },
  { id: "clientes", category: "Relacionamento", title: "Clientes e aparelhos", summary: "Consulte cadastros, histórico e vínculos comerciais sem perder o nome completo.", body: ["A busca aceita dados pessoais e identificadores do aparelho. Nomes longos aparecem abreviados apenas nos cartões; o perfil e os documentos mantêm o nome completo.", "Compras e vendas de aparelhos aparecem no perfil como Comprado ou Vendido. Remover um aparelho do perfil não altera documentos antigos."], tips: ["Possíveis duplicados apenas sinaliza cadastros semelhantes; o sistema nunca une clientes automaticamente."] },
  { id: "compra-venda", category: "Aparelhos", title: "Comprar e vender aparelhos", summary: "Documente procedência, estoque, estado e comprador.", body: ["Na compra de usado, selecione um vendedor existente ou cadastre seus dados. Registre IMEIs, série, estado, acessórios, testes e valor.", "Disponível para venda envia o item ao estoque. Ao vender, selecione o aparelho para preencher seus identificadores, informe o comprador e gere o comprovante."], steps: ["Cadastrar compra e procedência", "Conferir identidade e IMEI", "Definir o estado do aparelho", "Disponibilizar no estoque", "Registrar a venda"], image: { src: assetPath("/assets/img/documentos/compra-usado.png"), alt: "Comprovante de compra de aparelho usado", caption: "Procedência, identificadores, avaliação e assinaturas em um só documento." } },
  { id: "garantias", category: "Pós-atendimento", title: "Abrir e concluir uma garantia", summary: "Vincule o retorno ao serviço original e registre a decisão técnica.", body: ["A garantia nasce de um orçamento finalizado. Localize por cliente, aparelho, IMEI, orçamento ou número da garantia.", "Registre avaliação, decisão e serviços realizados. O andamento guarda responsáveis e mudanças. Uma conta autorizada pode excluir uma garantia criada incorretamente, removendo também a mensagem correspondente do Histórico e preservando somente a auditoria necessária."], steps: ["Abrir a partir do atendimento finalizado", "Avaliar prazo e problema", "Registrar decisão", "Concluir e gerar comprovante"], image: { src: assetPath("/assets/img/documentos/comprovante-retirada.png"), alt: "Comprovante de retirada gerado pelo aplicativo", caption: "Entrega, serviços, valores e responsáveis reunidos de forma clara." } },
  { id: "documentos", category: "Documentos", title: "Gerar PDFs, fichas e mensagens", summary: "Baixe automaticamente cada documento e escolha o contato correto.", body: ["PDFs, comprovantes, fichas, etiquetas e relatórios são gravados automaticamente em Downloads. Administradores podem escolher outra pasta.", "Quando o cliente possui vários números, selecione qual contato receberá a mensagem. O aplicativo confere se o texto preparado chegou ao endereço do WhatsApp; o atendente confirma o envio no WhatsApp."], tips: ["Produtos vinculados geram uma pasta única de retirada e garantia, mas cada produto mantém serviços, valores e obrigações separados."], image: { src: assetPath("/assets/img/documentos/orcamento.png"), alt: "Orçamento em PDF", caption: "Cliente, aparelho, avaliação técnica e valores apresentados com clareza." } },
  { id: "transferencia", category: "Documentos", title: "Transferência de dados e pós-formatação", summary: "Crie checklists temporários sem gravar credenciais no cadastro.", body: ["Em serviços de transferência, identifique origem, destino, números, contas e tipos de dados autorizados. Campos vazios não aparecem no PDF.", "Após formatação, gere um guia com contas novas, recuperação, telefone, PIN e Wi-Fi. As credenciais existem apenas enquanto a ficha está aberta e não são salvas no orçamento, banco, backup ou nuvem."], tips: ["O PDF pode conter senhas legíveis. Entregue somente ao cliente e apague cópias quando não forem mais necessárias."] },
  { id: "indicadores", category: "Gestão", title: "Ler indicadores e relatórios", summary: "Entenda o que entra em faturamento, tempos, funil e previsão.", body: ["Faturamento e ticket médio consideram atendimentos finalizados no período. Valores ativos, cancelados, rejeitados ou expirados não entram.", "O funil usa a data de criação do orçamento. A previsão de demanda é local e pondera os três meses mais recentes. Relatórios contábeis podem incluir serviços finalizados, vendas e compras de usados."], tips: ["O painel de exceções sinaliza situações; ele não altera registros automaticamente."] },
  { id: "usuarios", category: "Administração", title: "Usuários, permissões e auditoria", summary: "Entregue a cada pessoa somente as funções necessárias.", body: ["Administradores criam operadores com perfis de atendente, técnico, gerente ou personalizado. Grupos sensíveis, como restauração, exclusão, vendas e auditoria, podem ser liberados separadamente.", "A matriz auditável resume acessos efetivos e pode ser recolhida. Mudanças importantes guardam responsável, estado anterior e novo estado."], steps: ["Criar uma conta individual", "Escolher o perfil", "Ajustar permissões adicionais", "Entregar senha temporária", "Revisar logs periodicamente"] },
  { id: "backup", category: "Segurança", title: "Backup, restauração e transferência", summary: "Proteja a operação e valide arquivos antes de restaurar.", body: ["O aplicativo cria backups protegidos e permite cópia no fechamento. Somente contas autorizadas acessam importação e restauração.", "Backups adulterados são rejeitados. Não edite arquivos do banco manualmente; use a Central de Backup e confira a origem antes de importar."], tips: ["Mantenha cópias em um local protegido e separado do computador principal."] },
  { id: "atualizacoes", category: "Segurança", title: "Atualizações e licença", summary: "Mantenha o aplicativo assinado, atualizado e com os dados preservados.", body: ["O canal estável recebe versões oficiais assinadas. O canal beta é opcional. Uma atualização válida pode ser baixada automaticamente e instalada no fechamento.", "Para renovar, gere a solicitação e importe a nova licença. Se a licença vencer, os dados continuam preservados e as funções comerciais aguardam a renovação."], steps: ["Verificar o canal nas Configurações", "Fechar o aplicativo para instalar uma atualização pronta", "Gerar solicitação quando a licença pedir renovação", "Importar o novo arquivo de licença"] },
  { id: "atalhos", category: "Produtividade", title: "Atalhos de teclado", summary: "Trabalhe sem tirar as mãos do teclado.", body: ["F1 abre a Ajuda; Ctrl + N ou F2 cria orçamento; Ctrl + K abre a pesquisa; Ctrl + S ou F3 salva; F4 adiciona serviço; F6 abre o Histórico; Esc fecha janelas.", "Alt + 1 a Alt + 5 navega entre áreas principais. Nos formulários, Enter avança para a próxima ação obrigatória e Shift + Enter cria linha em textos longos."] },
];
