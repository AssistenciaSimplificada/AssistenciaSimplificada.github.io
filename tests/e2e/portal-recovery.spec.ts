import { expect, test } from "@playwright/test";

for (const portal of ["a", "t"] as const) {
  test(`${portal}: rota curta aceita o token sem o prefixo token=`, async ({ page }) => {
    const endpoint = portal === "a" ? "customer-quote" : "technician-quote";
    await page.route(`**/functions/v1/${endpoint}`, route => route.fulfill({ json: portal === "a"
      ? { tracking: { storeName: "Loja de teste", snapshot: { status: "Em manutenção" } } }
      : { invite: { storeName: "Loja de teste", deviceSummary: "Teste", expiresAt: "2099-01-01", services: [] } } }));
    await page.goto(`/${portal}/#${"A".repeat(43)}`);
    await expect(page.locator(portal === "a" ? "#tracking" : "#form")).toBeVisible();
    expect(page.url()).not.toContain("token=");
    expect(page.url()).not.toContain("#");
  });
}

test("técnico mantém avaliação quando a conexão cai e consegue reenviar", async ({ page }) => {
  let submissions = 0;
  await page.route("**/functions/v1/technician-quote", async route => {
    if (route.request().postDataJSON().action === "submit") {
      submissions++;
      if (submissions === 1) return route.abort("connectionfailed");
      return route.fulfill({ json: { ok: true } });
    }
    return route.fulfill({ json: { invite: {
      storeName: "Loja de teste", publicNumber: "OS-TESTE", deviceSummary: "Aparelho fictício",
      reportedDefect: "Não liga", expiresAt: "2099-01-01T00:00:00Z",
      services: [{ id: "item-1", name: "Avaliação" }],
    } } });
  });
  await page.goto(`/tecnico/#token=${"A".repeat(43)}`);
  await expect(page.locator("#form")).toBeVisible();
  await page.locator("#diagnosis").fill("Conector danificado — trocar peça");
  await page.locator("input[data-option-value]").fill("125,50");
  await page.locator("#submit").click();
  await expect(page.locator("#submit-error")).toContainText("preenchimento foi mantido");
  await expect(page.locator("#form")).toBeVisible();
  await expect(page.locator("#diagnosis")).toHaveValue("Conector danificado — trocar peça");
  await expect(page.locator("#submit")).toBeEnabled();
  await page.locator("#submit").click();
  await expect(page.locator("#success")).toBeVisible();
  expect(submissions).toBe(2);
});

test("consulta lenta termina com orientação sem declarar o link expirado", async ({ page }) => {
  await page.clock.install();
  await page.route("**/functions/v1/customer-quote", async () => {});
  await page.goto(`/acompanhar/#token=${"A".repeat(43)}`, { waitUntil: "domcontentloaded" });
  await page.clock.fastForward(16000);
  await expect(page.locator("#error-text")).toContainText("Isso não significa que o link expirou");
  await expect(page.locator("#loading")).toBeHidden();
});

for (const portal of ["acompanhar", "tecnico"]) {
  test(`${portal}: falha inicial permite tentar novamente na mesma aba`, async ({ page }) => {
    let attempts = 0;
    await page.route(`**/functions/v1/${portal === "acompanhar" ? "customer" : "technician"}-quote`, route => {
      attempts++;
      if (attempts === 1) return route.abort("connectionfailed");
      return route.fulfill({ json: portal === "acompanhar" ? {
        tracking: { storeName: "Loja de teste", snapshot: { status: "Em manutenção" } },
      } : { invite: { storeName: "Loja de teste", deviceSummary: "Teste", expiresAt: "2099-01-01", services: [] } } });
    });
    await page.goto(`/${portal}/#token=${"A".repeat(43)}`);
    await expect(page.locator("#retry")).toBeVisible();
    expect(page.url()).not.toContain("token=");
    await page.locator("#retry").click();
    await expect(page.locator(portal === "acompanhar" ? "#tracking" : "#form")).toBeVisible();
    expect(attempts).toBe(2);
  });
}

test("técnico pode atualizar a página antes de enviar sem perder o acesso", async ({ page }) => {
  let reads = 0;
  await page.route("**/functions/v1/technician-quote", route => {
    reads++;
    return route.fulfill({ json: { invite: {
      storeName: "Loja de teste",
      publicNumber: "OS-RELOAD",
      deviceSummary: "Aparelho de teste",
      reportedDefect: "Não liga",
      expiresAt: "2099-01-01T00:00:00Z",
      services: [{ id: "item-1", name: "Avaliação" }],
    } } });
  });
  await page.goto(`/tecnico/#token=${"A".repeat(43)}`);
  await expect(page.locator("#form")).toBeVisible();
  await page.reload();
  await expect(page.locator("#form")).toBeVisible();
  expect(reads).toBe(2);
});

test("técnico converte ponto e vírgula para os mesmos centavos", async ({ page }) => {
  const submissions: Record<string, unknown>[] = [];
  await page.route("**/functions/v1/technician-quote", route => {
    const body = route.request().postDataJSON();
    if (body.action === "submit") {
      submissions.push(body);
      return route.fulfill({ json: { ok: true } });
    }
    return route.fulfill({ json: { invite: {
      storeName: "Loja de teste", publicNumber: "OS-MOEDA", deviceSummary: "Aparelho",
      reportedDefect: "Teste", expiresAt: "2099-01-01T00:00:00Z",
      services: [{ id: "item-1", name: "Tela" }, { id: "item-2", name: "Conector" }],
    } } });
  });
  await page.goto(`/t/#${"A".repeat(43)}`);
  const inputs = page.locator("input[data-option-value]");
  await inputs.nth(0).fill("1.234,56");
  await inputs.nth(1).fill("1234.56");
  await page.locator("#submit").click();
  await expect(page.locator("#success")).toBeVisible();
  const values = (submissions[0]?.serviceValues || []) as Array<{ options: Array<{ unitPriceCents: number }> }>;
  expect(values.map(item => item.options[0].unitPriceCents)).toEqual([123456, 123456]);
});

test("painel técnico mantém os cards íntegros no computador e não repete a conclusão", async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.route("**/functions/v1/technician-quote", route => route.fulfill({ json: { invite: {
    storeName: "Assistência com nome comercial extenso",
    publicNumber: "ORC-20260913-0001",
    deviceSummary: "Smartphone • Fabricante extenso • Modelo com descrição extensa • 256 GB",
    reportedDefect: "Aparelho não liga e apresenta aquecimento durante o carregamento.",
    expiresAt: "2099-01-01T00:00:00Z",
    services: [
      { id: "item-1", name: "Troca completa do conjunto de tela e revisão dos conectores internos" },
      { id: "item-2", name: "Avaliação técnica complementar" },
    ],
  } } }));
  await page.goto(`/tecnico/#token=${"A".repeat(43)}`);
  await expect(page.locator("#form")).toBeVisible();
  await expect(page.locator("#evaluation-result")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Adicionar outra opção de valor" }).first()).toBeVisible();
  const layout = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    pageWidth: document.documentElement.scrollWidth,
    overflowingCards: [...document.querySelectorAll(".service, .service-option")]
      .filter((element) => element.scrollWidth > element.clientWidth + 1).length,
    workGap: Math.round(
      document.querySelector(".service-values-card")!.getBoundingClientRect().top -
      document.querySelector(".evaluation-overview")!.getBoundingClientRect().bottom,
    ),
    serviceAccent: getComputedStyle(document.querySelector(".service > strong")!).borderLeftWidth,
  }));
  expect(layout.pageWidth).toBeLessThanOrEqual(layout.viewport + 1);
  expect(layout.overflowingCards).toBe(0);
  expect(layout.workGap).toBeLessThanOrEqual(20);
  expect(layout.serviceAccent).toBe("4px");
});

test("cliente: link realmente expirado não oferece repetição sem fim", async ({ page }) => {
  await page.route("**/functions/v1/customer-quote", route => route.fulfill({ status: 404, json: { error: "access_unavailable", message: "Este link expirou" } }));
  await page.goto(`/acompanhar/#token=${"A".repeat(43)}`);
  await expect(page.locator("#error-text")).toHaveText("Este link expirou");
  await expect(page.locator("#retry")).toBeHidden();
});

test("cliente atualiza o status aberto sem polling excessivo", async ({ page }) => {
  await page.clock.install();
  let reads = 0;
  await page.route("**/functions/v1/customer-quote", route => {
    reads++;
    const status = reads === 1 ? "Em manutenção" : "Pronto para retirada";
    return route.fulfill({ json: { tracking: {
      storeName: "Loja", publicNumber: "OS-STATUS", expiresAt: "2099-01-01T00:00:00Z",
      snapshot: { status, statusDetail: status, deviceSummary: "Aparelho", updatedAt: new Date().toISOString(), timeline: [], services: [] },
    } } });
  });
  await page.goto(`/a/#${"A".repeat(43)}`);
  await expect(page.locator("#status")).toHaveText("Em manutenção");
  await page.clock.fastForward(59_000);
  expect(reads).toBe(1);
  await page.clock.fastForward(2_000);
  await expect(page.locator("#status")).toHaveText("Pronto para retirada");
  expect(reads).toBe(2);
});

test("cliente: foto amplia por teclado, atualizações não inventam data e retirada fica clara", async ({ page }, testInfo) => {
  const photo = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M/wHwAF/gL+X8Z9WQAAAABJRU5ErkJggg==";
  await page.setViewportSize({ width: 360, height: 800 });
  await page.route("**/functions/v1/customer-quote", route => route.fulfill({ json: { tracking: {
    storeName: "Oficina de testes", publicNumber: "OS-1024", updatedAt: "2026-09-09T12:00:00Z", expiresAt: "2099-01-01",
    snapshot: { status: "Pronto para retirada", statusDetail: "Pronto para retirada", deviceSummary: "Samsung A32",
      updatedAt: "2026-09-01T12:00:00Z", totalCents: 26000,
      services: [{ name: "Troca de conector" }], receivingPhotos: [{ dataUrl: photo, caption: "Frente" }],
      deliveryPhotos: [{ dataUrl: "https://example.com/private.jpg", caption: "Externa não permitida" }],
    },
  } } }));
  await page.goto(`/acompanhar/#token=${"A".repeat(43)}`);
  await expect(page.locator("#updated")).toContainText("01/09/2026");
  await expect(page.locator("#next-step")).toContainText("A data de entrega ainda será registrada");
  await expect(page.locator("#pickup-notice")).toBeHidden();
  await expect(page.locator("#photo-gallery img")).toHaveCount(1);
  const photoButton = page.getByRole("button", { name: "Ampliar foto 1 — recebimento" });
  await photoButton.focus(); await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
  await expect(photoButton).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
  await page.screenshot({ path: testInfo.outputPath("cliente-mobile.png"), fullPage: true });
});
