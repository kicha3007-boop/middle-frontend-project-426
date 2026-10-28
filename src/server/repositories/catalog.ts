import type { Db } from "../db/pool.js";
import type { Category, Product } from "../schemas.js";

type ProductRow = {
  id: number;
  slug: string;
  name: string;
  description: string;
  price: number;
  image_url: string | null;
  available: boolean;
  category_id: number;
  category_slug: string;
  category_name: string;
};

export type ProductFilters = {
  category?: string;
  priceMin?: number;
  priceMax?: number;
  available?: boolean;
  q?: string;
};

const PRODUCT_COLUMNS = `
  p.id, p.slug, p.name, p.description, p.price, p.image_url, p.available,
  c.id AS category_id, c.slug AS category_slug, c.name AS category_name`;

export const toProduct = (row: ProductRow): Product => ({
  id: row.id,
  slug: row.slug,
  name: row.name,
  description: row.description,
  price: row.price,
  imageUrl: row.image_url,
  available: row.available,
  category: { id: row.category_id, slug: row.category_slug, name: row.category_name },
});

// Значения поиска экранируются: % и _ в строке пользователя ищутся буквально.
const escapeLike = (value: string): string => value.replace(/[\\%_]/g, (char) => `\\${char}`);

// WHERE собирается из фиксированных условий, а значения уходят параметрами запроса.
const buildWhere = (filters: ProductFilters): { sql: string; params: unknown[] } => {
  const conditions: string[] = [];
  const params: unknown[] = [];
  const add = (condition: (placeholder: string) => string, value: unknown): void => {
    params.push(value);
    conditions.push(condition(`$${params.length}`));
  };

  if (filters.category) {
    add((p) => `c.slug = ${p}`, filters.category);
  }
  if (filters.priceMin !== undefined) {
    add((p) => `p.price >= ${p}`, filters.priceMin);
  }
  if (filters.priceMax !== undefined) {
    add((p) => `p.price <= ${p}`, filters.priceMax);
  }
  if (filters.available !== undefined) {
    add((p) => `p.available = ${p}`, filters.available);
  }
  const q = filters.q?.trim();
  if (q) {
    add((p) => `p.name ILIKE ${p}`, `%${escapeLike(q)}%`);
  }

  return { sql: conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "", params };
};

export const listProducts = async (
  db: Db,
  filters: ProductFilters,
  limit: number,
  offset: number,
): Promise<{ items: Product[]; total: number }> => {
  const where = buildWhere(filters);
  const from = "FROM products p JOIN categories c ON c.id = p.category_id";

  const count = await db.query<{ total: number }>(
    `SELECT count(*)::int AS total ${from} ${where.sql}`,
    where.params,
  );
  const limitIndex = where.params.length + 1;
  const page = await db.query<ProductRow>(
    `SELECT ${PRODUCT_COLUMNS} ${from} ${where.sql}
     ORDER BY p.id
     LIMIT $${limitIndex} OFFSET $${limitIndex + 1}`,
    [...where.params, limit, offset],
  );

  return { items: page.rows.map(toProduct), total: count.rows[0]?.total ?? 0 };
};

export const findProductById = async (db: Db, id: number): Promise<Product | null> => {
  const { rows } = await db.query<ProductRow>(
    `SELECT ${PRODUCT_COLUMNS}
     FROM products p JOIN categories c ON c.id = p.category_id
     WHERE p.id = $1`,
    [id],
  );
  return rows[0] ? toProduct(rows[0]) : null;
};

export type ProductForOrder = {
  id: number;
  name: string;
  price: number;
  available: boolean;
};

// Блокировка FOR SHARE: пока оформляется заказ, цену и доступность товара не поменяют.
export const findProductsForOrder = async (
  db: Db,
  ids: number[],
): Promise<Map<number, ProductForOrder>> => {
  const { rows } = await db.query<ProductForOrder>(
    "SELECT id, name, price, available FROM products WHERE id = ANY($1::int[]) FOR SHARE",
    [ids],
  );
  return new Map(rows.map((row) => [row.id, row]));
};

export const listCategories = async (db: Db): Promise<Category[]> => {
  const { rows } = await db.query<Category>(
    "SELECT id, slug, name FROM categories ORDER BY position, id",
  );
  return rows;
};

export const listPromos = async (
  db: Db,
): Promise<{ id: number; title: string; text: string; product: Product }[]> => {
  const { rows } = await db.query<ProductRow & { promo_id: number; title: string; text: string }>(
    `SELECT pr.id AS promo_id, pr.title, pr.text, ${PRODUCT_COLUMNS}
     FROM promos pr
     JOIN products p ON p.id = pr.product_id
     JOIN categories c ON c.id = p.category_id
     WHERE p.available
     ORDER BY pr.position, pr.id`,
  );
  return rows.map((row) => ({
    id: row.promo_id,
    title: row.title,
    text: row.text,
    product: toProduct(row),
  }));
};
