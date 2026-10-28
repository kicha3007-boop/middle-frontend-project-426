import { expect, request as playwrightRequest, test } from "@playwright/test";

import { PASSWORD, signIn, signUp, signUpAndWait, uniqueEmail } from "./helpers";

test("новый пользователь регистрируется и оказывается авторизованным", async ({ page }) => {
  await signUp(page, uniqueEmail("signup"));

  await expect(page.getByTestId("nav-account")).toBeVisible();
  await expect(page.getByTestId("nav-signout")).toBeVisible();
  await expect(page.getByTestId("nav-signin")).toHaveCount(0);
});

test("зарегистрированный пользователь входит по email и паролю", async ({ page }) => {
  const email = await signUpAndWait(page, "signin");
  await page.getByTestId("nav-signout").click();
  await expect(page.getByTestId("nav-signin")).toBeVisible();

  await signIn(page, email);

  await expect(page.getByTestId("nav-account")).toBeVisible();
  await page.reload();
  await expect(page.getByTestId("nav-account")).toBeVisible();
});

test("после выхода личный раздел недоступен", async ({ page }) => {
  await signUpAndWait(page, "signout");

  await page.getByTestId("nav-signout").click();

  await expect(page.getByTestId("nav-signin")).toBeVisible();
  await expect(page.getByTestId("nav-account")).toHaveCount(0);
  await page.goto("/account");
  await expect(page).toHaveURL(/\/signin/);
  await expect(page.getByTestId("account-orders")).toHaveCount(0);
});

test("выход завершает сессию на сервере", async ({ baseURL }) => {
  const client = await playwrightRequest.newContext({ baseURL });
  const registered = await client.post("/api/auth/register", {
    data: { email: uniqueEmail("server-logout"), password: PASSWORD },
  });
  expect(registered.status()).toBe(201);
  const { cookies } = await client.storageState();
  const cookieHeader = cookies.map((cookie) => `${cookie.name}=${cookie.value}`).join("; ");

  const logout = await client.post("/api/auth/logout");
  expect(logout.status()).toBe(204);

  // Старая cookie, отправленная заново, больше ничего не открывает.
  const replay = await playwrightRequest.newContext({
    baseURL,
    extraHTTPHeaders: { Cookie: cookieHeader },
  });
  expect(await (await replay.get("/api/auth/me")).json()).toEqual({ user: null });
  expect((await replay.get("/api/orders")).status()).toBe(401);

  await client.dispose();
  await replay.dispose();
});

test("регистрация с занятым email отклоняется с понятным сообщением", async ({ page }) => {
  const email = await signUpAndWait(page, "taken");
  await page.getByTestId("nav-signout").click();
  await expect(page.getByTestId("nav-signin")).toBeVisible();

  await signUp(page, email);

  await expect(page.getByTestId("auth-error")).toContainText("уже зарегистрирован");
  await expect(page.getByTestId("nav-account")).toHaveCount(0);
});

test("вход с неверным паролем отклоняется с понятным сообщением", async ({ page }) => {
  const email = await signUpAndWait(page, "wrong");
  await page.getByTestId("nav-signout").click();
  await expect(page.getByTestId("nav-signin")).toBeVisible();

  await signIn(page, email, "definitely-wrong");

  await expect(page.getByTestId("auth-error")).toContainText("Неверный email или пароль");
  await expect(page.getByTestId("nav-account")).toHaveCount(0);
});

test("после перезагрузки пользователь остаётся авторизованным", async ({ page }) => {
  await signUpAndWait(page, "reload");

  await page.reload();

  await expect(page.getByTestId("nav-account")).toBeVisible();
  await expect(page.getByTestId("nav-signout")).toBeVisible();
});

test("аноним по прямому адресу кабинета попадает на вход", async ({ page, request }) => {
  await page.goto("/account");

  await expect(page).toHaveURL(/\/signin\?next=%2Faccount/);
  await expect(page.getByTestId("auth-submit")).toBeVisible();
  await expect(page.getByTestId("account-orders")).toHaveCount(0);
  // Закрыто и на сервере, а не только в интерфейсе.
  expect((await request.get("/api/orders")).status()).toBe(401);
});
