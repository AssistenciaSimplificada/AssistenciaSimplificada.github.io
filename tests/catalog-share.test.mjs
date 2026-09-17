import assert from "node:assert/strict";
import test from "node:test";
import worker from "../cloudflare/catalog-api.ts";

const storeCode = "ABCDEFGHIJKL";
const itemCode = "PHONE00001";
const catalog = {
  storeCode,
  storeName: "Gabriel Industries",
  storePhone: "",
  primaryColor: "#e1bd00",
  logoUrl: "",
  updatedAt: "2026-09-16T12:00:00.000Z",
  items: [{ code: itemCode, title: "Apple iPhone 15", imageUrls: [`/media/${storeCode}/${itemCode}/1-0123456789abcdef.webp`] }],
};
const env = {
  SOURCE_SUPABASE_URL: "https://source.example",
  SOURCE_SUPABASE_PUBLISHABLE_KEY: "publishable-test",
  CATALOG_BUCKET: {
    get: async (key) => key === `stores/${storeCode}/catalog.json` ? { json: async () => catalog } : key === `stores/${storeCode}/retention.json` ? { json: async () => ({ storeId: "store-1", licenseExpiresAt: "2030-01-01T00:00:00.000Z" }) } : null,
  },
};
const originalFetch = globalThis.fetch;
globalThis.fetch = async url => new URL(String(url)).pathname === "/rest/v1/rpc/public_catalog_access_v1"
  ? Response.json({ catalog: true, priceEditor: true }) : originalFetch(url);

test("prévia compartilhada usa o nome real da loja e abre a vitrine certa", async () => {
  const response = await worker.fetch(new Request(`https://catalogo.assistenciasimplificada.site/share/${storeCode}`), env, {});
  const html = await response.text();
  assert.equal(response.status, 200);
  assert.match(html, /<meta property="og:title" content="Vitrine — Gabriel Industries">/);
  assert.match(html, /location\.replace\("https:\/\/assistenciasimplificada\.site\/v\/#ABCDEFGHIJKL"\)/);
});

test("endereço principal do catálogo leva ao mostruário", async () => {
  const response = await worker.fetch(new Request("https://catalogo.assistenciasimplificada.site/"), env, {});
  assert.equal(response.status, 302);
  assert.equal(response.headers.get("location"), "https://assistenciasimplificada.site/v/");
});

test("prévia de produto inclui loja e foto; código inválido não abre catálogo", async () => {
  const response = await worker.fetch(new Request(`https://catalogo.assistenciasimplificada.site/share/${storeCode}/${itemCode}`), env, {});
  const html = await response.text();
  assert.equal(response.status, 200);
  assert.match(html, /<meta property="og:title" content="Apple iPhone 15 — Gabriel Industries">/);
  assert.match(html, /1-0123456789abcdef\.webp/);
  assert.match(html, /v\/#ABCDEFGHIJKL\/PHONE00001/);
  const missing = await worker.fetch(new Request(`https://catalogo.assistenciasimplificada.site/share/${storeCode}/INVALID`), env, {});
  assert.equal(missing.status, 404);
});
