import { expect, test } from "@playwright/test";

test("главная открывается и показывает базовый контент", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto("/");

  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByTestId("nav-catalog")).toBeVisible();
  expect(errors).toEqual([]);
});

test("health-check отвечает, что приложение живо", async ({ request }) => {
  const response = await request.get("/api/health");

  expect(response.status()).toBe(200);
  expect(await response.json()).toEqual({ status: "ok" });
});

test("прямой заход на внутренний адрес отдаёт приложение, а не 404", async ({ page }) => {
  const response = await page.goto("/cart");

  expect(response?.status()).toBe(200);
  await expect(page.getByTestId("nav-cart")).toBeVisible();
});

test("неизвестный адрес API получает 404 в формате ошибок, а не index.html", async ({
  request,
}) => {
  const response = await request.get("/api/no-such-endpoint");

  expect(response.status()).toBe(404);
  expect(response.headers()["content-type"]).toContain("application/json");
  expect(await response.json()).toMatchObject({ code: "NOT_FOUND" });
});
