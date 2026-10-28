import type { FastifyInstance } from "fastify";
import type pg from "pg";

import {
  createOrderSchema,
  orderParamsSchema,
  type CreateOrderRequest,
  type IdParams,
} from "../schemas.js";
import { createOrder, getOrder, listOrders } from "../services/orders.js";
import { currentUser, requireUser } from "./session.js";

export const orderRoutes = (app: FastifyInstance, pool: pg.Pool): void => {
  const preHandler = requireUser(pool);

  app.post<{ Body: CreateOrderRequest }>(
    "/api/orders",
    { schema: { body: createOrderSchema }, preHandler },
    async (request, reply) => {
      const order = await createOrder(pool, currentUser(request).id, request.body);
      return reply.code(201).send(order);
    },
  );

  app.get("/api/orders", { preHandler }, async (request) =>
    listOrders(pool, currentUser(request).id),
  );

  app.get<{ Params: IdParams }>(
    "/api/orders/:id",
    { schema: { params: orderParamsSchema }, preHandler },
    async (request) => getOrder(pool, currentUser(request).id, request.params.id),
  );
};
