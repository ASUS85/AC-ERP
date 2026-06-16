import rateLimit from "express-rate-limit";
import { sendError } from "../utils/response.util.js";

const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000);

function handler(_req, res) {
  return sendError(res, 429, "RATE_LIMIT_EXCEEDED", "Trop de requetes, veuillez reessayer plus tard");
}

export const rateLimiter = rateLimit({
  windowMs,
  max: Number(process.env.RATE_LIMIT_MAX || 100),
  standardHeaders: true,
  legacyHeaders: false,
  handler,
});

export const authLimiter = rateLimit({
  windowMs,
  max: Number(process.env.RATE_LIMIT_AUTH_MAX || 10),
  standardHeaders: true,
  legacyHeaders: false,
  handler,
});

