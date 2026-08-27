# Inventário funcional usado no site

Base de conferência: aplicativo **Assistência Simplificada 9.1.5**, documentação atual, componentes, regras de domínio, migrações locais e suítes automatizadas verificadas em 27/08/2026.

## Áreas apresentadas

- Orçamentos, ordens de serviço, alternativas sem escolha imediata, itens com preço pendente, aprovação imutável, revisões, validade, expiração, arquivamento, vínculos, desconto, entrada e saldo.
- Clientes, empresas, contatos, aparelhos, atenção interna, pesquisa, autocompletar, recorrência, importação e exportação CSV, prévia, conflitos e possíveis duplicidades.
- Técnicos, manutenção, painel local, link individual de avaliação por 8 horas, senha opcional, revogação, invalidação após edição, múltiplos valores, peças procuradas e estoque real.
- Garantias com prazo padrão e individual, aviso ao técnico, acessórios para devolver, retiradas, produtos vinculados, aparelhos abandonados e contatos de acompanhamento.
- Compra, estoque e venda de aparelhos usados.
- Templates de mensagens, documentos e garantia em uma área central.
- Documentos: orçamento, OS, retirada, ficha técnica, etiquetas, transferência, pós-formatação, compra, venda e relatórios.
- Indicadores, funil, previsão, automações, notificações, desempenho técnico e exportação contábil.
- Usuários, nomes de exibição, permissões, auditoria, banco criptografado, backup, restauração testada, cópia externa, recuperação ao minimizar e atualização conferida antes da instalação.

## Regras que orientam o conteúdo

- Produto completo: Windows 10 ou 11, 64 bits.
- Primeiro acesso: a licença é confirmada antes da criação da conta administrativa e do assistente inicial.
- Ciclo do orçamento: validade padrão de 15 dias e arquivamento de aprovação pendente após 7 dias, ambos configuráveis.
- Prazo estimado: um valor personalizado ao criar orçamento pode ser mantido como padrão para os próximos registros.
- Notificações: alertas importantes permanecem disponíveis até serem vistos; depois do prazo configurado, podem reaparecer no máximo duas vezes por dia.
- Técnico: o painel completo fica restrito ao computador principal; em outro dispositivo, o profissional usa um convite individual de 8 horas. A senha opcional tem de 4 a 12 dígitos, não entra no endereço e o convite anterior é invalidado quando o orçamento é editado.
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
- Afirmações encontradas somente em manuais históricos e não confirmadas na versão 9.1.5.

## Configuração comercial atual

- Produto: Assistência Simplificada.
- Versão anunciada: 9.1.5.
- Modalidades: 1 mês, 6 meses, 1 ano e permanente, todas com os mesmos recursos.
- Compra e teste: atendimento assistido pelo WhatsApp; o site não realiza cobrança nem coleta dados em formulário próprio.
