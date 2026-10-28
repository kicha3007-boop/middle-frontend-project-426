import { api, ApiError } from "../api/client";
import type { Product } from "../api/types";
import { useRemote, type Remote } from "../lib/useRemote";
import type { CartItem } from "./cartStorage";

// Позиция корзины вместе с актуальными данными товара из каталога.
// product === null — товара больше нет в каталоге.
export type CartLine = CartItem & { product: Product | null };

const loadProduct = async (id: number, signal: AbortSignal): Promise<Product | null> => {
  try {
    return await api.product(id, signal);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }
    throw error;
  }
};

// Названия и цены корзина берёт из каталога при каждом открытии — они всегда свежие.
// Запрос зависит только от набора товаров, смена количества его не повторяет.
export const useCartProducts = (
  items: CartItem[],
): { state: Remote<Map<number, Product | null>>; reload: () => void } => {
  const ids = [...new Set(items.map((item) => item.productId))].toSorted((a, b) => a - b);

  return useRemote(`cart:${ids.join(",")}`, async (signal) => {
    const products = await Promise.all(ids.map((id) => loadProduct(id, signal)));
    return new Map(ids.map((id, index) => [id, products[index] ?? null]));
  });
};

export const cartTotal = (lines: CartLine[]): number =>
  lines.reduce(
    (sum, line) => (line.product?.available ? sum + line.product.price * line.quantity : sum),
    0,
  );
