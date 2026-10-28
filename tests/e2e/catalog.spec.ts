import { expect, test } from "@playwright/test";

import {
  expectNames,
  fetchProducts,
  openCatalog,
  parseAmount,
  visibleNames,
  visiblePrices,
} from "./helpers";

// Эталон выдачи берётся из API того же приложения: тест сверяет, что интерфейс показывает
// ровно то, что сервер отдаёт под те же фильтры, а не «что-то изменилось».

const PAGE_SIZE = 12;

const namesOf = (items: { name: string }[]): string[] => items.map((item) => item.name);

test("каталог загружается, карточки видны", async ({ page, request }) => {
  const firstPage = await fetchProducts(request, { pageSize: PAGE_SIZE });

  await openCatalog(page);

  await expect(page.getByTestId("catalog-item")).toHaveCount(PAGE_SIZE);
  await expectNames(page, namesOf(firstPage.items));
});

test("в карточке есть название, цена и доступность", async ({ page, request }) => {
  const [first] = (await fetchProducts(request, { pageSize: PAGE_SIZE })).items;
  expect(first).toBeDefined();

  await openCatalog(page);
  const card = page.getByTestId("catalog-item").first();

  await expect(card.getByTestId("catalog-item-name")).toHaveText(first?.name ?? "");
  expect(parseAmount(await card.getByTestId("catalog-item-price").textContent())).toBe(
    first?.price,
  );
  await expect(card.getByTestId("catalog-item-availability")).toHaveAttribute(
    "data-available",
    String(first?.available),
  );
});

test("недоступный товар остаётся в каталоге и помечен", async ({ page, request }) => {
  const unavailable = await fetchProducts(request, { available: false, pageSize: 48 });
  expect(unavailable.total).toBeGreaterThan(0);

  await openCatalog(page);
  await page.getByTestId("filter-search").fill(unavailable.items[0]?.name ?? "");

  await expect(page.getByTestId("catalog-item")).toHaveCount(1);
  await expect(page.getByTestId("catalog-item-availability")).toHaveAttribute(
    "data-available",
    "false",
  );
});

test("фильтр по категории сужает список", async ({ page, request }) => {
  const categories = (await (await request.get("/api/categories")).json()) as { slug: string }[];
  const slug = categories[1]?.slug ?? "";
  const expected = await fetchProducts(request, { category: slug, pageSize: PAGE_SIZE });
  const all = await fetchProducts(request, { pageSize: PAGE_SIZE });
  expect(expected.total).toBeLessThan(all.total);

  await openCatalog(page);
  await page.getByTestId("filter-category").selectOption(slug);

  await expectNames(page, namesOf(expected.items));
  await expect(page).toHaveURL(new RegExp(`category=${slug}`));
});

test("поиск по части названия оставляет подходящие товары", async ({ page }) => {
  await openCatalog(page);

  await page.getByTestId("filter-search").fill("ryzen");

  await expect
    .poll(async () => {
      const names = await visibleNames(page);
      return names.length > 0 && names.every((name) => name.toLowerCase().includes("ryzen"));
    })
    .toBe(true);
});

test("фильтр по цене меняет состав выдачи", async ({ page, request }) => {
  const limit = 5000;
  const expected = await fetchProducts(request, { priceMax: limit, pageSize: PAGE_SIZE });
  expect(expected.total).toBeGreaterThan(0);

  await openCatalog(page);
  await page.getByTestId("filter-price-max").fill(String(limit));

  await expectNames(page, namesOf(expected.items));
  const prices = await visiblePrices(page);
  expect(prices.every((price) => price <= limit)).toBe(true);
});

test("фильтры комбинируются, сброс возвращает полный список", async ({ page, request }) => {
  const all = await fetchProducts(request, { pageSize: PAGE_SIZE });
  const combined = await fetchProducts(request, {
    category: "cpu",
    priceMin: 30000,
    available: true,
    pageSize: PAGE_SIZE,
  });

  await openCatalog(page);
  await page.getByTestId("filter-category").selectOption("cpu");
  await page.getByTestId("filter-available").check();
  await page.getByTestId("filter-price-min").fill("30000");
  await expectNames(page, namesOf(combined.items));

  await page.getByTestId("filter-reset").click();

  await expectNames(page, namesOf(all.items));
  await expect(page.getByTestId("filter-category")).toHaveValue("");
  await expect(page.getByTestId("filter-available")).not.toBeChecked();
  await expect(page.getByTestId("filter-price-min")).toHaveValue("");
});

test("под фильтры ничего не подошло — отдельное пустое состояние", async ({ page }) => {
  await openCatalog(page);

  await page.getByTestId("filter-search").fill("товар-которого-нет");

  await expect(page.getByTestId("catalog-empty")).toBeVisible();
  await expect(page.getByTestId("catalog-item")).toHaveCount(0);
});

test("следующая страница показывает другой набор карточек", async ({ page, request }) => {
  const secondPage = await fetchProducts(request, { page: 2, pageSize: PAGE_SIZE });

  await openCatalog(page);
  const firstNames = await visibleNames(page);
  await page.getByTestId("catalog-page-next").click();

  await expectNames(page, namesOf(secondPage.items));
  expect(namesOf(secondPage.items).filter((name) => firstNames.includes(name))).toEqual([]);
  await expect(page).toHaveURL(/page=2/);
});

test("смена фильтра возвращает на первую страницу", async ({ page, request }) => {
  const firstOfCategory = await fetchProducts(request, { category: "gpu", pageSize: PAGE_SIZE });

  await openCatalog(page);
  await page.getByTestId("catalog-page-next").click();
  await expect(page).toHaveURL(/page=2/);

  await page.getByTestId("filter-category").selectOption("gpu");

  await expectNames(page, namesOf(firstOfCategory.items));
  await expect(page).not.toHaveURL(/page=/);
  await expect(page.getByTestId("catalog-page-prev")).toBeDisabled();
});

test("на первой странице «назад» не уводит в несуществующую страницу", async ({ page }) => {
  await openCatalog(page);

  await expect(page.getByTestId("catalog-page-prev")).toBeDisabled();
  await expect(page.getByTestId("catalog-page-next")).toBeEnabled();

  // Номер страницы из адреса — недоверенный ввод: ноль и мусор дают первую страницу.
  const firstNames = await visibleNames(page);
  await page.goto("/catalog?page=0");
  await expectNames(page, firstNames);
  await expect(page.getByTestId("catalog-page-prev")).toBeDisabled();
});

test("перезагрузка с фильтром сохраняет выдачу и значения контролов", async ({ page, request }) => {
  const expected = await fetchProducts(request, {
    category: "ram",
    available: true,
    pageSize: PAGE_SIZE,
  });

  await openCatalog(page);
  await page.getByTestId("filter-category").selectOption("ram");
  await page.getByTestId("filter-available").check();
  await expectNames(page, namesOf(expected.items));

  await page.reload();

  await expect(page.getByTestId("filter-category")).toHaveValue("ram");
  await expect(page.getByTestId("filter-available")).toBeChecked();
  await expectNames(page, namesOf(expected.items));
});

test("«назад» после смены фильтра возвращает предыдущую выдачу", async ({ page, request }) => {
  const all = await fetchProducts(request, { pageSize: PAGE_SIZE });
  const storage = await fetchProducts(request, { category: "storage", pageSize: PAGE_SIZE });

  await openCatalog(page);
  await page.getByTestId("filter-category").selectOption("storage");
  await expectNames(page, namesOf(storage.items));

  await page.goBack();

  await expect(page.getByTestId("filter-category")).toHaveValue("");
  await expectNames(page, namesOf(all.items));

  await page.goForward();

  await expect(page.getByTestId("filter-category")).toHaveValue("storage");
  await expectNames(page, namesOf(storage.items));
});

test("слово, набранное без пауз, отправляет один запрос каталога", async ({ page }) => {
  await openCatalog(page);
  const requests: string[] = [];
  page.on("request", (request) => {
    if (new URL(request.url()).pathname === "/api/products") {
      requests.push(request.url());
    }
  });

  await page.getByTestId("filter-search").pressSequentially("samsung", { delay: 60 });

  await expect.poll(() => visibleNames(page)).toEqual(["SSD Samsung 990 Pro 1 ТБ M.2 NVMe"]);
  expect(requests).toHaveLength(1);
  expect(requests[0]).toContain("q=samsung");
});

test("на экране шириной 390 пикселей у каталога нет горизонтальной прокрутки", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openCatalog(page);

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
  // Панель фильтров на узком экране стоит над списком товаров.
  const filters = await page.getByTestId("catalog-filters").boundingBox();
  const list = await page.getByTestId("catalog-list").boundingBox();
  expect((filters?.y ?? 0) + (filters?.height ?? 0)).toBeLessThanOrEqual(list?.y ?? 0);
});

test("невалидный параметр каталога получает 400 в общем формате ошибок", async ({ request }) => {
  const invalid: Record<string, string | number>[] = [
    { priceMin: "дорого" },
    { page: 0 },
    { page: -1 },
    { pageSize: 1000 },
  ];
  for (const params of invalid) {
    const response = await request.get("/api/products", { params });
    expect(response.status(), JSON.stringify(params)).toBe(400);
    expect(await response.json()).toMatchObject({ code: "VALIDATION_ERROR" });
  }
});
