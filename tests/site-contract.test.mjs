import assert from "node:assert/strict";
import { access, readFile, stat } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");

const pngDimensions = (buffer) => ({
  width: buffer.readUInt32BE(16),
  height: buffer.readUInt32BE(20),
});

const webpDimensions = (buffer) => {
  assert.equal(buffer.toString("ascii", 0, 4), "RIFF");
  assert.equal(buffer.toString("ascii", 8, 12), "WEBP");
  for (let offset = 12; offset + 8 < buffer.length;) {
    const chunk = buffer.toString("ascii", offset, offset + 4);
    const length = buffer.readUInt32LE(offset + 4);
    if (chunk === "VP8L") {
      assert.equal(buffer[offset + 8], 0x2f);
      const dimensions = buffer.readUInt32LE(offset + 9);
      return {width:(dimensions & 0x3fff) + 1, height:((dimensions >>> 14) & 0x3fff) + 1};
    }
    offset += 8 + length + (length % 2);
  }
  assert.fail("A captura deve estar em WebP sem perdas (VP8L)");
};

test("configuração pública e download usam a versão oficial", async () => {
  const [packageMetadata, productConfig, siteData] = await Promise.all([
    read("package.json").then(JSON.parse),
    read("config/product-public-config.json").then(JSON.parse),
    read("lib/site-data.ts"),
  ]);
  assert.equal(productConfig.version, packageMetadata.version);
  assert.doesNotMatch(siteData, /releases\/latest\/download/);
  assert.ok(siteData.includes("releases/download/v${SITE_CONFIG.productVersion}/"));
  assert.ok(siteData.includes('PRODUCT_CONFIG.version.includes("-")'));
  assert.match(siteData, /SITE_CONFIG\.productVersion/);
});

test("build público não expõe o template bruto do portal técnico", async () => {
  await access(new URL("dist/client/tecnico/index.html", root));
  await assert.rejects(access(new URL("dist/client/tecnico/index.template.html", root)));
  const technicianHtml = await read("dist/client/tecnico/index.html");
  assert.doesNotMatch(technicianHtml, /{{[A-Z0-9_]+}}/);
});

test("rotas curtas publicam os portais sem redirecionar o token", async () => {
  const [customerShort, technicianShort, config] = await Promise.all([
    read("dist/client/a/index.html"),
    read("dist/client/t/index.html"),
    read("config/product-public-config.json"),
  ]);
  const publicConfig = JSON.parse(config);
  assert.equal(publicConfig.urls.customerTrackingPath, "/a/");
  assert.equal(publicConfig.urls.technicianPath, "/t/");
  assert.match(customerShort, /\/acompanhar\/page\.js/);
  assert.match(technicianShort, /\/tecnico\/page\.js/);
  assert.doesNotMatch(customerShort, /location\.(?:href|replace)/);
  assert.doesNotMatch(technicianShort, /location\.(?:href|replace)/);
});

test("acompanhamento do cliente é estático, privado e não expõe campos internos", async () => {
  const [template, script, generated] = await Promise.all([
    read("public/acompanhar/index.template.html"),
    read("public/acompanhar/page.js"),
    read("public/acompanhar/index.html"),
  ]);
  assert.match(template, /noindex,nofollow,noarchive/);
  assert.match(template, /Acompanhamento seguro/);
  assert.match(script, /location\.hash\.slice\(1\)/);
  assert.match(script, /history\.replaceState/);
  assert.match(script, /maintenanceElapsedSeconds/);
  assert.doesNotMatch(`${template}${script}`, /CPF|senha do aparelho|custo das peças|margem/i);
  assert.doesNotMatch(generated, /{{[A-Z0-9_]+}}/);
});

test("sitemap e robots possuem uma única saída estática coerente", async () => {
  const [robots, sitemap] = await Promise.all([
    read("dist/client/robots.txt"),
    read("dist/client/sitemap.xml"),
  ]);
  assert.match(robots, /Sitemap: https:\/\/assistenciasimplificada\.site\/sitemap\.xml/);
  for (const route of ["/", "/recursos", "/guia", "/planos", "/faq", "/termos", "/privacidade"])
    assert.match(sitemap, new RegExp(`<loc>https://assistenciasimplificada\\.site${route === "/" ? "/" : route}<\\/loc>`));
});

test("rotas públicas aceitam endereços com e sem barra final", async () => {
  for (const route of ["recursos", "guia", "planos", "faq", "termos", "privacidade"]) {
    const [flat, nested] = await Promise.all([
      read(`dist/client/${route}.html`),
      read(`dist/client/${route}/index.html`),
    ]);
    assert.equal(nested, flat, `${route}/ precisa servir a mesma página de ${route}`);
  }
});

test("build usa somente o subconjunto necessário de ícones", async () => {
  const [layout, iconCss] = await Promise.all([
    read("app/layout.tsx"),
    read("app/styles/bootstrap-icons-subset.css"),
  ]);
  assert.doesNotMatch(layout, /bootstrap-icons\/font\/bootstrap-icons\.css/);
  assert.match(layout, /bootstrap-icons-subset\.css/);
  assert.match(iconCss, /\.bi-whatsapp::before/);
  assert.match(iconCss, /\.bi-windows::before/);
  assert.doesNotMatch(iconCss, /@font-face|\.woff2?/);
});

test("guia publicado informa validade padrão de 15 dias", async () => {
  const guide = await read("lib/site-data.ts");
  assert.match(guide, /validade padrão é de 15 dias/);
  assert.match(guide, /padrões iniciais são 15 dias de validade/);
  assert.doesNotMatch(guide, /validade padrão é de 30 dias|padrões iniciais são 30 dias de validade/);
});

test("site acompanha o histórico extenso e as condições comerciais atuais", async () => {
  const [guide, hero] = await Promise.all([
    read("lib/site-data.ts"),
    read("app/components/hero-showcase.tsx"),
  ]);
  assert.match(guide, /páginas de 50 registros/);
  assert.match(guide, /campo Ir para abre diretamente qualquer página/);
  assert.match(guide, /até oito perfis/);
  assert.match(guide, /desconto por porcentagem ou valor fixo em reais/);
  assert.match(guide, /Aprovação geral com decisão registrada por serviço/);
  assert.match(hero, /atendimentos\.webp/);
  assert.match(hero, /Consulta o banco completo/);
});

test("galeria pública preserva capturas nítidas e sem nomes internos", async () => {
  const appImages = [
    "administracao", "aparelhos", "atendimento-detalhado", "atendimentos",
    "backup", "clientes", "configuracoes", "dados-da-empresa",
    "dashboard-principal", "estoque-de-pecas", "garantias", "licenca",
    "novo-orcamento", "orcamento-detalhes", "pesquisa-de-pecas", "tecnicos", "layout-novo", "escolha-layout",
  ].map((name) => `public/assets/img/app/current/${name}.webp`);
  const documentImages = [
    "compra-usado", "comprovante-retirada", "ficha-tecnica",
    "orcamento-detalhes", "orcamento", "pasta-garantia",
  ].map((name) => `public/assets/img/documentos/${name}.png`);

  for (const path of [...appImages, ...documentImages]) {
    assert.doesNotMatch(path, /codex|openai|chatgpt/i);
    const url = new URL(path, root);
    const [buffer, metadata] = await Promise.all([readFile(url), stat(url)]);
    // File size is not a quality measure: lossless UI captures can be very small.
    assert.ok(metadata.size >= 20_000, `${path} parece incompleta`);
    const dimensions = path.endsWith(".png")
      ? pngDimensions(buffer)
      : webpDimensions(buffer);
    const minimum = path.endsWith(".png")
      ? { width: 1800, height: 2500 }
      : { width: 2800, height: 1700 };
    assert.ok(dimensions.width >= minimum.width, `${path} tem largura insuficiente`);
    assert.ok(dimensions.height >= minimum.height, `${path} tem altura insuficiente`);
  }
});

test("dois layouts indicam o canal atual e preservam o download oficial", async () => {
  const [data, home, explorer, lightbox, productConfig] = await Promise.all([read("lib/site-data.ts"), read("app/page.tsx"), read("app/components/feature-explorer.tsx"), read("app/components/image-lightbox.tsx"), read("config/product-public-config.json")]);
  const currentVersion = JSON.parse(productConfig).version;
  assert.match(data, /id: "layouts"/);
  assert.ok(data.includes("versão ${CURRENT_RELEASE.label} ${SITE_CONFIG.productVersion}"));
  assert.match(currentVersion, /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/);
  assert.match(data, /24 horas/);
  assert.match(data, /Categorias de aparelho consolidadas sem opções repetidas/);
  assert.doesNotMatch(data, /8 horas|\b8h\b/);
  assert.match(data, /SCREENSHOT_REVISION/);
  assert.doesNotMatch(home, /Instalador e atualizações assinados/);
  assert.ok(home.includes("Versão {CURRENT_RELEASE.label} {PRODUCT.version}"));
  assert.match(home, /CURRENT_RELEASE.isPrerelease/);
  assert.match(explorer, /layouts: "\/assets\/img\/app\/current\/escolha-layout.webp"/);
  assert.match(lightbox, /unoptimized/);
  assert.match(lightbox, /Ver imagem em resolução original/);
});

test("todos os recursos apontam para uma seção válida do guia", async () => {
  const resources = await read("app/recursos/page.tsx");
  const data = await read("lib/site-data.ts");
  const resourceIds = [...data.matchAll(/\bid:\s*"([^"]+)"/g)]
    .map((match) => match[1])
    .slice(0, 9);
  const guideLinksBlock = resources.match(/const guideLinks:[\s\S]*?=\s*\{([\s\S]*?)\n\};/);

  assert.ok(guideLinksBlock, "mapa de links do guia não encontrado");
  for (const resourceId of resourceIds) {
    assert.match(
      guideLinksBlock[1],
      new RegExp(`\\b${resourceId}:\\s*"[^"]+"`),
      `recurso ${resourceId} está sem destino no guia`,
    );
  }
  assert.doesNotMatch(resources, /#\$\{guideLinks\[group\.id\]\}[\s\S]*undefined/);
});

test("portal técnico publica conclusões por serviço no template e no JavaScript", async () => {
  const [template, pageScript, pageStyle] = await Promise.all([
    read("public/tecnico/index.template.html"),
    read("public/tecnico/page.js"),
    read("public/tecnico/page.css"),
  ]);
  assert.match(template, /Conclusão e valores de cada serviço/);
  assert.match(template, /RESPOSTA OBRIGATÓRIA/);
  assert.doesNotMatch(template, /id="evaluation-result"/);
  for (const outcome of [
    "standard",
    "labor_only",
    "part_unavailable",
    "service_unsupported",
    "not_repairable",
  ]) {
    assert.match(pageScript, new RegExp(`\\[\"${outcome}\"`));
  }
  assert.match(pageScript, /note\.required = !priced/);
  assert.match(pageScript, /values\.push\(\{[\s\S]*id: service\.id,[\s\S]*outcome,[\s\S]*options: normalizedOptions/);
  assert.match(pageScript, /service\.requiresServiceName/);
  assert.match(pageScript, /Informe qual serviço será realizado/);
  assert.match(pageScript, /const evaluationResult = outcomes\.includes/);
  assert.match(pageStyle, /\.service-outcome-fields/);
});

test("vitrine aceita preço promocional e usa o valor efetivo em todos os contatos", async () => {
  const [api, pageScript, pageStyle] = await Promise.all([
    read("cloudflare/catalog-api.ts"),
    read("public/v/page.js"),
    read("public/v/page.css"),
  ]);
  assert.match(api, /discountPriceCents: number \| null/);
  assert.match(api, /discountInput < priceCents/);
  assert.match(pageScript, /const salePrice = item =>/);
  assert.match(pageScript, /const cardPaymentHtml = item =>/);
  assert.match(pageScript, /<small class="previous-price">\$\{money\(item\.priceCents\)\}<\/small>/);
  assert.match(pageScript, /<div class="price">\$\{money\(cashPrice\(item\)\)\}<\/div>/);
  assert.match(pageScript, /encodeURIComponent\(`Olá! Quero adquirir o aparelho/);
  assert.match(pageStyle, /\.previous-price/);
});

test("vitrine filtra memória RAM e armazenamento, e o editor copia os nomes", async () => {
  const [catalog, pageScript, priceEditor] = await Promise.all([
    read("public/v/index.html"),
    read("public/v/page.js"),
    read("public/v/precos/page.js"),
  ]);
  assert.match(catalog, /id="storage"/);
  assert.match(catalog, /id="ram"/);
  assert.match(pageScript, /populateMemoryFilters/);
  assert.match(pageScript, /String\(item\.storage\) === storageNode\.value/);
  assert.match(pageScript, /String\(item\.ram\) === ramNode\.value/);
  assert.match(priceEditor, /copyNamesNode/);
  assert.match(priceEditor, /navigator\.clipboard\.writeText\(names\)/);
});
test("vitrine mantém fotos dentro dos cartões e abre detalhes em modal", async () => {
  const [pageScript, pageStyle] = await Promise.all([
    read("public/v/page.js"),
    read("public/v/page.css"),
  ]);
  assert.match(pageStyle, /\.picture\{[^}]*overflow:hidden/);
  assert.match(pageStyle, /\.picture img\{[^}]*max-height:100%[^}]*object-fit:contain/);
  assert.match(pageStyle, /\.detail\{[^}]*position:fixed[^}]*inset:0[^}]*overflow-y:auto/);
  assert.match(pageStyle, /\.detail-shell\{[^}]*max-height:[^}]*overflow-y:auto/);
  assert.match(pageScript, /detailNode\.setAttribute\("role", "dialog"\)/);
  assert.match(pageScript, /event\.key === "Escape"/);
  assert.match(pageScript, /if \(event\.target === detailNode\) closeDetail\(\)/);
  assert.match(pageScript, /Quero adquirir o aparelho/);
  assert.match(pageScript, /\.thumbnails button/);
  assert.match(pageStyle, /\.zoomable:hover img\{transform:scale\(1\.8\)/);
  assert.match(pageStyle, /\.card\.featured:before\{content:"Destaque"/);
  assert.match(pageStyle, /\.card-payment/);
});

test("vitrine publica condições à vista e parcelamento calculado pela maquininha", async () => {
  const [api, pageScript] = await Promise.all([
    read("cloudflare/catalog-api.ts"),
    read("public/v/page.js"),
  ]);
  for (const field of ["cashDiscountBasisPoints", "cashPriceCents", "acceptedPaymentMethods", "interestFreeInstallments", "interestInstallment", "paymentMachineName"])
    assert.match(api, new RegExp(field));
  assert.match(pageScript, /OFF no/);
  assert.match(pageScript, /sem juros/);
  assert.match(pageScript, /com juros/);
  assert.match(pageScript, /<strong>\$\{money\(cashPrice\(item\)\)\}<\/strong>/);
});

test("vitrine preserva vendidos recentes em cinza sem oferecê-los como destaque", async () => {
  const [api, pageScript, pageStyle] = await Promise.all([
    read("cloudflare/catalog-api.ts"),
    read("public/v/page.js"),
    read("public/v/page.css"),
  ]);
  assert.match(api, /availability: "unavailable"/);
  assert.match(api, /30 \* 24 \* 60 \* 60 \* 1000/);
  assert.match(pageScript, /filter\(entry => entry\.availability !== "unavailable"\)/);
  assert.match(pageScript, /item\.availability !== "unavailable" \? `<a class="contact"/);
  assert.match(pageStyle, /\.card\.unavailable\{filter:grayscale\(1\)/);
  assert.match(pageStyle, /\.detail-shell\.unavailable\{filter:grayscale\(1\)/);
});

test("serviço da vitrine usa redirecionamento compatível com Cloudflare Workers", async () => {
  const api = await read("cloudflare/catalog-api.ts");
  assert.match(api, /redirect: "manual"/);
  assert.doesNotMatch(api, /redirect: "error"/);
});

test("portais públicos permitem zoom por pinça e a vitrine possui zoom próprio da foto", async () => {
  const paths = [
    "public/v/index.html",
    "public/a/index.html",
    "public/t/index.html",
    "public/tecnico/index.html",
    "public/acompanhar/index.html",
  ];
  for (const path of paths) {
    const html = await read(path);
    assert.match(html, /width=device-width,initial-scale=1/);
    assert.doesNotMatch(html, /maximum-scale|user-scalable\s*=\s*no/i);
  }
  const script = await read("public/v/page.js");
  assert.match(script, /touches\.length === 2/);
  assert.match(script, /data-zoom="in"/);
  assert.match(script, /dblclick/);
});
