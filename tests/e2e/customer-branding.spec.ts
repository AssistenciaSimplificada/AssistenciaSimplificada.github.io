import { expect, test } from "@playwright/test";

const logo = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M/wHwAF/gL+X8Z9WQAAAABJRU5ErkJggg==";
const token = "A".repeat(43);
const tracking = (branding?: { name: string; logoDataUrl: string | null }) => ({
  storeName: "Nome antigo da licença",
  publicNumber: "OS-TESTE",
  snapshot: { status: "Em manutenção", storeBranding: branding },
});

test("mostra a marca cadastrada após confirmar o telefone e limpa logo removida", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  let refresh = false;
  const name = "Assistência e Comércio de Aparelhos — Unidade Centro";
  await page.route("**/functions/v1/customer-quote", async (route) => {
    const body = route.request().postDataJSON();
    await route.fulfill({
      status: body.pin === "1234" ? 200 : 401,
      contentType: "application/json",
      body: JSON.stringify(body.pin === "1234"
        ? { tracking: tracking({ name, logoDataUrl: refresh ? null : logo }) }
        : { error: "pin_required", message: "Confirme o telefone" }),
    });
  });
  await page.goto(`/acompanhar/#token=${token}`);
  await expect(page.locator("#pin-form")).toBeVisible();
  await expect(page.locator("#store-logo")).toBeHidden();
  await expect(page.locator("#store-name")).toHaveText("Acompanhe seu atendimento");
  await page.locator("#pin").fill("1234");
  await page.locator("#pin-submit").click();
  await expect(page.locator("#store-name")).toHaveText(name);
  await expect(page.locator("#store-logo")).toBeVisible();
  await expect(page.locator("#store-logo")).toHaveAttribute("alt", `Logo da loja ${name}`);
  await expect(page).toHaveTitle(`Acompanhar atendimento | ${name}`);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
  expect(page.url()).not.toContain(token);
  refresh = true;
  await page.locator("#refresh").click();
  await expect(page.locator("#store-logo")).toBeHidden();
  await expect(page.locator("#store-logo")).not.toHaveAttribute("src");
  await expect(page.locator("#store-name")).toHaveText(name);
});

test("links antigos continuam com nome e sem logo quebrada", async ({ page }) => {
  await page.route("**/functions/v1/customer-quote", (route) => route.fulfill({
    json: { tracking: tracking() },
  }));
  await page.goto(`/acompanhar/#token=${token}`);
  await expect(page.locator("#store-name")).toHaveText("Nome antigo da licença");
  await expect(page.locator("#store-logo")).toBeHidden();
  await expect(page.locator("#tracking")).toBeVisible();
});

for (const invalidLogo of ["https://example.com/logo.png", "data:image/svg+xml;base64,AAAA", "data:image/png;base64,AAAA"]) {
  test(`logo inválida não bloqueia acompanhamento: ${invalidLogo}`, async ({ page }) => {
    await page.route("**/functions/v1/customer-quote", (route) => route.fulfill({
      json: { tracking: tracking({ name: "<img src=x onerror=alert(1)>", logoDataUrl: invalidLogo }) },
    }));
    await page.goto(`/acompanhar/#token=${token}`);
    await expect(page.locator("#tracking")).toBeVisible();
    await expect(page.locator("#store-name")).toHaveText("<img src=x onerror=alert(1)>");
    await expect(page.locator("#store-name img")).toHaveCount(0);
    await expect(page.locator("#store-logo")).toBeHidden();
  });
}
