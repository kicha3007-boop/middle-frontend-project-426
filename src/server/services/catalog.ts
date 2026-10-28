import type pg from "pg";

import { notFound } from "../errors.js";
import { findProductById, listProducts } from "../repositories/catalog.js";
import type { Product, ProductListQuery, ProductPage } from "../schemas.js";

// Значения по умолчанию подставляет схема из контракта (page = 1, pageSize = 12).
export const getProductPage = async (
  pool: pg.Pool,
  query: ProductListQuery = {},
): Promise<ProductPage> => {
  const page = query.page ?? 1;
  const pageSize = query.pageSize ?? 12;
  const { items, total } = await listProducts(
    pool,
    {
      category: query.category,
      priceMin: query.priceMin,
      priceMax: query.priceMax,
      available: query.available,
      q: query.q,
    },
    pageSize,
    (page - 1) * pageSize,
  );

  return { items, page, pageSize, total, totalPages: Math.ceil(total / pageSize) };
};

export const getProduct = async (pool: pg.Pool, id: number): Promise<Product> => {
  const product = await findProductById(pool, id);
  if (!product) {
    throw notFound("Товар не найден");
  }
  return product;
};
