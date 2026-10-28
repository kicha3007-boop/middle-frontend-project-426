import { expect, request as playwrightRequest, test, type Page } from "@playwright/test";

import {
  addToCart,
  findProduct,
  openCart,
  parseAmount,
  PASSWORD,
  signUpAndWait,
  uniqueEmail,
  type ApiProduct,
} from "./helpers";

const fillReceipt = async (page: Page, method: "delivery" | "pickup"): Promise<void> => {
  await page.getByTestId("cart-checkout").click();
  await expect(page.getByTestId("checkout-form")).toBeVisible();
  await page.getByTestId("checkout-method").selectOption(method);
  await page.getByTestId("checkout-name").fill("Иван Петров");
  await page.getByTestId("checkout-phone").fill("+7 999 000-11-22");
};

const cartWith = async (page: Page, product: ApiProduct, quantity: number): Promise<void> => {
  await addToCart(page, product);
  await openCart(page);
  await page.getByTestId("cart-item-qty").fill(String(quantity));
  await expect
    .poll(async () => parseAmount(await page.getByTestId("cart-total").textContent()))
    .toBe(product.price * quantity);
};

test("неавторизованный пользователь не может оформить заказ", async ({ page, request }) => {
  await cartWith(page, await findProduct(request, true), 1);

  await page.getByTestId("cart-checkout").click();

  await expect(page).toHaveURL(/\/signin\?next=%2Fcheckout/);
  await expect(page.getByTestId("checkout-form")).toHaveCount(0);
  // Сервер тоже не принимает заказ без сессии.
  const response = await request.post("/api/orders", {
    data: {
      items: [{ productId: 1, quantity: 1 }],
      receipt: { method: "pickup", recipientName: "Гость", phone: "+79990000000" },
    },
  });
  expect(response.status()).toBe(401);
});

test("авторизованный пользователь оформляет заказ и видит страницу успеха", async ({
  page,
  request,
}) => {
  const product = await findProduct(request, true);
  await signUpAndWait(page, "buyer");
  await cartWith(page, product, 2);

  await fillReceipt(page, "delivery");
  await page.getByTestId("checkout-address").fill("ул. Ленина, 15, кв. 42");
  await page.getByTestId("checkout-submit").click();

  await expect(page.getByTestId("order-success")).toBeVisible();
  expect(parseAmount(await page.getByTestId("order-total").textContent())).toBe(product.price * 2);
  await page.getByTestId("nav-cart").click();
  await expect(page.getByTestId("cart-empty")).toBeVisible();
});

test("при доставке адрес обязателен, при самовывозе не запрашивается", async ({
  page,
  request,
}) => {
  await signUpAndWait(page, "address");
  await cartWith(page, await findProduct(request, true), 1);

  await fillReceipt(page, "delivery");
  await page.getByTestId("checkout-submit").click();

  await expect(page.getByTestId("checkout-form")).toContainText("Для доставки нужен адрес");
  await expect(page.getByTestId("order-success")).toHaveCount(0);
  expect(await (await page.request.get("/api/orders")).json()).toEqual([]);

  await page.getByTestId("checkout-method").selectOption("pickup");
  await expect(page.getByTestId("checkout-address")).toHaveCount(0);
  await page.getByTestId("checkout-submit").click();

  await expect(page.getByTestId("order-success")).toBeVisible();
});

test("сервер требует адрес для доставки", async ({ baseURL }) => {
  const client = await playwrightRequest.newContext({ baseURL });
  await client.post("/api/auth/register", {
    data: { email: uniqueEmail("api-address"), password: PASSWORD },
  });

  const response = await client.post("/api/orders", {
    data: {
      items: [{ productId: 1, quantity: 1 }],
      receipt: { method: "delivery", recipientName: "Иван", phone: "+79990000000" },
    },
  });

  expect(response.status()).toBe(400);
  expect(await response.json()).toMatchObject({ code: "VALIDATION_ERROR" });
  await client.dispose();
});

test("итог считает сервер по каталогу и не берёт цены из запроса", async ({ baseURL }) => {
  const client = await playwrightRequest.newContext({ baseURL });
  const product = await findProduct(client, true);
  await client.post("/api/auth/register", {
    data: { email: uniqueEmail("api-total"), password: PASSWORD },
  });

  const response = await client.post("/api/orders", {
    data: {
      items: [{ productId: product.id, quantity: 3, price: 1 }],
      receipt: { method: "pickup", recipientName: "Иван", phone: "+79990000000" },
      total: 1,
    },
  });

  expect(response.status()).toBe(201);
  const order = (await response.json()) as {
    status: string;
    total: number;
    lines: { name: string; price: number; quantity: number }[];
  };
  expect(order.status).toBe("paid");
  expect(order.total).toBe(product.price * 3);
  expect(order.lines).toEqual([
    expect.objectContaining({ name: product.name, price: product.price, quantity: 3 }),
  ]);
  await client.dispose();
});

test("заказ с недоступным товаром отклоняется целиком", async ({ baseURL }) => {
  const client = await playwrightRequest.newContext({ baseURL });
  const available = await findProduct(client, true);
  const unavailable = await findProduct(client, false);
  await client.post("/api/auth/register", {
    data: { email: uniqueEmail("api-atomic"), password: PASSWORD },
  });

  const response = await client.post("/api/orders", {
    data: {
      items: [
        { productId: available.id, quantity: 1 },
        { productId: unavailable.id, quantity: 1 },
        { productId: 999999, quantity: 1 },
      ],
      receipt: { method: "pickup", recipientName: "Иван", phone: "+79990000000" },
    },
  });

  expect(response.status()).toBe(409);
  const body = (await response.json()) as { code: string; problems: unknown[] };
  expect(body.code).toBe("ORDER_ITEMS_UNAVAILABLE");
  expect(body.problems).toEqual([
    { productId: unavailable.id, name: unavailable.name, reason: "unavailable" },
    { productId: 999999, reason: "not_found" },
  ]);
  // Доступный товар не оформился отдельно: заказов нет вовсе.
  expect(await (await client.get("/api/orders")).json()).toEqual([]);
  await client.dispose();
});

test("ошибка оформления с недоступным товаром показывается пользователю", async ({
  page,
  request,
}) => {
  const unavailable = await findProduct(request, false);
  await signUpAndWait(page, "unavailable");
  // Товар стал недоступен, пока лежал в корзине: кладём его в корзину напрямую.
  await page.evaluate((id) => {
    window.localStorage.setItem("cart:v1", JSON.stringify([{ productId: id, quantity: 1 }]));
  }, unavailable.id);
  await page.goto("/cart");

  await fillReceipt(page, "pickup");
  const responsePromise = page.waitForResponse(
    (response) => new URL(response.url()).pathname === "/api/orders",
  );
  await page.getByTestId("checkout-submit").click();
  const response = await responsePromise;

  expect(response.status()).toBe(409);
  await expect(page.getByTestId("order-error")).toContainText(unavailable.name);
  await expect(page.getByTestId("order-success")).toHaveCount(0);
});

test("в кабинете виден заказ с составом, ценами на момент покупки и итогом", async ({
  page,
  request,
}) => {
  const product = await findProduct(request, true);
  await signUpAndWait(page, "account");
  await cartWith(page, product, 2);
  await fillReceipt(page, "pickup");
  await page.getByTestId("checkout-submit").click();
  await expect(page.getByTestId("order-success")).toBeVisible();

  await page.getByTestId("nav-account").click();

  const order = page.getByTestId("account-order-item");
  await expect(order).toHaveCount(1);
  await expect(order.getByTestId("order-status")).toHaveAttribute("data-status", "paid");
  const line = order.getByTestId("account-order-line");
  await expect(line).toHaveCount(1);
  await expect(line).toContainText(product.name);
  expect(parseAmount(await line.getByTestId("account-order-line-qty").textContent())).toBe(2);
  expect(parseAmount(await line.getByTestId("account-order-line-price").textContent())).toBe(
    product.price,
  );
  expect(parseAmount(await order.getByTestId("order-total").textContent())).toBe(product.price * 2);
});

test("в кабинете видны только свои заказы", async ({ page, request }) => {
  await signUpAndWait(page, "owner");
  await cartWith(page, await findProduct(request, true), 1);
  await fillReceipt(page, "pickup");
  await page.getByTestId("checkout-submit").click();
  await expect(page.getByTestId("order-success")).toBeVisible();
  const ownerOrderId = Number(new URL(page.url()).pathname.split("/").pop());
  await page.getByTestId("nav-signout").click();
  await expect(page.getByTestId("nav-signin")).toBeVisible();

  await signUpAndWait(page, "stranger");
  await page.getByTestId("nav-account").click();

  await expect(page.getByTestId("account-orders-empty")).toBeVisible();
  await expect(page.getByTestId("account-order-item")).toHaveCount(0);
  // Чужой заказ по прямому идентификатору тоже не отдаётся.
  expect((await page.request.get(`/api/orders/${ownerOrderId}`)).status()).toBe(404);
});
