import { expect, test } from "@playwright/test";

const routes = ["/", "/recursos", "/guia", "/planos", "/faq", "/termos", "/privacidade", "/tecnico/", "/acompanhar/", "/v/", "/v/precos/"];
const viewports = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "notebook", width: 1024, height: 768 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "mobile", width: 390, height: 844 },
];

for (const viewport of viewports) {
  test.describe(viewport.name, () => {
    test.use({ viewport });

    for (const route of routes) {
      test(`${route} permanece responsiva e sem recursos quebrados`, async ({ page }) => {
        const errors: string[] = [];
        page.on("console", (message) => {
          if (message.type() === "error") errors.push(message.text());
        });
        page.on("pageerror", (error) => errors.push(error.message));

        const response = await page.goto(route, { waitUntil: "networkidle" });
        expect(response?.status()).toBe(200);
        const primaryTitle = route === "/v/" && viewport.name === "mobile" ? "#store-name" : "h1:visible";
        await expect(page.locator(primaryTitle).first()).toBeVisible();

        const layout = await page.evaluate(() => ({
          viewport: document.documentElement.clientWidth,
          pageWidth: document.documentElement.scrollWidth,
          brokenImages: Array.from(document.images)
            .filter(
              (image) =>
                Boolean(image.getAttribute("src")) &&
                image.complete &&
                image.naturalWidth === 0,
            )
            .map((image) => image.currentSrc || image.src),
        }));
        expect(layout.pageWidth).toBeLessThanOrEqual(layout.viewport + 1);
        expect(layout.brokenImages).toEqual([]);
        expect(errors).toEqual([]);
      });
    }
  });
}

test("template bruto do portal técnico não é público", async ({ request }) => {
  const response = await request.get("/tecnico/index.template.html");
  expect(response.status()).toBe(404);
});

test("acompanhamento do cliente mostra status, foto e tempo no celular", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route("**/functions/v1/customer-quote", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        tracking: {
          publicNumber: "OS-20260904-0001",
          storeName: "Assistência Demonstração",
          updatedAt: "2026-09-04T12:00:00.000Z",
          expiresAt: "2027-03-03T12:00:00.000Z",
          snapshot: {
            deviceSummary: "Celular • Marca • Modelo",
            status: "Em manutenção",
            statusDetail: "Aguardando a chegada de peças",
            estimatedDeadline: "Até sexta-feira",
            reportedDefect: "Não liga",
            diagnosedDefect: "Conector de carga danificado",
            maintenanceStartedAt: "2026-09-04T10:00:00.000Z",
            maintenanceCompletedAt: null,
            maintenanceElapsedSeconds: 3600,
            maintenanceClockRunning: false,
            updatedAt: new Date().toISOString(),
            timeline: [{ status: "Em manutenção", changedAt: "2026-09-04T10:00:00.000Z" }],
            deviceDetails: {
              physicalStatus: "in_store",
              physicalStatusLabel: "Aparelho na loja",
              capacity: "128 GB",
              accessories: "Capa e carregador",
              imeiLast4: "•••• 4321",
              serialLast4: "•••• 9911",
              visualNotes: "Pequeno risco na lateral",
              receivedAt: "2026-09-04T10:00:00.000Z",
            },
            photo: { dataUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M/wHwAF/gL+X8Z9WQAAAABJRU5ErkJggg==", caption: "Foto de entrada" },
            services: [{ name: "Troca do conector" }],
            totalCents: 18000,
          },
        },
      }),
    });
  });
  await page.goto(`/acompanhar/#token=${"A".repeat(43)}`, { waitUntil: "networkidle" });
  await expect(page.getByText("Aguardando a chegada de peças").first()).toBeVisible();
  await expect(
    page.getByText("O atendimento está pausado enquanto a assistência aguarda a chegada das peças."),
  ).toBeVisible();
  await expect(page.getByText("1h 0min")).toBeVisible();
  await expect(page.getByAltText("Foto 1 do aparelho — recebimento")).toBeVisible();
  await expect(page.getByText("Informações do aparelho")).toBeVisible();
  await expect(page.getByText("Aparelho na loja")).toBeVisible();
  await expect(page.getByText("•••• 4321")).toBeVisible();
  await expect(page.locator("#progress .current")).toContainText("Manutenção");
  await expect(page.locator("#loading")).toBeHidden();
  await expect(page.locator("#pin-form")).toBeHidden();
  await expect(page.locator("#error")).toBeHidden();
  const width = await page.evaluate(() => ({ page: document.documentElement.scrollWidth, viewport: document.documentElement.clientWidth }));
  expect(width.page).toBeLessThanOrEqual(width.viewport + 1);
});

test("a primeira tela mobile apresenta a mensagem e a demonstração sem conteúdo lateral", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/", { waitUntil: "networkidle" });

  const hero = page.locator(".as-hero");
  const title = hero.locator("h1");
  const stage = hero.locator(".as-product-stage");
  await expect(title).toBeVisible();
  await expect(stage).toBeVisible();

  const layout = await page.evaluate(() => {
    const titleBox = document.querySelector(".as-hero h1")?.getBoundingClientRect();
    const stageBox = document.querySelector(".as-product-stage")?.getBoundingClientRect();
    const trustBox = document.querySelector(".as-trust-grid")?.getBoundingClientRect();
    return {
      titleBottom: titleBox?.bottom ?? 0,
      stageTop: stageBox?.top ?? 0,
      stageBottom: stageBox?.bottom ?? 0,
      trustTop: trustBox?.top ?? 0,
      pageWidth: document.documentElement.scrollWidth,
      viewportWidth: document.documentElement.clientWidth,
    };
  });

  expect(layout.titleBottom).toBeLessThan(layout.stageTop);
  expect(layout.stageBottom).toBeLessThan(layout.trustTop);
  expect(layout.stageTop).toBeLessThan(844 * 1.5);
  expect(layout.pageWidth).toBeLessThanOrEqual(layout.viewportWidth + 1);
});

test("movimento reduzido mantém todo o conteúdo da página visível", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.locator("[data-motion='hero-stage']")).toBeVisible();
  await expect(page.locator("[data-motion='trust'] > span")).toHaveCount(3);
  await expect(page.locator("[data-motion='rise']").first()).toBeVisible();
});

test("oferta anual usa a condição cadastrada e respeita o fechamento na sessão", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/", { waitUntil: "networkidle" });

  const offer = page.getByLabel("Condição especial da licença anual");
  await expect(offer).toBeVisible();
  await expect(offer).toContainText(/\d+% de economia no plano anual/);
  await expect(offer).toContainText("Sem assinatura automática");
  await offer.getByRole("button", { name: "Fechar oferta" }).click();
  await expect(offer).toBeHidden();

  await page.reload({ waitUntil: "networkidle" });
  await page.waitForTimeout(1_100);
  await expect(offer).toBeHidden();
});

test("vitrine informa boleto PayJoy apenas nos aparelhos novos", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/v/#mostruario/apple-iphone-15--iphone", { waitUntil: "networkidle" });
  await expect(page.getByRole("dialog", { name: "Detalhes de Apple iPhone 15" })).toBeVisible();
  await page.getByRole("button", { name: "Fechar detalhes" }).click();
  const newPhone = page.locator('.card[data-code="demo-iphone"]');
  const usedPhone = page.locator('.card[data-code="demo-motorola"]');
  await expect(newPhone).toContainText("Boleto parcelado via PayJoy");
  await expect(usedPhone).not.toContainText("PayJoy");
  await newPhone.click();
  await expect(page.getByRole("dialog")).toContainText("Parcelamento no boleto via PayJoy");
  await page.setViewportSize({ width: 1920, height: 860 });
  await page.locator(".detail-gallery .picture img").click();
  await expect(page.locator(".photo-viewer-count")).toHaveText("1 de 1");
  await expect(page.getByRole("button", { name: "Foto anterior" })).toBeHidden();
  await expect(page.getByRole("button", { name: "Próxima foto" })).toBeHidden();
  await page.screenshot({ path: "test-results/vitrine-galeria-foto-unica-desktop.png" });
});

test("vitrine usa cabeçalho compacto com busca e filtros rápidos somente no celular", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/v/", { waitUntil: "networkidle" });
  await expect(page.locator(".mobile-catalog-controls")).toBeVisible();
  await expect(page.locator(".hero")).toBeHidden();
  await expect(page.locator(".summary")).toBeHidden();
  await expect(page.locator(".toolbar")).toBeHidden();
  const mobileGeometry = await page.evaluate(() => {
    const header = document.querySelector(".topbar")!.getBoundingClientRect();
    const firstContent = document.querySelector(".best-seller")!.getBoundingClientRect();
    return { headerHeight: header.height, firstContentTop: firstContent.top, width: document.documentElement.scrollWidth };
  });
  expect(mobileGeometry.headerHeight).toBeLessThanOrEqual(160);
  expect(mobileGeometry.firstContentTop).toBeLessThanOrEqual(mobileGeometry.headerHeight + 14);
  expect(mobileGeometry.width).toBeLessThanOrEqual(390);
  await page.locator("#mobile-search").fill("Galaxy A55");
  await expect(page.locator(".card")).toHaveCount(1);
  await page.locator("#mobile-search").fill("");
  await page.getByRole("button", { name: "Seminovos", exact: true }).click();
  await expect(page.locator(".card")).toHaveCount(1);
  await expect(page.locator('.mobile-filter-strip > button[data-kind="Usado"]')).toHaveClass(/active/);
  await page.screenshot({ path: "test-results/vitrine-cabecalho-mobile.png", fullPage: true });
  await page.evaluate(() => scrollTo(0, 160));
  await expect(page.locator(".topbar")).toHaveClass(/is-condensed/);

  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(page.locator(".mobile-catalog-controls")).toBeHidden();
  await expect(page.locator(".hero")).toBeVisible();
  await expect(page.locator(".toolbar")).toBeVisible();
});

test("vitrine enquadra a foto inteira e apresenta dados claros sem tingir preços pela loja", async ({ page }) => {
  const catalog = {
    storeCode: "ABCDEFGHIJKL", storeName: "Loja de teste", primaryColor: "#e1bd00", storePhone: "11999999999",
    items: [{ code: "PHONE1", title: "Apple iPhone 15", brand: "Apple", model: "iPhone 15", purchaseKind: "Usado", availability: "order", orderLeadTime: "3 a 5 dias úteis", specsUrl: "https://www.apple.com/br/iphone-15/specs/", storage: "128", batteryHealth: "89", ram: "8", color: "Preto", condition: "Usado", warranty: "90 dias", description: "Sem riscos na tela.", featured: true, imageUrls: ["/images/phone.svg"], priceCents: 200000, cashPriceCents: 190000, cashDiscountBasisPoints: 500, cashDiscountMethods: ["Pix"], acceptedPaymentMethods: ["Pix", "Cartão de crédito"], interestFreeInstallments: 2, updatedAt: "2026-09-15T12:00:00Z" }],
  };
  Object.assign(catalog.items[0], {
    description: "Sem riscos na tela.\nAcompanha cabo.",
    imageUrls: ["/images/phone.svg", "/images/phone.svg"],
    maxInstallments: 4,
    interestInstallments: [
      { installments: 3, totalCents: 212000, installmentCents: 70667, rateBasisPoints: 600 },
      { installments: 4, totalCents: 216000, installmentCents: 54000, rateBasisPoints: 800 },
    ],
    interestInstallment: { installments: 4, totalCents: 216000, installmentCents: 54000, rateBasisPoints: 800 },
  });
  await page.route("https://catalogo.assistenciasimplificada.site/public/**", async route => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ catalog }) }));
  await page.route("https://catalogo.assistenciasimplificada.site/images/phone.svg", async route => route.fulfill({ status: 200, contentType: "image/svg+xml", body: '<svg xmlns="http://www.w3.org/2000/svg" width="450" height="900"><rect x="40" y="10" width="370" height="880" rx="42" fill="#283743"/><rect x="70" y="55" width="310" height="750" fill="#d6e9ef"/></svg>' }));
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/v/#ABCDEFGHIJKL", { waitUntil: "networkidle" });
    await expect(page.locator("#catalog-mode")).toBeHidden();
    await expect(page.locator(".card")).toHaveCount(1);
    await expect(page.locator(".card .tags")).toContainText("📱 Seminovo");
    await expect(page.locator(".card .tags")).toContainText("💾 128 GB");
    await expect(page.locator(".card .tags")).toContainText("🔋 89%");
    await expect(page.locator(".card .tags")).toContainText("Sob encomenda");
    await expect(page.locator("#order-items")).toHaveText("1");
    const geometry = await page.evaluate(() => {
      const bounds = (selector: string) => document.querySelector(selector)!.getBoundingClientRect();
      const thumb = bounds(".best-thumb"), thumbImage = bounds(".best-thumb img"), picture = bounds(".card .picture"), image = bounds(".card .picture img");
      return { thumbBottom: thumb.bottom, thumbImageBottom: thumbImage.bottom, pictureBottom: picture.bottom, imageBottom: image.bottom, imageFit: getComputedStyle(document.querySelector(".card .picture img")!).objectFit, priceColor: getComputedStyle(document.querySelector(".card .price")!).color };
    });
    expect(geometry.thumbImageBottom).toBeLessThanOrEqual(geometry.thumbBottom + 1);
    expect(geometry.imageBottom).toBeLessThanOrEqual(geometry.pictureBottom + 1);
    expect(geometry.imageFit).toBe("contain");
    expect(geometry.priceColor).toBe("rgb(23, 107, 181)");
    if (width === 390) await page.screenshot({ path: "test-results/vitrine-seminovo-mobile.png", fullPage: true });
    if (width === 1440) await page.screenshot({ path: "test-results/vitrine-seminovo-desktop.png", fullPage: true });
  }
  await page.locator(".card").click();
  await expect(page).toHaveURL(/#ABCDEFGHIJKL\/apple-iphone-15--phone1$/);
  await expect(page.getByRole("dialog")).toContainText("🛡️ Garantia");
  await expect(page.getByRole("dialog")).toContainText("🔋 Bateria");
  await expect(page.getByRole("group", { name: "Fotos do aparelho" }).getByRole("button", { name: "Ver foto 1" })).toBeVisible();
  await expect(page.getByRole("dialog")).toContainText("3 a 5 dias úteis");
  await expect(page.getByRole("link", { name: /Ficha técnica oficial/ })).toHaveAttribute("href", "https://www.apple.com/br/iphone-15/specs/");
  await page.getByRole("combobox", { name: "Número de parcelas" }).selectOption("3");
  await expect(page.locator(".installment-picker output")).toHaveText(/3x de R\$\s*706,67 com juros · Total R\$\s*2\.120,00/);
  await expect(page.locator(".description")).toHaveCSS("white-space", "pre-wrap");
  await page.getByRole("button", { name: "Ampliar foto" }).click();
  await expect(page.locator(".detail-gallery .picture img")).toHaveCSS("transform", /matrix\(1\.5/);
  await page.locator(".detail-gallery .picture img").click();
  await expect(page.getByRole("dialog", { name: "Fotos de Apple iPhone 15" })).toBeVisible();
  await page.setViewportSize({ width: 1920, height: 860 });
  const viewerGeometry = await page.evaluate(() => {
    const bounds = (selector: string) => document.querySelector(selector)!.getBoundingClientRect();
    const stage = bounds(".photo-viewer-stage");
    const photo = bounds(".photo-viewer-stage img");
    const previous = bounds('.photo-viewer-stage [data-action="previous"]');
    const next = bounds('.photo-viewer-stage [data-action="next"]');
    return { stage, photo, previous, next };
  });
  expect(viewerGeometry.photo.top).toBeGreaterThanOrEqual(viewerGeometry.stage.top);
  expect(viewerGeometry.photo.bottom).toBeLessThanOrEqual(viewerGeometry.stage.bottom + 1);
  expect(viewerGeometry.photo.width).toBeLessThanOrEqual(1100);
  expect(viewerGeometry.previous.right).toBeLessThanOrEqual(viewerGeometry.photo.left);
  expect(viewerGeometry.next.left).toBeGreaterThanOrEqual(viewerGeometry.photo.right);
  await page.screenshot({ path: "test-results/vitrine-galeria-desktop.png" });
  await page.getByRole("button", { name: "Próxima foto" }).click();
  await expect(page.locator(".photo-viewer-count")).toHaveText("2 de 2");
  await page.getByRole("button", { name: "Ampliar foto ampliada" }).click();
  await expect(page.locator(".photo-viewer output")).toHaveText("150%");
  await page.getByRole("button", { name: "Fechar foto" }).click();
  await expect(page.locator(".photo-viewer")).toHaveCount(0);
  await expect(page.locator(".detail-pricebox .price")).toHaveCSS("color", "rgb(23, 107, 181)");
  await expect(page.locator("footer")).toContainText("Por Gabriel Schmeisk");
  await page.screenshot({ path: "test-results/vitrine-detalhes-desktop.png", fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator(".detail-gallery .picture img").click();
  const mobileViewer = page.getByRole("dialog", { name: "Fotos de Apple iPhone 15" });
  await expect(mobileViewer).toBeVisible();
  await page.getByRole("button", { name: "Foto anterior" }).click();
  await expect(page.locator(".photo-viewer-count")).toHaveText("2 de 2");
  await page.screenshot({ path: "test-results/vitrine-galeria-mobile.png" });
  const bounds = await page.locator(".photo-viewer-stage img").boundingBox();
  if (!bounds) throw new Error("A foto ampliada não apareceu no celular.");
  await page.mouse.move(bounds.x + bounds.width * .7, bounds.y + bounds.height * .5);
  await page.mouse.down();
  await page.mouse.move(bounds.x + bounds.width * .2, bounds.y + bounds.height * .5, { steps: 5 });
  await page.mouse.up();
  await expect(page.locator(".photo-viewer-count")).toHaveText("1 de 2");
  await page.getByRole("button", { name: "Fechar foto" }).click();
  await page.getByRole("button", { name: "Diminuir foto", exact: true }).click();
  const touchZoom = await page.evaluate(() => {
    const photo = document.querySelector(".detail-gallery .picture img")!;
    const touch = (identifier: number, clientX: number, clientY: number) => new Touch({ identifier, target: photo, clientX, clientY });
    const send = (type: string, touches: Touch[]) => photo.dispatchEvent(new TouchEvent(type, { bubbles: true, cancelable: true, touches, targetTouches: touches }));
    send("touchstart", [touch(1, 120, 180), touch(2, 220, 180)]);
    send("touchmove", [touch(1, 90, 180), touch(2, 250, 180)]);
    const before = (photo as HTMLElement).style.transform;
    send("touchend", [touch(1, 90, 180)]);
    send("touchmove", [touch(1, 130, 180)]);
    return { before, after: (photo as HTMLElement).style.transform };
  });
  expect(touchZoom.before).toContain("scale(1.6)");
  expect(touchZoom.after).toContain("translate(40px, 0px)");
  await expect(page.locator(".photo-viewer")).toHaveCount(0);
  await page.screenshot({ path: "test-results/vitrine-zoom-celular.png" });
});
