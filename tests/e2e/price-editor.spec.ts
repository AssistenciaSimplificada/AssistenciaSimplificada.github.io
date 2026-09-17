import { expect, test } from "@playwright/test";

test("editor restrito altera preço e limites de parcelas no celular", async ({ page }) => {
  const updates: Array<Record<string, unknown>> = [];
  await page.route("https://catalogo.assistenciasimplificada.site/price-editor/**", async route => {
    const origin = route.request().headers().origin || "http://127.0.0.1:4175";
    const headers = { "access-control-allow-origin": origin, "access-control-allow-methods": "POST, OPTIONS", "access-control-allow-headers": "content-type", "content-type": "application/json" };
    if (route.request().method() === "OPTIONS") return route.fulfill({ status: 204, headers });
    if (route.request().url().endsWith("/session")) return route.fulfill({ status: 200, headers, body: JSON.stringify({ storeName: "Loja Exemplo", expiresAt: "2030-01-01T00:00:00Z", items: [{ code: "PHONE00001", title: "Apple iPhone 15", purchaseKind: "Novo", availability: "ready", imageUrl: "", priceCents: 300000, discountPriceCents: null, interestFreeInstallments: 2, interestMaxInstallments: 3, paymentMaximumInstallments: 12, availableWithInterest: [3, 4, 12] }] }) });
    const body = route.request().postDataJSON();
    updates.push(...body.changes);
    return route.fulfill({ status: 200, headers, body: JSON.stringify({ updated: body.changes.length }) });
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`/v/precos/#ABCDEFGHIJKL/${"x".repeat(43)}`);
  await page.locator("#pin").fill("123456");
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page.locator(".device-row")).toHaveCount(1);
  await page.locator('[data-field="interestFreeInstallments"]').selectOption("3");
  await page.locator('[data-field="interestMaxInstallments"]').selectOption("4");
  await page.locator('[data-field="priceCents"]').fill("3200,00");
  await expect(page.locator("#count")).toHaveText("1 alteração");
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await page.screenshot({ path: "test-results/editor-precos-parcelas-mobile.png", fullPage: true });
  await page.getByRole("button", { name: "Salvar alterações" }).click();
  await expect(page.locator("#count")).toHaveText("0 alterações");
  expect(updates).toEqual([{ itemCode: "PHONE00001", priceCents: 320000, discountPriceCents: null, interestFreeInstallments: 3, interestMaxInstallments: 4 }]);
});
