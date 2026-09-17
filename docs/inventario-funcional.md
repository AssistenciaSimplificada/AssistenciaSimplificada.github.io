# Inventário funcional usado no site

Base de conferência: aplicativo **Assistência Simplificada 9.1.6**, documentação atual, componentes, regras de domínio, migrações locais e suítes automatizadas verificadas em 28/08/2026.

## Áreas apresentadas

- Orçamentos, ordens de serviço, alternativas sem escolha imediata, itens com preço pendente, aprovação geral com decisão por serviço, revisões, validade, expiração, renovação, arquivamento, vínculos, desconto em porcentagem ou reais, entrada, saldo e juros opcionais.
- Clientes, empresas, contatos, aparelhos, atenção interna, pesquisa, autocompletar, recorrência, importação e exportação CSV, prévia, conflitos e possíveis duplicidades.
- Técnicos, manutenção, painel local, link individual de avaliação por 24 horas, senha opcional, revogação, invalidação após edição salva, múltiplos valores, ciclo completo de peças procuradas e estoque real.
- Garantias por item com prazo congelado no atendimento, aviso ao técnico, acessórios para devolver, retiradas, produtos vinculados, aparelhos abandonados e contatos de acompanhamento.
- Entrada, avaliação, estoque e venda de aparelhos novos ou usados, com custo de compra opcional.
- Vitrine pública automática com link da loja, galeria, destaque, condições comerciais e contato por WhatsApp.
- Fotos de aparelhos pelo computador ou por QR Code temporário na rede local.
- Agenda integrada à Visão geral e anotações coloridas com fixação, busca e ordenação por arraste.
- Templates de mensagens, documentos e garantia em uma área central.
- Documentos: orçamento, OS, retirada, ficha técnica, etiquetas, transferência, pós-formatação, compra, venda e relatórios.
- Indicadores, funil, previsão, automações, notificações, desempenho técnico e exportação contábil.
- Usuários, nomes de exibição, permissões, auditoria, banco criptografado, backup, restauração testada, cópia externa, recuperação ao minimizar e atualização conferida antes da instalação.

## Regras que orientam o conteúdo

- Produto completo: Windows 10 ou 11, 64 bits.
- Primeiro acesso: a licença é confirmada antes da criação da conta administrativa e do assistente inicial.
- Ciclo do orçamento: validade padrão de 15 dias e arquivamento de aprovação pendente após 7 dias, ambos configuráveis.
- Histórico: páginas de 50 registros consultadas diretamente no SQLite, busca e filtros na base completa, salto direto de página e indicadores agregados sem depender do snapshot inicial.
- Aprovação: escolher Em manutenção no editor prepara a transição; canal e responsável são solicitados apenas ao salvar ou usar PDF + WhatsApp.
- Pagamento: até oito perfis de maquininha, cada um com Pix, débito e crédito de 1x a 12x; juros opcionais aparecem separados em orçamento, venda, mensagens e documentos.
- Prazo estimado: um valor personalizado ao criar orçamento pode ser mantido como padrão para os próximos registros.
- Notificações: alertas importantes permanecem disponíveis até serem vistos; depois do prazo configurado, podem reaparecer no máximo duas vezes por dia.
- Técnico: o painel completo fica restrito ao computador principal; em outro dispositivo, o profissional usa um convite individual de 24 horas. A senha opcional tem de 4 a 12 dígitos, não entra no endereço e o convite anterior é invalidado quando uma edição é salva.
- Resposta técnica: nunca altera automaticamente o orçamento; a loja recebe um aviso e decide aplicar ou descartar.
- Mensagens: o texto é preparado e conferido, mas o envio final depende da confirmação no WhatsApp.
- Manutenção: conta somente quando o atendimento passa por Em manutenção e dura pelo menos 15 minutos.
- Credenciais de transferência e pós-formatação: temporárias, não gravadas no banco, backup ou nuvem.
- Operação principal: banco SQLite local criptografado, com conectividade usada para licença, link técnico, sincronização autorizada e atualizações.
- Demonstração: dados fictícios e base separada.
- Licença inválida, expirada ou revogada: dados preservados e funções comerciais aguardam nova autorização válida.
- Atualização: canais estável e beta, conferência automática e instalação controlada no fechamento.
- Backup e portabilidade: arquivos são validados antes da restauração; clientes podem ser importados com prévia e revisão ou exportados em formato portátil.
- Usuários: contas individuais exibem nome e sobrenome; o primeiro nome acompanha o nome-base do login e o sobrenome é único na loja. A conta principal da loja é exceção.
- Licença: o aplicativo mostra prazo, dias restantes, observação administrativa, motivo de encerramento e orientação ao final do teste; a operação offline assinada pode chegar a 24 horas.

## Conteúdo deliberadamente não publicado

- Chaves, segredos, tokens, endpoints administrativos ou instruções internas de emissão.
- Detalhes de implementação que ajudem a contornar licença, atualização ou controle de acesso.
- Capturas que contenham nomes, telefones ou dados reais.
- Afirmações encontradas somente em manuais históricos e não confirmadas na versão 9.1.6.

## Configuração comercial atual

- Produto: Assistência Simplificada.
- Versão anunciada: 9.1.6.
- Modalidades: 1 mês, 6 meses, 1 ano e permanente, todas com os mesmos recursos.
- Compra e teste: atendimento assistido pelo WhatsApp; o site não realiza cobrança nem coleta dados em formulário próprio.
