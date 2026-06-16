export class ApiError extends Error {
  constructor(statusCode, code, message, details = null) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export function sendSuccess(res, data = null, message = "Operation reussie", meta = null, status = 200) {
  return res.status(status).json({ success: true, data, message, meta });
}

export function sendError(res, statusCode, code, message, details = null) {
  return res.status(statusCode).json({
    success: false,
    error: { code, message, details },
  });
}

