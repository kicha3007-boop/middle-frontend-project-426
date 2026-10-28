import type { Db } from "../db/pool.js";
import type { DeliveryMethod, Order, OrderLine } from "../schemas.js";

type OrderRow = {
  id: number;
  status: "paid";
  method: DeliveryMethod;
  recipient_name: string;
  phone: string;
  address: string | null;
  total: number;
  created_at: Date;
};

type LineRow = {
  order_id: number;
  product_id: number;
  name: string;
  price: number;
  quantity: number;
};

export type NewOrder = {
  userId: number;
  method: DeliveryMethod;
  recipientName: string;
  phone: string;
  address: string | null;
  total: number;
  lines: { productId: number; name: string; price: number; quantity: number }[];
};

const toLine = (row: LineRow): OrderLine => ({
  productId: row.product_id,
  name: row.name,
  price: row.price,
  quantity: row.quantity,
  subtotal: row.price * row.quantity,
});

const toOrder = (row: OrderRow, lines: OrderLine[]): Order => ({
  id: row.id,
  status: row.status,
  createdAt: row.created_at.toISOString(),
  method: row.method,
  recipientName: row.recipient_name,
  phone: row.phone,
  address: row.address,
  total: row.total,
  lines,
});

const ORDER_COLUMNS = "id, status, method, recipient_name, phone, address, total, created_at";

// Вызывается внутри транзакции: заказ и его позиции появляются вместе или не появляются вовсе.
export const insertOrder = async (db: Db, order: NewOrder): Promise<Order> => {
  const { rows } = await db.query<OrderRow>(
    `INSERT INTO orders (user_id, status, method, recipient_name, phone, address, total)
     VALUES ($1, 'paid', $2, $3, $4, $5, $6)
     RETURNING ${ORDER_COLUMNS}`,
    [order.userId, order.method, order.recipientName, order.phone, order.address, order.total],
  );
  const created = rows[0];
  if (!created) {
    throw new Error("Заказ не создан");
  }

  for (const line of order.lines) {
    await db.query(
      `INSERT INTO order_lines (order_id, product_id, name, price, quantity)
       VALUES ($1, $2, $3, $4, $5)`,
      [created.id, line.productId, line.name, line.price, line.quantity],
    );
  }

  return toOrder(
    created,
    order.lines.map((line) => ({ ...line, subtotal: line.price * line.quantity })),
  );
};

const attachLines = async (db: Db, orders: OrderRow[]): Promise<Order[]> => {
  if (orders.length === 0) {
    return [];
  }
  const { rows } = await db.query<LineRow>(
    `SELECT order_id, product_id, name, price, quantity
     FROM order_lines WHERE order_id = ANY($1::int[]) ORDER BY id`,
    [orders.map((order) => order.id)],
  );
  return orders.map((order) =>
    toOrder(order, rows.filter((line) => line.order_id === order.id).map(toLine)),
  );
};

// Владелец берётся из сессии, поэтому чужие заказы в выборку не попадают.
export const findOrdersByUser = async (db: Db, userId: number): Promise<Order[]> => {
  const { rows } = await db.query<OrderRow>(
    `SELECT ${ORDER_COLUMNS} FROM orders WHERE user_id = $1 ORDER BY created_at DESC, id DESC`,
    [userId],
  );
  return attachLines(db, rows);
};

export const findUserOrder = async (db: Db, userId: number, id: number): Promise<Order | null> => {
  const { rows } = await db.query<OrderRow>(
    `SELECT ${ORDER_COLUMNS} FROM orders WHERE id = $1 AND user_id = $2`,
    [id, userId],
  );
  const [order] = await attachLines(db, rows);
  return order ?? null;
};
