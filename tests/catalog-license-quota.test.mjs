import assert from "node:assert/strict";
import test from "node:test";
import worker, { CatalogLock } from "../cloudflare/catalog-api.ts";

test("cota da Vitrine é aplicada no servidor inclusive em publicações simultâneas", async context => {
  const objects = new Map();
  const bucket = {
    async get(key) { return objects.has(key) ? { json: async () => JSON.parse(objects.get(key)) } : null; },
    async put(key, value) { objects.set(key, typeof value === "string" ? value : new TextDecoder().decode(value)); },
    async delete(keys) { for (const key of Array.isArray(keys) ? keys : [keys]) objects.delete(key); },
    async list({ prefix }) { return { objects: [...objects.keys()].filter(key => key.startsWith(prefix)).map(key => ({ key })), truncated: false }; },
  };
  const env = { CATALOG_BUCKET: bucket, CATALOG_HMAC_SECRET: "test-secret-with-at-least-32-characters", SOURCE_SUPABASE_URL: "https://source.example", SOURCE_SUPABASE_PUBLISHABLE_KEY: "public-test" };
  const locks = new Map();
  env.CATALOG_LOCK = { idFromName: name => name, get: name => {
    if (!locks.has(name)) locks.set(name, new CatalogLock({}, env));
    return locks.get(name);
  } };
  const originalFetch = globalThis.fetch;
  let limit = 30;
  globalThis.fetch = async url => {
    const path = new URL(String(url)).pathname;
    if (path === "/auth/v1/user") return Response.json({ id: "actor-1" });
    if (path === "/rest/v1/installations") return Response.json([{ id: "installation-1", store_id: "store-1", license_id: "license-1" }]);
    if (path === "/rest/v1/stores") return Response.json([{ id: "store-1", name: "Loja Teste" }]);
    if (path === "/rest/v1/licenses") return Response.json([{ plan: "MONTHLY", starts_at: "2026-01-01T00:00:00Z", expires_at: "2030-01-01T00:00:00Z" }]);
    if (path === "/rest/v1/license_rights") return Response.json([{ showcase_enabled: true, showcase_public_link_enabled: true, showcase_price_editor_enabled: true, showcase_max_devices: limit, cloud_image_upload_enabled: true, trial: false }]);
    if (path === "/rest/v1/rpc/public_catalog_access_v1") return Response.json({ catalog: true, priceEditor: true });
    return new Response(null, { status: 404 });
  };
  context.after(() => { globalThis.fetch = originalFetch; });
  const publish = (id, availability = "ready", action = "upsert") => worker.fetch(new Request("https://catalogo.assistenciasimplificada.site/admin", {
    method: "POST", headers: { authorization: "Bearer actor-token", "content-type": "application/json" },
    body: JSON.stringify({ action, localItemId: id, storeName: "Loja Teste", snapshot: { title: `Aparelho ${id}`, brand: "Marca", model: "Modelo", priceCents: 10000, updatedAt: new Date().toISOString(), availability, purchaseKind: id === "phone-0" ? "Usado" : "Novo", payJoyEnabled: false }, images: ["data:image/webp;base64,YQ=="] }),
  }), env, {});
  const initial = await Promise.all(Array.from({ length: 29 }, (_, index) => publish(`phone-${index}`)));
  assert.equal(initial.filter(response => response.status === 200).length, 29);
  const last = await Promise.all([publish("phone-29", "order"), publish("phone-30")]);
  assert.deepEqual(last.map(response => response.status).sort(), [200, 409]);
  assert.equal((await publish("phone-0")).status, 200, "editar anúncio existente não ocupa vaga");
  const manifest = JSON.parse([...objects.entries()].find(([key]) => key.endsWith("/catalog.json"))[1]);
  assert.ok(manifest.items.every(item => item.payJoyEnabled === false), "o servidor preserva PayJoy desativada");
  await publish("phone-0", "order");
  const used = JSON.parse([...objects.entries()].find(([key]) => key.endsWith("/catalog.json"))[1]).items.find(item => item.title === "Aparelho phone-0");
  assert.equal(used.availability, "ready", "usado não vira encomenda no servidor");
  await publish("phone-0", "ready", "delete");
  const sold = JSON.parse([...objects.entries()].find(([key]) => key.endsWith("/catalog.json"))[1]).items.find(item => item.title === "Aparelho phone-0");
  assert.equal(sold.availability, "unavailable", "vendido fica indisponível");
  await publish("phone-0");
  limit = 20;
  assert.equal((await publish("phone-31")).status, 409, "reduzir a cota preserva os anúncios existentes");
  assert.equal((await publish("phone-0", "unavailable")).status, 200);
  assert.equal((await publish("phone-32")).status, 409, "uma remoção não permite ampliar uso acima da nova cota");
  limit = 30;
  assert.equal((await publish("phone-32")).status, 200, "remover anúncio libera vaga");
});
