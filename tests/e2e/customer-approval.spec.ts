import { expect, test } from "@playwright/test";

test("cliente consegue confirmar ciência e aprovar uma prévia do orçamento", async ({ page }) => {
  const decisions: string[] = [];
  await page.route("**/functions/v1/customer-quote", async (route) => {
    const body = route.request().postDataJSON();
    if (body.action === "approve") {
      decisions.push(body.decision);
      return route.fulfill({ json: { tracking: {
        publicNumber: "ORC-TESTE", storeName: "Loja de teste", accessKind: "approval",
        approvalState: body.decision, approvedAt: "2026-09-11T12:00:00Z", expiresAt: "2099-01-01",
        snapshot: { portalMode: "approval", status: "Aguardando aprovação", statusDetail: "Aguardando aprovação", deviceSummary: "Samsung A32", updatedAt: "2026-09-11T11:00:00Z", services: [{ name: "Troca de tela" }], totalCents: 35000 },
      } } });
    }
    return route.fulfill({ json: { tracking: {
      publicNumber: "ORC-TESTE", storeName: "Loja de teste", accessKind: "approval", approvalState: "pending", expiresAt: "2099-01-01",
      snapshot: { portalMode: "approval", approvalVersion: "2026-09-11T11:00:00Z", status: "Aguardando aprovação", statusDetail: "Aguardando aprovação", deviceSummary: "Samsung A32", updatedAt: "2026-09-11T11:00:00Z", services: [{ name: "Troca de tela" }], totalCents: 35000 },
    } } });
  });
  await page.goto(`/acompanhar/#token=${"A".repeat(43)}`);
  await expect(page.locator("#approval-card")).toBeVisible();
  await expect(page.locator("#approval-total")).toHaveText("R$ 350,00");
  await expect(page.getByRole("button", { name: "Sim, aprovar serviço" })).toBeVisible();
  await page.reload();
  await expect(page.locator("#approval-card")).toBeVisible();
  await expect(page.locator("#approval-total")).toHaveText("R$ 350,00");
  await page.locator("#approval-check").check();
  await page.locator("#approve-quote").click();
  await expect(page.locator("#approval-feedback")).toContainText("Aprovação registrada");
  await expect(page.locator("#approval-title")).toHaveText("Aprovação confirmada");
  await expect(page.locator("#approval-check")).toBeHidden();
  await expect(page.locator("#approve-quote")).toBeHidden();
  await expect(page.locator("#status")).toHaveText("Aprovação enviada");
  expect(decisions).toEqual(["approved"]);
});

test("assinatura obrigatória fica vinculada à aprovação enviada", async ({ page }) => {
  let sentSignature: { dataUrl?: string; signedAt?: string } | null = null;
  await page.route("**/functions/v1/customer-quote", async (route) => {
    const body = route.request().postDataJSON();
    const resolved = body.action === "approve";
    if (resolved) sentSignature = body.signature;
    return route.fulfill({ json: { tracking: {
      publicNumber: "ORC-ASSINATURA", storeName: "Loja de teste", accessKind: "approval",
      approvalState: resolved ? body.decision : "pending", approvedAt: resolved ? "2026-09-13T12:00:00Z" : null,
      expiresAt: "2099-01-01",
      snapshot: {
        portalMode: "approval", approvalSignatureMode: "required", approvalVersion: "2026-09-13T11:00:00Z",
        status: "Aguardando aprovação", statusDetail: "Aguardando aprovação", deviceSummary: "Samsung A32",
        updatedAt: "2026-09-13T11:00:00Z", services: [{ name: "Troca de tela" }], totalCents: 35000,
      },
    } } });
  });

  await page.goto(`/acompanhar/#token=${"B".repeat(43)}`);
  await expect(page.locator("#approval-signature")).toBeHidden();
  await page.locator("#approval-check").check();
  await page.locator("#approve-quote").click();
  await expect(page.locator("#approval-signature")).toBeVisible();
  await expect(page.locator("#approval-signature")).toHaveClass(/is-fullscreen/);

  const canvas = page.locator("#approval-signature-canvas");
  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  await page.mouse.move(box!.x + 30, box!.y + 45);
  await page.mouse.down();
  await page.mouse.move(box!.x + 100, box!.y + 70, { steps: 5 });
  await page.mouse.up();
  await page.locator("#confirm-approval-signature").click();

  await expect(page.locator("#approval-title")).toHaveText("Aprovação confirmada");
  const captured = sentSignature as { dataUrl?: string; signedAt?: string } | null;
  expect(captured?.dataUrl).toMatch(/^data:image\/png;base64,/u);
  expect(Number.isNaN(Date.parse(captured?.signedAt || ""))).toBe(false);
});

test("cliente escolhe o motivo ao não aprovar e o portal envia a justificativa", async ({ page }) => {
  let sent: { decision?: string; note?: string } = {};
  await page.route("**/functions/v1/customer-quote", async (route) => {
    const body = route.request().postDataJSON();
    if (body.action === "approve") sent = body;
    return route.fulfill({ json: { tracking: {
      publicNumber: "ORC-RECUSA", storeName: "Loja de teste", accessKind: "approval",
      approvalState: body.action === "approve" ? "rejected" : "pending",
      approvedAt: body.action === "approve" ? "2026-09-14T12:00:00Z" : null,
      expiresAt: "2099-01-01",
      snapshot: { portalMode: "approval", approvalVersion: "2026-09-14T11:00:00Z", status: "Aguardando aprovação", statusDetail: "Aguardando aprovação", deviceSummary: "Samsung A32", updatedAt: "2026-09-14T11:00:00Z", services: [{ name: "Troca de tela" }], totalCents: 35000 },
    } } });
  });
  await page.goto(`/a/#${"D".repeat(43)}`);
  await page.locator("#approval-check").check();
  await page.locator("#reject-quote").click();
  await expect(page.locator("#rejection-choice")).toBeVisible();
  await page.locator("#rejection-reason").selectOption("Valor acima do esperado");
  await page.locator("#confirm-rejection").click();
  await expect(page.locator("#approval-title")).toHaveText("Decisão registrada");
  expect(sent.decision).toBe("rejected");
  expect(sent.note).toBe("Valor acima do esperado");
});

test("revisão mostra motivo, comparação exata e valores de cada serviço", async ({ page }) => {
  await page.route("**/functions/v1/customer-quote", async (route) => route.fulfill({ json: { tracking: {
    publicNumber: "ORC-REVISAO", storeName: "Loja de teste", accessKind: "approval",
    approvalState: "pending", expiresAt: "2099-01-01",
    snapshot: {
      portalMode: "approval", approvalVersion: "2026-09-13T11:00:00Z",
      status: "Aguardando aprovação", statusDetail: "Aguardando aprovação",
      deviceSummary: "Samsung A32", updatedAt: "2026-09-13T11:00:00Z",
      services: [{ name: "Troca de conector", description: "Peça premium", quantity: 2, unitPriceCents: 6000, totalCents: 12000 }],
      totalCents: 12000,
      revisionSummary: {
        originalPublicNumber: "ORC-ORIGINAL", reason: "Dano adicional encontrado no conector.",
        originalTotalCents: 8000, newTotalCents: 12000, differenceCents: 4000,
      },
    },
  } } }));
  await page.goto(`/acompanhar/#token=${"C".repeat(43)}`);
  await expect(page.locator("#revision-card")).toBeVisible();
  await expect(page.locator("#revision-title")).toContainText("ORC-ORIGINAL");
  await expect(page.locator("#revision-reason")).toContainText("Dano adicional");
  await expect(page.locator("#revision-original-total")).toHaveText("R$ 80,00");
  await expect(page.locator("#revision-new-total")).toHaveText("R$ 120,00");
  await expect(page.locator("#revision-difference")).toHaveText("+R$ 40,00");
  await expect(page.locator("#services li")).toContainText(["Troca de conector2 × R$ 60,00 = R$ 120,00Peça premium"]);
});
