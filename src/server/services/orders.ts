import type pg from "pg";

import { withTransaction } from "../db/pool.js";
import { AppError, badRequest, notFound } from "../errors.js";
import { findProductsForOrder } from "../repositories/catalog.js";
import { findOrdersByUser, findUserOrder, insertOrder } from "../repositories/orders.js";
import type { CreateOrderRequest, Order, OrderProblem } from "../schemas.js";

// Одинаковые товары из корзины складываются в одну позицию.
const mergeItems = (items: CreateOrderRequest["items"]): Map<number, number> => {
  const merged = new Map<number, number>();
  for (const item of items) {
    merged.set(item.productId, (merged.get(item.productId) ?? 0) + item.quantity);
  }
  return merged;
};

// Сервер не доверяет клиенту: из запроса берутся только идентификаторы и количества,
// цены и итог считаются по текущему каталогу. Проблемный товар отменяет заказ целиком.
export const createOrder = async (
  pool: pg.Pool,
  userId: number,
  request: CreateOrderRequest,
): Promise<Order> => {
  const { receipt } = request;
  const address = receipt.address?.trim() ?? "";
  if (receipt.method === "delivery" && address === "") {
    throw badRequest("Для доставки укажите адрес");
  }
  if (receipt.recipientName.trim() === "" || receipt.phone.trim() === "") {
    throw badRequest("Укажите имя получателя и телефон");
  }

  const quantities = mergeItems(request.items);

  return withTransaction(pool, async (client) => {
    const products = await findProductsForOrder(client, [...quantities.keys()]);

    const problems: OrderProblem[] = [];
    for (const productId of quantities.keys()) {
      const product = products.get(productId);
      if (!product) {
        problems.push({ productId, reason: "not_found" });
      } else if (!product.available) {
        problems.push({ productId, name: product.name, reason: "unavailable" });
      }
    }
    if (problems.length > 0) {
      throw new AppError(
        409,
        "ORDER_ITEMS_UNAVAILABLE",
        "Заказ не оформлен: некоторые товары недоступны",
        problems,
      );
    }

    const lines = [...quantities].map(([productId, quantity]) => {
      const product = products.get(productId);
      if (!product) {
        throw new Error(`Товар ${productId} пропал из выборки`);
      }
      return { productId, name: product.name, price: product.price, quantity };
    });
    const total = lines.reduce((sum, line) => sum + line.price * line.quantity, 0);

    return insertOrder(client, {
      userId,
      method: receipt.method,
      recipientName: receipt.recipientName.trim(),
      phone: receipt.phone.trim(),
      address: receipt.method === "delivery" ? address : null,
      total,
      lines,
    });
  });
};

export const listOrders = (pool: pg.Pool, userId: number): Promise<Order[]> =>
  findOrdersByUser(pool, userId);

export const getOrder = async (pool: pg.Pool, userId: number, id: number): Promise<Order> => {
  const order = await findUserOrder(pool, userId, id);
  if (!order) {
    throw notFound("Заказ не найден");
  }
  return order;
};
