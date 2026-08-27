# Configuração do site

O site separa configuração do produto, configuração comercial e segredos de infraestrutura.

## Onde alterar

- Produto, versão, autor, suporte, domínio, rotas, plataforma e nome do instalador: altere no aplicativo, em `package.json` e `shared/product-public-config.json`.
- Preços, rótulos de planos e data pública dos textos legais: altere em `config/site.config.json`.
- Endereço alternativo de publicação: use `NEXT_PUBLIC_SITE_URL` somente no ambiente de build correspondente.

Execute `pnpm config:sync` depois de qualquer alteração. Quando o aplicativo irmão está disponível, o comando copia os dados públicos, iguala a versão do site e gera os arquivos do portal técnico, domínio, robots e sitemap. `predev` e `prebuild` já executam essa validação.

## Arquivos gerados

Não edite diretamente:

- `config/product-public-config.json`;
- `public/tecnico/config.js`;
- `public/tecnico/index.html` (a origem editável é `index.template.html`);
- `public/CNAME`, `public/robots.txt` e `public/sitemap.xml`.

## Supabase

`NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_TECHNICIAN_API_URL` são endereços públicos. Nenhuma variável `NEXT_PUBLIC_` pode conter `service_role`, chave privada ou segredo. As credenciais administrativas permanecem somente nas variáveis privadas das Edge Functions do Supabase.

## Validação

Antes de publicar, execute `pnpm config:sync`, `pnpm typecheck`, `pnpm lint` e `pnpm build`. A publicação deve conter somente a saída estática preparada em `dist/client`.
