import type { FastifyInstance } from "fastify";
import type pg from "pg";

import { listCategories, listPromos } from "../repositories/catalog.js";
import {
  productListQuerySchema,
  productParamsSchema,
  type IdParams,
  type ProductListQuery,
} from "../schemas.js";
import { getProduct, getProductPage } from "../services/catalog.js";

export const catalogRoutes = (app: FastifyInstance, pool: pg.Pool): void => {
  app.get("/api/categories", async () => listCategories(pool));

  app.get<{ Querystring: ProductListQuery }>(
    "/api/products",
    { schema: { querystring: productListQuerySchema } },
    async (request) => getProductPage(pool, request.query),
  );

  app.get<{ Params: IdParams }>(
    "/api/products/:id",
    { schema: { params: productParamsSchema } },
    async (request) => getProduct(pool, request.params.id),
  );

  app.get("/api/promos", async () => listPromos(pool));
};
