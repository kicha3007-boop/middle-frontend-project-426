import { expect, test } from "@playwright/test";

import { addToCart, findProduct, openCart, openCatalog, parseAmount } from "./helpers";

test("карточка товара открывается и показывает название, цену и описание", async ({ page }) => {
  await openCatalog(page);
  const name = (await page.getByTestId("catalog-item-name").first().textContent()) ?? "";

  await page.getByTestId("catalog-item-name").first().click();

  await expect(page.getByTestId("product-name")).toHaveText(name.trim());
  await expect(page.getByTestId("product-price")).toContainText("₽");
  await expect(page.getByTestId("product-description")).not.toBeEmpty();
});

test("товар добавляется в корзину и появляется в ней", async ({ page, request }) => {
  const product = await findProduct(request, true);

  await addToCart(page, product);
  await openCart(page);

  await expect(page.getByTestId("cart-item")).toHaveCount(1);
  await expect(page.getByTestId("cart-item")).toContainText(product.name);
  expect(parseAmount(await page.getByTestId("cart-total").textContent())).toBe(product.price);
});

test("количество меняется, итог пересчитывается", async ({ page, request }) => {
  const product = await findProduct(request, true);
  await addToCart(page, product);
  await openCart(page);

  await page.getByTestId("cart-item-qty").fill("3");

  await expect
    .poll(async () => parseAmount(await page.getByTestId("cart-total").textContent()))
    .toBe(product.price * 3);
});

test("позиция удаляется из корзины", async ({ page, request }) => {
  const product = await findProduct(request, true);
  await addToCart(page, product);
  await openCart(page);
  await expect(page.getByTestId("cart-item")).toHaveCount(1);

  await page.getByTestId("cart-item-remove").click();

  await expect(page.getByTestId("cart-empty")).toBeVisible();
  await expect(page.getByTestId("cart-item")).toHaveCount(0);
});

test("состав корзины сохраняется после перезагрузки", async ({ page, request }) => {
  const product = await findProduct(request, true);
  await addToCart(page, product);
  await openCart(page);
  await page.getByTestId("cart-item-qty").fill("2");
  await expect
    .poll(async () => parseAmount(await page.getByTestId("cart-total").textContent()))
    .toBe(product.price * 2);

  await page.reload();

  await expect(page.getByTestId("cart-item")).toHaveCount(1);
  await expect(page.getByTestId("cart-item-qty")).toHaveValue("2");
  expect(parseAmount(await page.getByTestId("cart-total").textContent())).toBe(product.price * 2);
});

test("в корзине хранятся только идентификатор и количество", async ({ page, request }) => {
  const product = await findProduct(request, true);
  await addToCart(page, product);

  const stored = await page.evaluate(() => window.localStorage.getItem("cart:v1"));

  expect(JSON.parse(stored ?? "null")).toEqual([{ productId: product.id, quantity: 1 }]);
});

test("недоступный товар в корзину не добавляется", async ({ page, request }) => {
  const product = await findProduct(request, false);

  await page.goto(`/products/${product.id}`);

  await expect(page.getByTestId("product-name")).toHaveText(product.name);
  await expect(page.getByTestId("product-add-to-cart")).toBeDisabled();
  await openCart(page);
  await expect(page.getByTestId("cart-empty")).toBeVisible();
});

test("пустая корзина показывает своё состояние и не пускает к оформлению", async ({ page }) => {
  await page.goto("/cart");

  await expect(page.getByTestId("cart-empty")).toBeVisible();
  await expect(page.getByTestId("cart-checkout")).toBeDisabled();

  // Прямой заход на оформление с пустой корзиной возвращает в корзину.
  await page.goto("/checkout");
  await expect(page.getByTestId("checkout-form")).toHaveCount(0);
});

test("на экране шириной 390 пикселей у корзины нет горизонтальной прокрутки", async ({
  page,
  request,
}) => {
  const product = await findProduct(request, true);
  await page.setViewportSize({ width: 390, height: 844 });
  await addToCart(page, product);
  await openCart(page);
  await expect(page.getByTestId("cart-item")).toBeVisible();

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
});
