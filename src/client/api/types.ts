import type { components, operations } from "./schema";

// Типы API фронтенда — только из генерации (contract/main.tsp → openapi.yaml → schema.d.ts).
type Schemas = components["schemas"];

export type ApiErrorBody = Schemas["ApiError"];
export type User = Schemas["User"];
export type Credentials = Schemas["Credentials"];
export type Category = Schemas["Category"];
export type Product = Schemas["Product"];
export type ProductPage = Schemas["ProductPage"];
export type Promo = Schemas["Promo"];
export type Order = Schemas["Order"];
export type OrderLine = Schemas["OrderLine"];
export type OrderProblem = Schemas["OrderProblem"];
export type DeliveryMethod = Schemas["DeliveryMethod"];
export type CreateOrderRequest = Schemas["CreateOrderRequest"];
export type ProductListQuery = NonNullable<operations["Products_list"]["parameters"]["query"]>;
