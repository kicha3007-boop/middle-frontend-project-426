import type {
  ApiErrorBody,
  Category,
  CreateOrderRequest,
  Credentials,
  Order,
  OrderProblem,
  Product,
  ProductListQuery,
  ProductPage,
  Promo,
  User,
} from "./types";

// Все обращения к API — только здесь. Пути относительные: фронтенд и API живут на одном origin.
const API_PREFIX = "/api";

export class ApiError extends Error {
  // status = 0 — запрос не дошёл до сервера.
  readonly status: number;
  readonly code: string;
  readonly problems: OrderProblem[];

  constructor(status: number, body: ApiErrorBody) {
    super(body.message);
    this.name = "ApiError";
    this.status = status;
    this.code = body.code;
    this.problems = body.problems ?? [];
  }
}

const isErrorBody = (value: unknown): value is ApiErrorBody =>
  typeof value === "object" &&
  value !== null &&
  typeof (value as { message?: unknown }).message === "string" &&
  typeof (value as { code?: unknown }).code === "string";

const readError = async (response: Response): Promise<ApiError> => {
  try {
    const body: unknown = await response.json();
    if (isErrorBody(body)) {
      return new ApiError(response.status, body);
    }
  } catch {
    // Тело не JSON — ниже общий текст.
  }
  return new ApiError(response.status, {
    code: "HTTP_ERROR",
    message: `Сервер ответил ошибкой ${response.status}`,
  });
};

export const isAbortError = (error: unknown): boolean =>
  error instanceof DOMException && error.name === "AbortError";

export const errorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : "Неизвестная ошибка";

const request = async <T>(path: string, init: RequestInit = {}): Promise<T> => {
  let response: Response;
  try {
    response = await fetch(`${API_PREFIX}${path}`, {
      credentials: "same-origin",
      ...init,
      headers: { Accept: "application/json", ...init.headers },
    });
  } catch (error) {
    if (isAbortError(error)) {
      throw error;
    }
    throw new ApiError(0, {
      code: "NETWORK_ERROR",
      message: "Не удалось связаться с сервером. Проверьте подключение.",
    });
  }

  if (!response.ok) {
    throw await readError(response);
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
};

const post = <T>(path: string, body?: unknown): Promise<T> =>
  request<T>(path, {
    method: "POST",
    ...(body === undefined
      ? {}
      : { headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }),
  });

const toSearch = (query: ProductListQuery): string => {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== "") {
      params.set(key, String(value));
    }
  }
  const search = params.toString();
  return search ? `?${search}` : "";
};

export const api = {
  me: (): Promise<{ user: User | null }> => request("/auth/me"),
  register: (credentials: Credentials): Promise<User> => post("/auth/register", credentials),
  login: (credentials: Credentials): Promise<User> => post("/auth/login", credentials),
  logout: (): Promise<void> => post("/auth/logout"),

  categories: (signal?: AbortSignal): Promise<Category[]> => request("/categories", { signal }),
  products: (query: ProductListQuery, signal?: AbortSignal): Promise<ProductPage> =>
    request(`/products${toSearch(query)}`, { signal }),
  product: (id: number, signal?: AbortSignal): Promise<Product> =>
    request(`/products/${id}`, { signal }),
  promos: (signal?: AbortSignal): Promise<Promo[]> => request("/promos", { signal }),

  createOrder: (body: CreateOrderRequest): Promise<Order> => post("/orders", body),
  orders: (signal?: AbortSignal): Promise<Order[]> => request("/orders", { signal }),
  order: (id: number, signal?: AbortSignal): Promise<Order> => request(`/orders/${id}`, { signal }),
};
