import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import logger from "../utils/logger.js";
import { ApiError, sendError } from "../utils/response.util.js";

function formatZodIssues(error) {
  return error.issues.map((issue) => ({ field: issue.path.join("."), message: issue.message }));
}

export function notFoundHandler(req, _res, next) {
  next(new ApiError(404, "NOT_FOUND", `Route introuvable: ${req.method} ${req.originalUrl}`));
}

export function errorHandler(err, _req, res, _next) {
  logger.error(err.message, { stack: err.stack, code: err.code });

  if (err instanceof ApiError) {
    return sendError(res, err.statusCode, err.code, err.message, err.details);
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      return sendError(res, 409, "DUPLICATE_ENTRY", "Une ressource avec ces valeurs existe deja", err.meta);
    }
    if (err.code === "P2025") {
      return sendError(res, 404, "NOT_FOUND", "Ressource introuvable", err.meta);
    }
  }

  if (err instanceof ZodError) {
    return sendError(res, 400, "VALIDATION_ERROR", "Donnees invalides", formatZodIssues(err));
  }

  const message =
    process.env.NODE_ENV === "production" ? "Erreur interne du serveur" : err.message;
  return sendError(res, 500, "INTERNAL_ERROR", message);
}

