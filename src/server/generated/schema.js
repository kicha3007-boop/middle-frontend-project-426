/* eslint eslint-comments/no-unlimited-disable: off */
/* eslint-disable */
// This document was generated automatically by openapi-box

/**
 * @typedef {import('@sinclair/typebox').TSchema} TSchema
 */

/**
 * @template {TSchema} T
 * @typedef {import('@sinclair/typebox').Static<T>} Static
 */

/**
 * @typedef {import('@sinclair/typebox').SchemaOptions} SchemaOptions
 */

/**
 * @typedef {{
 *  [Path in keyof typeof schema]: {
 *    [Method in keyof typeof schema[Path]]: {
 *      [Prop in keyof typeof schema[Path][Method]]: typeof schema[Path][Method][Prop] extends TSchema ?
 *        Static<typeof schema[Path][Method][Prop]> :
 *        undefined
 *    }
 *  }
 * }} SchemaType
 */

/**
 * @typedef {{
 *  [ComponentType in keyof typeof _components]: {
 *    [ComponentName in keyof typeof _components[ComponentType]]: typeof _components[ComponentType][ComponentName] extends TSchema ?
 *      Static<typeof _components[ComponentType][ComponentName]> :
 *      undefined
 *  }
 * }} ComponentType
 */

import { Type as T, TypeRegistry, Kind, CloneType } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";

/**
 * @typedef {{
 *  [Kind]: 'Binary'
 *  static: string | File | Blob | Uint8Array
 *  anyOf: [{
 *    type: 'object',
 *    additionalProperties: true
 *  }, {
 *    type: 'string',
 *    format: 'binary'
 *  }]
 * } & TSchema} TBinary
 */

/**
 * @returns {TBinary}
 */
const Binary = () => {
  /**
   * @param {TBinary} schema
   * @param {unknown} value
   * @returns {boolean}
   */
  function BinaryCheck(schema, value) {
    const type = Object.prototype.toString.call(value);
    return (
      type === "[object Blob]" ||
      type === "[object File]" ||
      type === "[object String]" ||
      type === "[object Uint8Array]"
    );
  }

  if (!TypeRegistry.Has("Binary")) TypeRegistry.Set("Binary", BinaryCheck);

  return /** @type {TBinary} */ ({
    anyOf: [
      {
        type: "object",
        additionalProperties: true,
      },
      {
        type: "string",
        format: "binary",
      },
    ],
    [Kind]: "Binary",
  });
};

const ComponentsSchemasUser = T.Object({
  id: T.Integer({ format: "int32" }),
  email: T.String(),
});
const ComponentsSchemasOrderProblemReason = T.Union([
  T.Literal("not_found"),
  T.Literal("unavailable"),
]);
const ComponentsSchemasOrderProblem = T.Object({
  productId: T.Integer({ format: "int32" }),
  name: T.Optional(T.String()),
  reason: CloneType(ComponentsSchemasOrderProblemReason),
});
const ComponentsSchemasApiError = T.Object({
  code: T.String(),
  message: T.String(),
  problems: T.Optional(T.Array(CloneType(ComponentsSchemasOrderProblem))),
});
const ComponentsSchemasCredentials = T.Object({
  email: T.String({ maxLength: 254, format: "email" }),
  password: T.String({ minLength: 6, maxLength: 128 }),
});
const ComponentsSchemasCurrentUser = T.Object({
  user: T.Union([T.Null(), T.Intersect([CloneType(ComponentsSchemasUser)])]),
});
const ComponentsSchemasCategory = T.Object({
  id: T.Integer({ format: "int32" }),
  slug: T.String(),
  name: T.String(),
});
const ComponentsSchemasOrderStatus = T.Literal("paid");
const ComponentsSchemasDeliveryMethod = T.Union([T.Literal("delivery"), T.Literal("pickup")]);
const ComponentsSchemasMoney = T.Integer({ format: "int32", minimum: 0 });
const ComponentsSchemasOrderLine = T.Object({
  productId: T.Integer({ format: "int32" }),
  name: T.String(),
  price: CloneType(ComponentsSchemasMoney),
  quantity: T.Integer({ format: "int32" }),
  subtotal: CloneType(ComponentsSchemasMoney),
});
const ComponentsSchemasOrder = T.Object({
  id: T.Integer({ format: "int32" }),
  status: CloneType(ComponentsSchemasOrderStatus),
  createdAt: T.String({ format: "date-time" }),
  method: CloneType(ComponentsSchemasDeliveryMethod),
  recipientName: T.String(),
  phone: T.String(),
  address: T.Union([T.Null(), T.String()]),
  total: CloneType(ComponentsSchemasMoney),
  lines: T.Array(CloneType(ComponentsSchemasOrderLine)),
});
const ComponentsSchemasOrderItemInput = T.Object({
  productId: T.Integer({ format: "int32", minimum: 1 }),
  quantity: T.Integer({ format: "int32", minimum: 1, maximum: 99 }),
});
const ComponentsSchemasReceiptInput = T.Object({
  method: CloneType(ComponentsSchemasDeliveryMethod),
  recipientName: T.String({ minLength: 1, maxLength: 100 }),
  phone: T.String({ minLength: 5, maxLength: 30 }),
  address: T.Optional(T.String({ maxLength: 300 })),
});
const ComponentsSchemasCreateOrderRequest = T.Object({
  items: T.Array(CloneType(ComponentsSchemasOrderItemInput), {
    minItems: 1,
    maxItems: 50,
  }),
  receipt: CloneType(ComponentsSchemasReceiptInput),
});
const ComponentsParametersProductListQueryCategory = T.Any();
const ComponentsParametersProductListQueryPriceMin = T.Any();
const ComponentsParametersProductListQueryPriceMax = T.Any();
const ComponentsParametersProductListQueryAvailable = T.Any();
const ComponentsParametersProductListQueryQ = T.Any();
const ComponentsParametersProductListQueryPage = T.Any();
const ComponentsParametersProductListQueryPageSize = T.Any();
const ComponentsSchemasProduct = T.Object({
  id: T.Integer({ format: "int32" }),
  slug: T.String(),
  name: T.String(),
  description: T.String(),
  price: CloneType(ComponentsSchemasMoney),
  imageUrl: T.Union([T.Null(), T.String()]),
  available: T.Boolean(),
  category: CloneType(ComponentsSchemasCategory),
});
const ComponentsSchemasProductPage = T.Object({
  items: T.Array(CloneType(ComponentsSchemasProduct)),
  page: T.Integer({ format: "int32" }),
  pageSize: T.Integer({ format: "int32" }),
  total: T.Integer({ format: "int32" }),
  totalPages: T.Integer({ format: "int32" }),
});
const ComponentsSchemasPromo = T.Object({
  id: T.Integer({ format: "int32" }),
  title: T.String(),
  text: T.String(),
  product: CloneType(ComponentsSchemasProduct),
});

const schema = {
  "/auth/login": {
    POST: {
      args: T.Object({
        body: CloneType(ComponentsSchemasCredentials, {
          "x-content-type": "application/json",
        }),
      }),
      data: CloneType(ComponentsSchemasUser, {
        "x-status-code": "200",
        "x-content-type": "application/json",
      }),
      error: T.Union([
        CloneType(ComponentsSchemasApiError, {
          "x-status-code": "400",
          "x-content-type": "application/json",
        }),
        CloneType(ComponentsSchemasApiError, {
          "x-status-code": "401",
          "x-content-type": "application/json",
        }),
      ]),
    },
  },
  "/auth/logout": {
    POST: {
      args: T.Void(),
      data: T.Any({ "x-status-code": "204" }),
      error: T.Union([T.Any({ "x-status-code": "default" })]),
    },
  },
  "/auth/me": {
    GET: {
      args: T.Void(),
      data: CloneType(ComponentsSchemasCurrentUser, {
        "x-status-code": "200",
        "x-content-type": "application/json",
      }),
      error: T.Union([T.Any({ "x-status-code": "default" })]),
    },
  },
  "/auth/register": {
    POST: {
      args: T.Object({
        body: CloneType(ComponentsSchemasCredentials, {
          "x-content-type": "application/json",
        }),
      }),
      data: CloneType(ComponentsSchemasUser, {
        "x-status-code": "201",
        "x-content-type": "application/json",
      }),
      error: T.Union([
        CloneType(ComponentsSchemasApiError, {
          "x-status-code": "400",
          "x-content-type": "application/json",
        }),
        CloneType(ComponentsSchemasApiError, {
          "x-status-code": "409",
          "x-content-type": "application/json",
        }),
      ]),
    },
  },
  "/categories": {
    GET: {
      args: T.Void(),
      data: T.Array(CloneType(ComponentsSchemasCategory), {
        "x-status-code": "200",
        "x-content-type": "application/json",
      }),
      error: T.Union([T.Any({ "x-status-code": "default" })]),
    },
  },
  "/health": {
    GET: {
      args: T.Void(),
      data: T.Object(
        {
          status: T.Literal("ok"),
        },
        {
          "x-status-code": "200",
          "x-content-type": "application/json",
        },
      ),
      error: T.Union([T.Any({ "x-status-code": "default" })]),
    },
  },
  "/orders": {
    POST: {
      args: T.Object({
        body: CloneType(ComponentsSchemasCreateOrderRequest, {
          "x-content-type": "application/json",
        }),
      }),
      data: CloneType(ComponentsSchemasOrder, {
        "x-status-code": "201",
        "x-content-type": "application/json",
      }),
      error: T.Union([
        CloneType(ComponentsSchemasApiError, {
          "x-status-code": "400",
          "x-content-type": "application/json",
        }),
        CloneType(ComponentsSchemasApiError, {
          "x-status-code": "401",
          "x-content-type": "application/json",
        }),
        CloneType(ComponentsSchemasApiError, {
          "x-status-code": "409",
          "x-content-type": "application/json",
        }),
      ]),
    },
    GET: {
      args: T.Void(),
      data: T.Array(CloneType(ComponentsSchemasOrder), {
        "x-status-code": "200",
        "x-content-type": "application/json",
      }),
      error: T.Union([
        CloneType(ComponentsSchemasApiError, {
          "x-status-code": "401",
          "x-content-type": "application/json",
        }),
      ]),
    },
  },
  "/orders/{id}": {
    GET: {
      args: T.Object({
        params: T.Object({
          id: T.Integer({ format: "int32", minimum: 1, "x-in": "path" }),
        }),
      }),
      data: CloneType(ComponentsSchemasOrder, {
        "x-status-code": "200",
        "x-content-type": "application/json",
      }),
      error: T.Union([
        CloneType(ComponentsSchemasApiError, {
          "x-status-code": "400",
          "x-content-type": "application/json",
        }),
        CloneType(ComponentsSchemasApiError, {
          "x-status-code": "401",
          "x-content-type": "application/json",
        }),
        CloneType(ComponentsSchemasApiError, {
          "x-status-code": "404",
          "x-content-type": "application/json",
        }),
      ]),
    },
  },
  "/products": {
    GET: {
      args: T.Optional(
        T.Object({
          query: T.Optional(
            T.Object({
              category: T.Optional(T.String({ maxLength: 64, "x-in": "query" })),
              priceMin: T.Optional(CloneType(ComponentsSchemasMoney, { "x-in": "query" })),
              priceMax: T.Optional(CloneType(ComponentsSchemasMoney, { "x-in": "query" })),
              available: T.Optional(T.Boolean({ "x-in": "query" })),
              q: T.Optional(T.String({ maxLength: 100, "x-in": "query" })),
              page: T.Optional(
                T.Integer({
                  format: "int32",
                  minimum: 1,
                  default: 1,
                  "x-in": "query",
                }),
              ),
              pageSize: T.Optional(
                T.Integer({
                  format: "int32",
                  minimum: 1,
                  maximum: 48,
                  default: 12,
                  "x-in": "query",
                }),
              ),
            }),
          ),
        }),
      ),
      data: CloneType(ComponentsSchemasProductPage, {
        "x-status-code": "200",
        "x-content-type": "application/json",
      }),
      error: T.Union([
        CloneType(ComponentsSchemasApiError, {
          "x-status-code": "400",
          "x-content-type": "application/json",
        }),
      ]),
    },
  },
  "/products/{id}": {
    GET: {
      args: T.Object({
        params: T.Object({
          id: T.Integer({ format: "int32", minimum: 1, "x-in": "path" }),
        }),
      }),
      data: CloneType(ComponentsSchemasProduct, {
        "x-status-code": "200",
        "x-content-type": "application/json",
      }),
      error: T.Union([
        CloneType(ComponentsSchemasApiError, {
          "x-status-code": "400",
          "x-content-type": "application/json",
        }),
        CloneType(ComponentsSchemasApiError, {
          "x-status-code": "404",
          "x-content-type": "application/json",
        }),
      ]),
    },
  },
  "/promos": {
    GET: {
      args: T.Void(),
      data: T.Array(CloneType(ComponentsSchemasPromo), {
        "x-status-code": "200",
        "x-content-type": "application/json",
      }),
      error: T.Union([T.Any({ "x-status-code": "default" })]),
    },
  },
};

const _components = {
  parameters: {
    "ProductListQuery.available": T.Optional(T.Boolean({ "x-in": "query" })),
    "ProductListQuery.category": T.Optional(T.String({ maxLength: 64, "x-in": "query" })),
    "ProductListQuery.page": T.Optional(
      T.Integer({ format: "int32", minimum: 1, default: 1, "x-in": "query" }),
    ),
    "ProductListQuery.pageSize": T.Optional(
      T.Integer({
        format: "int32",
        minimum: 1,
        maximum: 48,
        default: 12,
        "x-in": "query",
      }),
    ),
    "ProductListQuery.priceMax": T.Optional(CloneType(ComponentsSchemasMoney, { "x-in": "query" })),
    "ProductListQuery.priceMin": T.Optional(CloneType(ComponentsSchemasMoney, { "x-in": "query" })),
    "ProductListQuery.q": T.Optional(T.String({ maxLength: 100, "x-in": "query" })),
  },
  schemas: {
    ApiError: CloneType(ComponentsSchemasApiError),
    Category: CloneType(ComponentsSchemasCategory),
    CreateOrderRequest: CloneType(ComponentsSchemasCreateOrderRequest),
    Credentials: CloneType(ComponentsSchemasCredentials),
    CurrentUser: CloneType(ComponentsSchemasCurrentUser),
    DeliveryMethod: CloneType(ComponentsSchemasDeliveryMethod),
    Money: CloneType(ComponentsSchemasMoney, { "x-in": "query" }),
    Order: CloneType(ComponentsSchemasOrder),
    OrderItemInput: CloneType(ComponentsSchemasOrderItemInput),
    OrderLine: CloneType(ComponentsSchemasOrderLine),
    OrderProblem: CloneType(ComponentsSchemasOrderProblem),
    OrderProblemReason: CloneType(ComponentsSchemasOrderProblemReason),
    OrderStatus: CloneType(ComponentsSchemasOrderStatus),
    Product: CloneType(ComponentsSchemasProduct),
    ProductPage: CloneType(ComponentsSchemasProductPage),
    Promo: CloneType(ComponentsSchemasPromo),
    ReceiptInput: CloneType(ComponentsSchemasReceiptInput),
    User: CloneType(ComponentsSchemasUser),
  },
};

export { schema, _components as components };
