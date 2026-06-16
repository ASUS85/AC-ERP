import { ZodError } from "zod";
import { ApiError } from "../utils/response.util.js";

function formatZodIssues(error) {
  return error.issues.map((issue) => ({
    field: issue.path.join("."),
    message: issue.message,
  }));
}

export function validate(schema) {
  return (req, _res, next) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(new ApiError(400, "VALIDATION_ERROR", "Donnees invalides", formatZodIssues(error)));
        return;
      }
      next(error);
    }
  };
}

