import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";
import worker, { CatalogLock } from "../cloudflare/catalog-api.ts";

const createBucket = () => {
  const values = new Map();
  return {
    values,
    async get(key) {
      if (!values.has(key)) return null;
      const value = values.get(key);
      return { json: async () => JSON.parse(value) };
    },
    async put(key, value) {
      values.set(key, typeof value === "string" ? value : new TextDecoder().decode(value));
    },
    async delete(key) { for (const entry of Array.isArray(key) ? key : [key]) values.delete(entry); },
    async list({ prefix }) { return { objects: [...values.keys()].filter(key => key.startsWith(prefix)).map(key => ({ key })), truncated: false }; },
  };
};

const post = (path, body, authorization = false) => new Request(`https://catalogo.assistenciasimplificada.site${path}`, {
  method: "POST",
  headers: { "content-type": "application/json", ...(authorization ? { authorization: "Bearer test-session" } : {}) },
  body: JSON.stringify(body),
});

test("editor restrito atualiza preços, mantém histórico e pode ser revogado", async (context) => {
  const bucket = createBucket();
  const env = {
    CATALOG_BUCKET: bucket,
    CATALOG_HMAC_SECRET: "segredo-de-teste-com-tamanho-suficiente",
    SOURCE_SUPABASE_URL: "https://source.example",
    SOURCE_SUPABASE_PUBLISHABLE_KEY: "publishable-test",
  };
  const locks = new Map();
  env.CATALOG_LOCK = { idFromName: name => name, get: name => {
    if (!locks.has(name)) locks.set(name, new CatalogLock({}, env));
    return locks.get(name);
  } };
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url) => {
    const path = new URL(String(url)).pathname;
    if (path === "/auth/v1/user") return Response.json({ id: "user-1" });
    if (path === "/rest/v1/installations") return Response.json([{ id: "install-1", store_id: "store-1", license_id: "license-1" }]);
    if (path === "/rest/v1/stores") return Response.json([{ id: "store-1", name: "Loja Exemplo" }]);
    if (path === "/rest/v1/licenses") return Response.json([{ starts_at: "2026-01-01T00:00:00.000Z", expires_at: "2030-01-01T00:00:00.000Z" }]);
    if (path === "/rest/v1/license_rights") return Response.json([{ showcase_enabled: true, showcase_public_link_enabled: true, showcase_price_editor_enabled: true, showcase_max_devices: 30, cloud_image_upload_enabled: true, trial: false }]);
    if (path === "/rest/v1/rpc/public_catalog_access_v1") return Response.json({ catalog: true, priceEditor: true });
    return new Response(null, { status: 404 });
  };
  context.after(() => { globalThis.fetch = originalFetch; });

  const createdResponse = await worker.fetch(post("/price-editor/manage", { action: "create", expiresDays: 30 }, true), env, {});
  assert.equal(createdResponse.status, 200);
  const created = await createdResponse.json();
  assert.match(created.url, new RegExp(`^https://assistenciasimplificada\\.site/v/precos/#${created.storeCode}/`));
  assert.match(created.pin, /^\d{6}$/);
  const token = created.url.split("/").at(-1);
  const localItemId = "purchase-1";
  const itemCode = createHmac("sha256", env.CATALOG_HMAC_SECRET).update(`item|store-1|${localItemId}`).digest("base64url").slice(0, 10);
  const updatedAt = new Date().toISOString();
  bucket.values.set(`stores/${created.storeCode}/catalog.json`, JSON.stringify({
    storeCode: created.storeCode,
    storeName: "Loja Exemplo",
    storePhone: "",
    primaryColor: "#e1bd00",
    logoUrl: "",
    updatedAt,
    items: [{
      code: itemCode,
      title: "Apple iPhone 15",
      purchaseKind: "Novo",
      availability: "ready",
      imageUrls: ["/media/example.webp"],
      priceCents: 300000,
      discountPriceCents: null,
      cashDiscountBasisPoints: 500,
      interestFreeInstallments: 2,
      maxInstallments: 3,
      interestInstallments: [{ installments: 3, rateBasisPoints: 900, totalCents: 327000, installmentCents: 109000 }],
      updatedAt,
    }],
  }));
  bucket.values.set(`stores/${created.storeCode}/payment-rates/${itemCode}.json`, JSON.stringify({ maximum: 12, rates: [{ installments: 3, rateBasisPoints: 900 }, { installments: 4, rateBasisPoints: 1000 }, { installments: 12, rateBasisPoints: 1200 }] }));

  const denied = await worker.fetch(post("/price-editor/session", { storeCode: created.storeCode, token, pin: "999999" }), env, {});
  assert.equal(denied.status, 401);
  const session = await worker.fetch(post("/price-editor/session", { storeCode: created.storeCode, token, pin: created.pin }), env, {});
  assert.equal(session.status, 200);
  const sessionItem = (await session.json()).items[0];
  assert.equal(sessionItem.priceCents, 300000);
  assert.equal(sessionItem.interestFreeInstallments, 2);
  assert.equal(sessionItem.interestMaxInstallments, 3);
  assert.equal(sessionItem.paymentMaximumInstallments, 12);
  assert.deepEqual(sessionItem.availableWithInterest, [3, 4, 12]);

  const update = await worker.fetch(post("/price-editor/update", {
    storeCode: created.storeCode,
    token,
    pin: created.pin,
    changes: [{ itemCode, priceCents: 280000, discountPriceCents: 265000, interestFreeInstallments: 1, interestMaxInstallments: 4 }],
  }), env, {});
  assert.equal(update.status, 200);
  assert.equal((await update.json()).updated, 1);
  const catalog = JSON.parse(bucket.values.get(`stores/${created.storeCode}/catalog.json`));
  assert.equal(catalog.items[0].priceCents, 280000);
  assert.equal(catalog.items[0].discountPriceCents, 265000);
  assert.equal(catalog.items[0].cashPriceCents, 251750);
  assert.equal(catalog.items[0].interestInstallments[0].totalCents, 288850);
  assert.deepEqual(catalog.items[0].interestInstallments.map((entry) => entry.installments), [3, 4]);
  assert.equal(catalog.items[0].interestFreeInstallments, 1);
  assert.equal(catalog.items[0].maxInstallments, 4);
  assert.equal(catalog.items[0].priceUpdatedAt, catalog.items[0].updatedAt);
  assert.equal(JSON.parse(bucket.values.get(`stores/${created.storeCode}/price-changes.json`)).length, 1);
  assert.equal(JSON.parse(bucket.values.get(`stores/${created.storeCode}/price-history.json`)).length, 1);

  const termsOnly = await worker.fetch(post("/price-editor/update", { storeCode: created.storeCode, token, pin: created.pin, changes: [{ itemCode, priceCents: 280000, discountPriceCents: 265000, interestFreeInstallments: 4, interestMaxInstallments: 12 }] }), env, {});
  assert.equal(termsOnly.status, 200);
  assert.equal((await termsOnly.json()).updated, 1);
  const updatedCatalog = JSON.parse(bucket.values.get(`stores/${created.storeCode}/catalog.json`));
  assert.deepEqual(updatedCatalog.items[0].interestInstallments.map((entry) => entry.installments), [12]);
  assert.equal(updatedCatalog.items[0].priceUpdatedAt, catalog.items[0].priceUpdatedAt);
  assert.equal(JSON.parse(bucket.values.get(`stores/${created.storeCode}/price-history.json`)).length, 2);
  assert.deepEqual(JSON.parse(bucket.values.get(`stores/${created.storeCode}/payment-overrides/${itemCode}.json`)), { interestFreeInstallments: 4, interestMaxInstallments: 12 });

  const invalidTerms = await worker.fetch(post("/price-editor/update", { storeCode: created.storeCode, token, pin: created.pin, changes: [{ itemCode, priceCents: 280000, discountPriceCents: 265000, interestFreeInstallments: 13, interestMaxInstallments: 13 }] }), env, {});
  assert.equal(invalidTerms.status, 400);

  const staleAppPublish = await worker.fetch(post("/admin", { action: "upsert", localItemId, snapshot: { title: "Apple iPhone 15", brand: "Apple", model: "iPhone 15", purchaseKind: "Novo", priceCents: 280000, discountPriceCents: 265000, cashDiscountBasisPoints: 500, interestFreeInstallments: 2, maxInstallments: 3, interestInstallments: [{ installments: 3, rateBasisPoints: 900, totalCents: 288850, installmentCents: 96284 }], updatedAt: new Date().toISOString() }, images: ["data:image/png;base64,AA=="], storeName: "Loja Exemplo" }, true), env, {});
  assert.equal(staleAppPublish.status, 200);
  const afterStalePublish = JSON.parse(bucket.values.get(`stores/${created.storeCode}/catalog.json`));
  assert.equal(afterStalePublish.items[0].interestFreeInstallments, 4);
  assert.equal(afterStalePublish.items[0].maxInstallments, 12);
  assert.deepEqual(afterStalePublish.items[0].interestInstallments.map((entry) => entry.installments), [12]);

  const pulled = await worker.fetch(post("/price-editor/manage", { action: "pull" }, true), env, {});
  const pending = (await pulled.json()).changes;
  assert.equal(pending[0].priceCents, 280000);
  assert.equal(pending[0].interestFreeInstallments, 4);
  assert.equal(pending[0].interestMaxInstallments, 12);
  const acknowledged = await worker.fetch(post("/price-editor/manage", { action: "ack", ids: [pending[0].id] }, true), env, {});
  assert.equal((await acknowledged.json()).acknowledged, 1);

  const revoked = await worker.fetch(post("/price-editor/manage", { action: "revoke" }, true), env, {});
  assert.equal((await revoked.json()).revoked, true);
  const afterRevoke = await worker.fetch(post("/price-editor/session", { storeCode: created.storeCode, token, pin: created.pin }), env, {});
  assert.equal(afterRevoke.status, 403);

  const expiredCode = "PHONE00002";
  const expiredImage = `stores/${created.storeCode}/items/${expiredCode}/1-0123456789abcdef.webp`;
  bucket.values.set(expiredImage, "imagem antiga");
  afterStalePublish.items.push({ code: expiredCode, availability: "unavailable", updatedAt: "2026-01-01T00:00:00.000Z", imageUrls: [`/media/${created.storeCode}/${expiredCode}/1-0123456789abcdef.webp`] });
  bucket.values.set(`stores/${created.storeCode}/catalog.json`, JSON.stringify(afterStalePublish));
  const cleanup = await worker.fetch(post("/admin", { action: "delete", localItemId: "item-vendido-antigo" }, true), env, {});
  assert.equal(cleanup.status, 200);
  assert.equal(bucket.values.has(expiredImage), false);
});
