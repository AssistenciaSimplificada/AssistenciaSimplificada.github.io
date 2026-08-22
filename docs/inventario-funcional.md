# Inventário funcional usado no site

Base de conferência: aplicativo `Orcamentos-8.0.1`, ajuda interna atual, notas da versão 8.0.1, componentes, regras de domínio e suítes automatizadas aprovadas em 22/08/2026.

## Áreas apresentadas

- Orçamentos, ordens de serviço, aprovação, status, pagamentos, vínculos e descontos.
- Clientes, contatos, aparelhos, pesquisa, autocompletar, recorrência e duplicidades.
- Técnicos, manutenção, painel na rede local, peças procuradas e estoque real.
- Garantias, retiradas, produtos vinculados e acompanhamento preventivo.
- Compra, estoque e venda de aparelhos usados.
- Documentos: orçamento, OS, retirada, ficha técnica, etiquetas, transferência, pós-formatação, compra, venda e relatórios.
- Indicadores, funil, previsão, exceções, desempenho técnico e exportação contábil.
- Usuários, permissões, auditoria, banco criptografado, backup e atualização assinada.

## Regras que orientam o conteúdo

- Produto completo: Windows 10 ou 11, 64 bits.
- Painel técnico: acesso limitado na mesma rede, dependente do aplicativo principal aberto.
- Operação principal: banco SQLite local criptografado; internet somente para integrações externas, atualização e sincronização habilitada.
- Mensagens: o texto é preparado e conferido, mas o envio final depende do WhatsApp.
- Manutenção: conta somente quando o atendimento passa por Em manutenção e dura pelo menos 15 minutos.
- Credenciais de transferência e pós-formatação: temporárias, não gravadas no banco, backup ou nuvem.
- Demonstração: dados fictícios e sincronização externa desativada.
- Licença vencida: dados preservados e funções comerciais bloqueadas até renovação.
- Atualização: pacote assinado, canais estável e beta, download automático aplicável e instalação no fechamento.

## Conteúdo deliberadamente não publicado

- Chaves, segredos, endpoints privados ou instruções internas de emissão.
- Capturas fornecidas pelo usuário que continham nomes, telefones ou dados reais.
- Afirmações encontradas apenas em manuais históricos das versões 2.x e 3.x.
- Preços, telefone comercial e link de checkout ainda não definidos.
