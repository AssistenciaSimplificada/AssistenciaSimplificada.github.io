# Site comercial — Assistência Simplificada 9.1.2

Source privada do site oficial do produto. A publicação usa GitHub Pages e envia somente a saída estática de `dist/client`; código-fonte, dependências, ferramentas, configurações locais e arquivos do servidor nunca entram no repositório público.

## URLs e repositórios

- Site: `https://assistenciasimplificada.site`
- Repositório do site: `AssistenciaSimplificada/AssistenciaSimplificada.github.io`
- Releases do aplicativo: `AssistenciaSimplificada/Orcamentos-Atualizacoes`
- Portal do técnico: `https://assistenciasimplificada.site/tecnico/`

## Validar e compilar

```bash
pnpm install --frozen-lockfile
pnpm lint
$env:GITHUB_PAGES = "true"
pnpm build
```

A pasta publicável é `dist/client`. Confira que ela contém `.nojekyll`, páginas estáticas, assets e `tecnico/`, e que não contém `node_modules`, `.git`, source maps privados ou `dist/server`.

Consulte `DOCUMENTACAO_COMPLETA.md` para arquitetura, segurança, rotas e publicação. O inventário do conteúdo anunciado está em `docs/inventario-funcional.md`.

## Identidade visual

O site usa a identidade oficial da Assistência Simplificada: logotipo horizontal no cabeçalho e no rodapé, símbolo próprio no favicon, ícones do aplicativo, imagem social, paleta ciano/dourado e tipografia Segoe UI. As variantes vetoriais e rasterizadas usadas pelo front-end ficam em `public/assets/branding`.
