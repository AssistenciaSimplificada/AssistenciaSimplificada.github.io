import { expect, test } from "@playwright/test";

for (const portal of ["acompanhar", "tecnico"]) {
  test(`${portal}: tema persiste e formulário cabe no celular e desktop`, async ({ page }) => {
    await page.route("**/functions/v1/*", route => route.fulfill({ json: portal === "acompanhar" ? {
      tracking: { publicNumber: "ORC-TESTE", storeName: "Loja de teste", accessKind: "approval", approvalState: "pending", expiresAt: "2099-01-01",
        snapshot: { status: "Aguardando aprovação", statusDetail: "Aguardando aprovação", deviceSummary: "Samsung Galaxy S23", updatedAt: "2026-09-12T11:00:00Z", totalCents: 49000, services: [{ name: "Troca de tela e display" }], deviceDetails: { physicalStatusLabel: "Aparelho na loja", capacity: "128 GB" } } },
    } : {
      invite: { publicNumber: "ORC-TESTE", storeName: "Loja de teste", deviceSummary: "Samsung Galaxy S23", reportedDefect: "Tela danificada", expiresAt: "2099-01-01", services: [{ id: "service-1", name: "Troca de tela e display" }] },
    } }));
    await page.goto(`/${portal}/#token=${"A".repeat(43)}`);
    await expect(page.locator(portal === "acompanhar" ? "#tracking" : "#form")).toBeVisible();
    for (const theme of ["light", "dark"]) {
      await page.locator(`[data-theme-choice="${theme}"]`).click();
      await expect(page.locator("html")).toHaveAttribute("data-portal-theme", theme);
      for (const width of [390, 768, 1440]) {
        await page.setViewportSize({ width, height: 1000 });
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
      }
      await page.screenshot({ path: `test-results/${portal}-${theme}.png`, fullPage: true });
    }
    await page.reload();
    await expect(page.locator('[data-theme-choice="dark"]')).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("html")).toHaveAttribute("data-portal-theme", "dark");
  });
}
