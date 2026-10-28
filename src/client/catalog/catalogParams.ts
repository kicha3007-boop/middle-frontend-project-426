import type { ProductListQuery } from "../api/types";

// Состояние выдачи живёт в адресе: перезагрузка, «назад»/«вперёд» и ссылка на выдачу
// восстанавливают те же фильтры и страницу. Имена параметров адреса — наши, к API их
// переводит toProductQuery.
export const PAGE_SIZE = 12;

export type CatalogFilters = {
  category: string;
  q: string;
  // Границы цены — строки из поля ввода: пустая строка значит «без границы».
  min: string;
  max: string;
  inStock: boolean;
};

export type CatalogState = CatalogFilters & { page: number };

const DIGITS = /^\d{1,9}$/;

// Адрес — недоверенный ввод: мусор в параметрах превращается в значения по умолчанию.
export const parseCatalogState = (params: URLSearchParams): CatalogState => {
  const page = Number(params.get("page"));
  const min = params.get("min") ?? "";
  const max = params.get("max") ?? "";
  return {
    category: params.get("category") ?? "",
    q: params.get("q") ?? "",
    min: DIGITS.test(min) ? min : "",
    max: DIGITS.test(max) ? max : "",
    inStock: params.get("inStock") === "1",
    page: Number.isInteger(page) && page > 1 ? page : 1,
  };
};

export const toSearchParams = (state: CatalogState): URLSearchParams => {
  const params = new URLSearchParams();
  if (state.category) params.set("category", state.category);
  // Строка поиска хранится как введена: обрезка пробелов посреди набора мешала бы печатать.
  if (state.q) params.set("q", state.q);
  if (state.min) params.set("min", state.min);
  if (state.max) params.set("max", state.max);
  if (state.inStock) params.set("inStock", "1");
  if (state.page > 1) params.set("page", String(state.page));
  return params;
};

export const toProductQuery = (state: CatalogState): ProductListQuery => ({
  category: state.category || undefined,
  q: state.q.trim() || undefined,
  priceMin: state.min ? Number(state.min) : undefined,
  priceMax: state.max ? Number(state.max) : undefined,
  available: state.inStock ? true : undefined,
  page: state.page,
  pageSize: PAGE_SIZE,
});

export const emptyFilters: CatalogFilters = {
  category: "",
  q: "",
  min: "",
  max: "",
  inStock: false,
};
