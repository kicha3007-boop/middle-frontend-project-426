import "@typespec/http";
import "@typespec/openapi";

using Http;
using OpenAPI;

/** API интернет-магазина комплектующих для ПК. Единственный источник правды о форме запросов и ответов. */
@service(#{ title: "PC Parts Store API" })
@info(#{ version: "1.0.0" })
@server("/api", "Тот же origin, что и фронтенд")
namespace Store;

// ---------- Общие модели ----------

/** Денежная сумма в целых рублях, без копеек. */
@minValue(0)
scalar Money extends int32;

/** Общий формат ошибки API — один для всех ресурсов. */
@error
model ApiError {
  /** Машинный код ошибки, например VALIDATION_ERROR или EMAIL_TAKEN. */
  code: string;

  /** Понятное человеку сообщение. */
  message: string;

  /** Товары, из-за которых не оформился заказ (только для ORDER_ITEMS_UNAVAILABLE). */
  problems?: OrderProblem[];
}

model ValidationErrorResponse {
  @statusCode _: 400;
  @body body: ApiError;
}

model UnauthorizedResponse {
  @statusCode _: 401;
  @body body: ApiError;
}

model NotFoundResponse {
  @statusCode _: 404;
  @body body: ApiError;
}

model ConflictResponse {
  @statusCode _: 409;
  @body body: ApiError;
}

@route("/health")
@tag("Служебное")
interface Health {
  /** Приложение живо и база доступна. */
  @get check(): {
    status: "ok";
  };
}

// ---------- Пользователи и сессия ----------

model User {
  id: int32;
  email: string;
}

model Credentials {
  @format("email")
  @maxLength(254)
  email: string;

  @minLength(6)
  @maxLength(128)
  password: string;
}

model CurrentUser {
  /** null — посетитель не авторизован. */
  user: User | null;
}

@route("/auth")
@tag("Авторизация")
interface Auth {
  /** Регистрация. Сразу открывает сессию (cookie). */
  @post
  @route("/register")
  register(@body body: Credentials): {
    @statusCode _: 201;
    @body body: User;
  } | ValidationErrorResponse | ConflictResponse;

  /** Вход по email и паролю. Открывает сессию (cookie). */
  @post
  @route("/login")
  login(@body body: Credentials): User | ValidationErrorResponse | UnauthorizedResponse;

  /** Выход: сессия удаляется на сервере. */
  @post
  @route("/logout")
  logout(): {
    @statusCode _: 204;
  };

  /** Текущий пользователь по cookie сессии. */
  @get
  @route("/me")
  me(): CurrentUser;
}

// ---------- Каталог ----------

model Category {
  id: int32;
  slug: string;
  name: string;
}

model Product {
  id: int32;
  slug: string;
  name: string;
  description: string;
  price: Money;

  /** Относительный адрес изображения; null — изображения нет, показывается заглушка. */
  imageUrl: string | null;

  available: boolean;
  category: Category;
}

model ProductPage {
  items: Product[];
  page: int32;
  pageSize: int32;
  total: int32;
  totalPages: int32;
}

/** Параметры выдачи каталога. Невалидное значение получает 400. */
model ProductListQuery {
  /** Слаг категории. */
  @query
  @maxLength(64)
  category?: string;

  /** Нижняя граница цены, включительно. */
  @query
  priceMin?: Money;

  /** Верхняя граница цены, включительно. */
  @query
  priceMax?: Money;

  /** true — только товары в наличии. */
  @query
  available?: boolean;

  /** Поиск по части названия без учёта регистра. */
  @query
  @maxLength(100)
  q?: string;

  /** Номер страницы, начиная с 1. */
  @query
  @minValue(1)
  page?: int32 = 1;

  /** Размер страницы, не больше 48. */
  @query
  @minValue(1)
  @maxValue(48)
  pageSize?: int32 = 12;
}

@route("/categories")
@tag("Каталог")
interface Categories {
  @get list(): Category[];
}

@route("/products")
@tag("Каталог")
interface Products {
  /** Выдача каталога: фильтрация и пагинация на сервере. */
  @get list(...ProductListQuery): ProductPage | ValidationErrorResponse;

  @get
  @route("/{id}")
  read(@path @minValue(1) id: int32): Product | ValidationErrorResponse | NotFoundResponse;
}

// ---------- Главная ----------

model Promo {
  id: int32;
  title: string;
  text: string;
  product: Product;
}

@route("/promos")
@tag("Главная")
interface Promos {
  /** Промо-блоки главной страницы. Список может быть пустым. */
  @get list(): Promo[];
}

// ---------- Заказы ----------

enum DeliveryMethod {
  delivery,
  pickup,
}

enum OrderStatus {
  paid,
}

model OrderItemInput {
  @minValue(1)
  productId: int32;

  @minValue(1)
  @maxValue(99)
  quantity: int32;
}

/** Данные получения. При доставке адрес обязателен, при самовывозе не передаётся. */
model ReceiptInput {
  method: DeliveryMethod;

  @minLength(1)
  @maxLength(100)
  recipientName: string;

  @minLength(5)
  @maxLength(30)
  phone: string;

  @maxLength(300)
  address?: string;
}

/** Тело оформления: только состав корзины и данные получения — без цен и итога. */
model CreateOrderRequest {
  @minItems(1)
  @maxItems(50)
  items: OrderItemInput[];

  receipt: ReceiptInput;
}

enum OrderProblemReason {
  notFound: "not_found",
  unavailable: "unavailable",
}

/** Товар, из-за которого заказ не оформился. */
model OrderProblem {
  productId: int32;

  /** Название, если товар найден в каталоге. */
  name?: string;

  reason: OrderProblemReason;
}

/** Позиция заказа — снимок товара на момент покупки. */
model OrderLine {
  productId: int32;
  name: string;
  price: Money;
  quantity: int32;
  subtotal: Money;
}

model Order {
  id: int32;
  status: OrderStatus;
  createdAt: utcDateTime;
  method: DeliveryMethod;
  recipientName: string;
  phone: string;
  address: string | null;
  total: Money;
  lines: OrderLine[];
}

@route("/orders")
@tag("Заказы")
interface Orders {
  /** Оформление заказа текущим пользователем. Атомарно: при проблемном товаре заказ не создаётся. */
  @post create(@body body: CreateOrderRequest): {
    @statusCode _: 201;
    @body body: Order;
  } | ValidationErrorResponse | UnauthorizedResponse | ConflictResponse;

  /** Заказы текущего пользователя, новые первыми. */
  @get list(): Order[] | UnauthorizedResponse;

  /** Один заказ текущего пользователя. Чужой заказ — 404. */
  @get
  @route("/{id}")
  read(@path @minValue(1) id: int32): Order | ValidationErrorResponse | UnauthorizedResponse | NotFoundResponse;
}
