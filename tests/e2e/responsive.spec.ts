import { expect, test } from "@playwright/test";

const routes = ["/", "/recursos", "/guia", "/planos", "/faq", "/termos", "/privacidade", "/tecnico/"];
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
        await expect(page.locator("h1").first()).toBeVisible();

        const layout = await page.evaluate(() => ({
          viewport: document.documentElement.clientWidth,
          pageWidth: document.documentElement.scrollWidth,
          brokenImages: Array.from(document.images)
            .filter((image) => image.complete && image.naturalWidth === 0)
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
