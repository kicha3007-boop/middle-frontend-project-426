import type pg from "pg";

import { withTransaction } from "./pool.js";
import { categories, products, promos } from "./seed-data.js";

const imageFor = (category: string): string => `/images/products/${category}.svg`;

// Сид идемпотентен: записи опознаются по слагу, повторный запуск ничего не дублирует
// и не перетирает данные, которые уже лежат в базе.
export const runSeed = async (pool: pg.Pool): Promise<void> => {
  await withTransaction(pool, async (client) => {
    for (const [position, category] of categories.entries()) {
      await client.query(
        `INSERT INTO categories (slug, name, position) VALUES ($1, $2, $3)
         ON CONFLICT (slug) DO NOTHING`,
        [category.slug, category.name, position],
      );
    }

    for (const product of products) {
      await client.query(
        `INSERT INTO products (slug, category_id, name, description, price, image_url, available)
         SELECT $1, c.id, $3, $4, $5, $6, $7 FROM categories c WHERE c.slug = $2
         ON CONFLICT (slug) DO NOTHING`,
        [
          product.slug,
          product.category,
          product.name,
          product.description,
          product.price,
          product.hasImage === false ? null : imageFor(product.category),
          product.available ?? true,
        ],
      );
    }

    for (const [position, promo] of promos.entries()) {
      await client.query(
        `INSERT INTO promos (slug, product_id, title, text, position)
         SELECT $1, p.id, $3, $4, $5 FROM products p WHERE p.slug = $2
         ON CONFLICT DO NOTHING`,
        [promo.slug, promo.product, promo.title, promo.text, position],
      );
    }
  });
};
