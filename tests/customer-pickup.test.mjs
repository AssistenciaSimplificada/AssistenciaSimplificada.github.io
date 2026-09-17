import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import test from "node:test";

const script = readFileSync(new URL("../public/acompanhar/page.js", import.meta.url), "utf8");
const template = readFileSync(new URL("../public/acompanhar/index.template.html", import.meta.url), "utf8");
const start = Date.parse("2026-09-04T12:00:00.000Z");
async function portal(tracking) {
  let now = start;
  const nodes = new Map();
  const timers = new Set();
  const node = () => ({ hidden: true, textContent: "", children: [],
    setAttribute(name, value) { this[name] = value; },
    removeAttribute(name) { delete this[name]; },
    replaceChildren(...children) { this.children = children; },
    append(...children) { this.children.push(...children); },
    addEventListener() {}, focus() {}, close() { this.open = false; }, showModal() { this.open = true; },
  });
  const get = (id) => {
    if (!nodes.has(id)) nodes.set(id, node());
    return nodes.get(id);
  };
  class Clock extends Date { static now() { return now; } }
  vm.runInNewContext(script, {
    window: { __ASSISTENCIA_CUSTOMER_CONFIG__: { apiUrl: "https://example.test" } },
    document: { getElementById: get, createElement: node },
    fetch: async () => ({ ok: true, json: async () => ({ tracking }) }),
    location: { hash: `#token=${"A".repeat(43)}`, pathname: "/acompanhar/" },
    history: { replaceState() {} },
    URLSearchParams, AbortController, Date: Clock,
    setTimeout: (callback) => { timers.add(callback); return callback; },
    clearTimeout: (callback) => timers.delete(callback),
    setInterval: () => 1, clearInterval() {},
  });
  await new Promise(setImmediate);
  return { get, advance: (hours) => {
    now += hours * 3600000;
    const callbacks = [...timers]; timers.clear();
    callbacks.forEach((callback) => callback());
  } };
}

test("tela final explica três dias e onde consultar a garantia sem prometer envio automático", () => {
  assert.match(template, /3 dias \(72 horas\) após a retirada/);
  assert.match(template, /Guarde o PDF enviado pela loja/);
  assert.match(template, /garantia quando aplicável/);
  assert.match(template, /Se não o recebeu, solicite uma cópia/);
});

for (const status of ["Finalizado", "Cancelado"]) {
  test(`aviso aparece na retirada ${status} e desaparece com o link ao vencer`, async () => {
    const page = await portal({
      storeName: "Loja", expiresAt: "2026-09-07T12:00:00.000Z",
      snapshot: { status, deliveredAt: "2026-09-04T12:00:00.000Z" },
    });
    assert.equal(page.get("pickup-notice").hidden, false);
    assert.match(page.get("pickup-date").textContent, /04\/09\/2026/);
    assert.match(page.get("pickup-expiry").textContent, /07\/09\/2026/);
    page.advance(71);
    assert.equal(page.get("tracking").hidden, false);
    page.advance(1);
    assert.equal(page.get("tracking").hidden, true);
    assert.equal(page.get("error").hidden, false);
    assert.match(page.get("error-text").textContent, /link expirou.*PDF/);
  });
}

test("pronto para retirada não é confundido com aparelho entregue", async () => {
  const page = await portal({ snapshot: { status: "Pronto para retirada", deliveredAt: null } });
  assert.equal(page.get("pickup-notice").hidden, true);
  assert.equal(page.get("tracking").hidden, false);
});

test("resposta atrasada com prazo vencido não reexibe o atendimento", async () => {
  const page = await portal({ expiresAt: "2026-09-04T12:00:00.000Z", snapshot: { status: "Finalizado" } });
  assert.equal(page.get("tracking").hidden, true);
  assert.match(page.get("error-text").textContent, /link expirou/);
});

for (const [status, expected] of [["Aguardando técnico", "Avaliação"], ["Aguardando aprovação", "Aprovação"], ["Em manutenção", "Manutenção"], ["Pronto para retirada", "Retirada"]]) {
  test(`etapa destacada corresponde ao estado ${status}`, async () => {
    const page = await portal({ snapshot: { status } });
    const active = page.get("progress").children.find(child => child.className === "current");
    assert.equal(active.children[1].textContent, expected);
  });
}
