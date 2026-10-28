import { expect, type APIRequestContext, type Page } from "@playwright/test";

// Общие шаги тестов. Данные готовятся через интерфейс или через публичный API приложения,
// поэтому тесты не зависят от порядка запуска: у каждого свой пользователь и своя корзина.

export const PASSWORD = "secret123";

export const uniqueEmail = (prefix: string): string =>
  `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.com`;

// Цены — целые рубли: из подписи достаточно вынуть цифры.
export const parseAmount = (text: string | null): number => Number((text ?? "").replace(/\D/g, ""));

export type ApiProduct = {
  id: number;
  name: string;
  price: number;
  available: boolean;
  category: { slug: string };
};

type ProductPage = { items: ApiProduct[]; total: number; totalPages: number };

export const fetchProducts = async (
  request: APIRequestContext,
  params: Record<string, string | number | boolean> = {},
): Promise<ProductPage> => {
  const response = await request.get("/api/products", { params });
  expect(response.status()).toBe(200);
  return (await response.json()) as ProductPage;
};

export const findProduct = async (
  request: APIRequestContext,
  available: boolean,
): Promise<ApiProduct> => {
  const { items } = await fetchProducts(request, { available, pageSize: 48 });
  const [product] = items;
  expect(product, `в каталоге должен быть товар с available=${available}`).toBeDefined();
  return product as ApiProduct;
};

export const signUp = async (page: Page, email: string, password = PASSWORD): Promise<void> => {
  await page.goto("/");
  await page.getByTestId("nav-signup").click();
  await page.getByTestId("auth-email").fill(email);
  await page.getByTestId("auth-password").fill(password);
  await page.getByTestId("auth-submit").click();
};

export const signIn = async (page: Page, email: string, password = PASSWORD): Promise<void> => {
  await page.goto("/");
  await page.getByTestId("nav-signin").click();
  await page.getByTestId("auth-email").fill(email);
  await page.getByTestId("auth-password").fill(password);
  await page.getByTestId("auth-submit").click();
};

export const signUpAndWait = async (page: Page, prefix: string): Promise<string> => {
  const email = uniqueEmail(prefix);
  await signUp(page, email);
  await expect(page.getByTestId("nav-account")).toBeVisible();
  return email;
};

export const visibleNames = async (page: Page): Promise<string[]> =>
  (await page.getByTestId("catalog-item-name").allTextContents()).map((name) => name.trim());

export const visiblePrices = async (page: Page): Promise<number[]> =>
  (await page.getByTestId("catalog-item-price").allTextContents()).map(parseAmount);

// Каталог открывается из шапки, как это сделал бы пользователь.
export const openCatalog = async (page: Page): Promise<void> => {
  await page.goto("/");
  await page.getByTestId("nav-catalog").click();
  await expect(page.getByTestId("catalog-item").first()).toBeVisible();
};

// Ждём, пока выдача на экране совпадёт с ожидаемым набором названий.
export const expectNames = async (page: Page, expected: string[]): Promise<void> => {
  await expect.poll(() => visibleNames(page)).toEqual(expected);
};

// Товар в корзине через страницу товара. Возвращает его цену из каталога.
export const addToCart = async (page: Page, product: ApiProduct): Promise<void> => {
  await page.goto(`/products/${product.id}`);
  await expect(page.getByTestId("product-name")).toHaveText(product.name);
  await page.getByTestId("product-add-to-cart").click();
  await expect(page.getByTestId("nav-cart")).toContainText("1");
};

export const openCart = async (page: Page): Promise<void> => {
  await page.getByTestId("nav-cart").click();
  await expect(page).toHaveURL(/\/cart$/);
};
