import { expect, test } from "@playwright/test";

type Promo = { title: string; product: { id: number; name: string } };

test("главная на адресе / показывает промо-блоки из базы", async ({ page, request }) => {
  const promos = (await (await request.get("/api/promos")).json()) as Promo[];
  expect(promos.length).toBeGreaterThan(1);

  await page.goto("/");

  await expect(page.getByTestId("home-promo")).toBeVisible();
  await expect(page.getByTestId("home-promo-item")).toHaveCount(promos.length);
  await expect(page.getByTestId("home-promo-item").first()).toContainText(promos[0]?.title ?? "");
  // На главной нет каталога: он отдельная страница.
  await expect(page.getByTestId("catalog-list")).toHaveCount(0);
});

test("клик по промо-блоку открывает страницу его товара", async ({ page, request }) => {
  const [promo] = (await (await request.get("/api/promos")).json()) as Promo[];
  expect(promo).toBeDefined();

  await page.goto("/");
  await page.getByTestId("home-promo-item").first().click();

  await expect(page).toHaveURL(new RegExp(`/products/${promo?.product.id}$`));
  await expect(page.getByTestId("product-name")).toHaveText(promo?.product.name ?? "");
  await expect(page.getByTestId("product-add-to-cart")).toBeEnabled();
});

test("из главной открывается каталог по ссылке в шапке", async ({ page }) => {
  await page.goto("/");

  await page.getByTestId("nav-catalog").click();

  await expect(page).toHaveURL(/\/catalog$/);
  await expect(page.getByTestId("catalog-filters")).toBeVisible();
  await expect(page.getByTestId("catalog-item").first()).toBeVisible();
});

test("пустой список промо-блоков не ломает главную", async ({ page }) => {
  await page.route("**/api/promos", (route) => route.fulfill({ json: [] }));

  await page.goto("/");

  await expect(page.getByTestId("home-promo")).toContainText("акций нет");
  await expect(page.getByTestId("home-promo-item")).toHaveCount(0);
  await page.getByTestId("nav-catalog").click();
  await expect(page.getByTestId("catalog-item").first()).toBeVisible();
});

test("на экране шириной 390 пикселей у главной нет горизонтальной прокрутки", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.getByTestId("home-promo-item").first()).toBeVisible();

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
});
