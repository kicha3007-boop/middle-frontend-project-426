import type { FastifyError, FastifyInstance, FastifyReply } from "fastify";

import { captureError } from "./monitoring.js";
import type { ApiError, OrderProblem } from "./schemas.js";

// Ожидаемый отказ: бизнес-правило или отсутствующий ресурс. Сообщение показывается пользователю.
export class AppError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly problems: OrderProblem[] | undefined;

  constructor(statusCode: number, code: string, message: string, problems?: OrderProblem[]) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
    this.problems = problems;
  }
}

export const notFound = (message: string): AppError => new AppError(404, "NOT_FOUND", message);

export const unauthorized = (): AppError =>
  new AppError(401, "UNAUTHORIZED", "Нужно войти в аккаунт");

export const badRequest = (message: string): AppError =>
  new AppError(400, "VALIDATION_ERROR", message);

// Единственное место, где собирается тело ответа об ошибке.
export const sendError = (reply: FastifyReply, statusCode: number, body: ApiError): FastifyReply =>
  reply.code(statusCode).type("application/json").send(body);

const validationMessage = (error: FastifyError): string => {
  const [first] = error.validation ?? [];
  const where = error.validationContext ?? "request";
  const field = first?.instancePath ? first.instancePath.replace(/^\//, "") : "";
  const detail = [field, first?.message].filter(Boolean).join(" ");
  return `Некорректный запрос (${where}): ${detail}`.trim();
};

export const registerErrorHandler = (app: FastifyInstance): void => {
  app.setErrorHandler((error: FastifyError | AppError, request, reply) => {
    if (error instanceof AppError) {
      return sendError(reply, error.statusCode, {
        code: error.code,
        message: error.message,
        ...(error.problems ? { problems: error.problems } : {}),
      });
    }

    if (error.validation) {
      return sendError(reply, 400, { code: "VALIDATION_ERROR", message: validationMessage(error) });
    }

    // Ошибки разбора запроса самим Fastify: битый JSON, неподдерживаемый Content-Type и т. п.
    const statusCode = error.statusCode ?? 500;
    if (statusCode < 500) {
      return sendError(reply, statusCode, {
        code: error.code ?? "BAD_REQUEST",
        message: error.message,
      });
    }

    request.log.error(error);
    captureError(error);
    return sendError(reply, 500, {
      code: "INTERNAL_ERROR",
      message: "Внутренняя ошибка сервера. Попробуйте ещё раз позже.",
    });
  });
};
