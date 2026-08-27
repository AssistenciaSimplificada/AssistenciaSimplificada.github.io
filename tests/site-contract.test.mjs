import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");

test("configuração pública e download usam a versão oficial", async () => {
  const [packageMetadata, productConfig, siteData] = await Promise.all([
    read("package.json").then(JSON.parse),
    read("config/product-public-config.json").then(JSON.parse),
    read("lib/site-data.ts"),
  ]);
  assert.equal(productConfig.version, packageMetadata.version);
  assert.match(siteData, /releases\/latest\/download/);
  assert.match(siteData, /SITE_CONFIG\.productVersion/);
});

test("build público não expõe o template bruto do portal técnico", async () => {
  await access(new URL("dist/client/tecnico/index.html", root));
  await assert.rejects(access(new URL("dist/client/tecnico/index.template.html", root)));
  const technicianHtml = await read("dist/client/tecnico/index.html");
  assert.doesNotMatch(technicianHtml, /{{[A-Z0-9_]+}}/);
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

test("guia publicado informa validade padrão de 15 dias", async () => {
  const guide = await read("lib/site-data.ts");
  assert.match(guide, /validade padrão é de 15 dias/);
  assert.match(guide, /padrões iniciais são 15 dias de validade/);
  assert.doesNotMatch(guide, /validade padrão é de 30 dias|padrões iniciais são 30 dias de validade/);
});
