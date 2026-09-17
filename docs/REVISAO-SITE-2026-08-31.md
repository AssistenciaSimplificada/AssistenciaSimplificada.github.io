# Site: dois layouts e imagens renovadas

Revisão preparada para a publicação de 31/08/2026.

- Página inicial compara Layout clássico e Layout novo. Guia, Recursos e FAQ mostram o caminho Configurações → Layout do aplicativo.
- A escolha entre dois layouts é identificada como recurso estável da 9.1.8. A aparência não duplica o banco nem altera permissões.
- Link do técnico atualizado para 24 horas, com invalidação após edição salva e nova emissão imediata da revisão atual.
- Novidades documentadas: layout novo mais quadrado, etiqueta de aparelhos à venda, relatório técnico de erros e cancelamento direto nos arquivados.
- 18 imagens do aplicativo substituídas/criadas em 2880 × 1800, modo escuro, dados fictícios, WebP sem perdas; 6 imagens dos documentos renderizadas em PNG a 240 DPI.
- Links permitem abrir a resolução original. Imagens não recebem os efeitos anteriores de escurecimento. URLs com revisão invalidam capturas antigas em cache.
- Descrições distinguem a versão estável atual de futuras versões beta. Removida a afirmação de assinatura Windows do instalador: verificação de atualização por manifesto não é Authenticode.
- Build, tipos, lint, 7 contratos e 33 testes responsivos aprovados. Fotos não foram reenviadas a um serviço externo e não contêm caminhos locais visíveis.

As capturas usam o renderer do app com um banco novo de demonstração e uma ponte local somente de leitura. Estados de licença e de capacidade do computador são explicitamente demonstrativos; não validam ativação real. Ferramentas de captura ficam fora do aplicativo distribuído.

A validação das dimensões e do formato não deve ser substituída por um limite mínimo de tamanho de arquivo: compressão sem perdas pode diminuir o arquivo mantendo cada pixel.

Arquivos públicos preparados em `dist/client`. Revisão abrangente do app e pendências do teste de instalador registradas em `Assistencia-Simplificada-Layout-Selecionavel/docs/REVISAO-FINAL-2026-08-31.md`.
