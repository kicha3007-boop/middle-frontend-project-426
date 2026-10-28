// Корзина живёт в localStorage и хранит только идентификатор товара и количество:
// названия и цены каждый раз берутся из каталога актуальными.
export type CartItem = {
  productId: number;
  quantity: number;
};

const STORAGE_KEY = "cart:v1";
export const MAX_QUANTITY = 99;

const isCartItem = (value: unknown): value is CartItem => {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const { productId, quantity } = value as Record<string, unknown>;
  return (
    Number.isInteger(productId) &&
    Number(productId) > 0 &&
    Number.isInteger(quantity) &&
    Number(quantity) > 0
  );
};

export const loadCart = (): CartItem[] => {
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed)
      ? parsed.filter(isCartItem).map(({ productId, quantity }) => ({
          productId,
          quantity: Math.min(quantity, MAX_QUANTITY),
        }))
      : [];
  } catch {
    return [];
  }
};

export const saveCart = (items: CartItem[]): void => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Хранилище недоступно (приватный режим) — корзина живёт до перезагрузки.
  }
};
