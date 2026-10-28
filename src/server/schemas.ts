import type { Static } from "@sinclair/typebox";

import { components, schema } from "./generated/schema.js";

// Схемы валидации и типы бэкенда — только из генерации (contract/main.tsp → openapi.yaml →
// generated/schema.js). Здесь они лишь получают короткие имена.

export const productListQuerySchema = schema["/products"].GET.args.properties.query;
export const productParamsSchema = schema["/products/{id}"].GET.args.properties.params;
export const credentialsSchema = schema["/auth/register"].POST.args.properties.body;
export const createOrderSchema = schema["/orders"].POST.args.properties.body;
export const orderParamsSchema = schema["/orders/{id}"].GET.args.properties.params;

export type ProductListQuery = Static<typeof productListQuerySchema>;
export type Credentials = Static<typeof credentialsSchema>;
export type CreateOrderRequest = Static<typeof createOrderSchema>;
export type IdParams = Static<typeof productParamsSchema>;

export type ApiError = Static<typeof components.schemas.ApiError>;
export type User = Static<typeof components.schemas.User>;
export type Category = Static<typeof components.schemas.Category>;
export type Product = Static<typeof components.schemas.Product>;
export type ProductPage = Static<typeof components.schemas.ProductPage>;
export type Promo = Static<typeof components.schemas.Promo>;
export type Order = Static<typeof components.schemas.Order>;
export type OrderLine = Static<typeof components.schemas.OrderLine>;
export type OrderProblem = Static<typeof components.schemas.OrderProblem>;
export type DeliveryMethod = Static<typeof components.schemas.DeliveryMethod>;
