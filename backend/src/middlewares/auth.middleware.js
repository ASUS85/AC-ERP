import jwt from "jsonwebtoken";
import { verifyAccessToken } from "../services/jwt.service.js";
import { ApiError } from "../utils/response.util.js";

export function authenticate(req, _res, next) {
  try {
    const header = req.headers.authorization || "";
    const [scheme, token] = header.split(" ");
    if (scheme !== "Bearer" || !token) {
      throw new ApiError(401, "UNAUTHORIZED", "Token d'authentification requis");
    }

    const payload = verifyAccessToken(token);
    req.user = {
      userId: payload.userId || payload.id,
      roleId: payload.roleId,
      permissions: payload.permissions || [],
    };
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      next(new ApiError(401, "TOKEN_EXPIRED", "Token expire"));
      return;
    }
    next(error instanceof ApiError ? error : new ApiError(401, "UNAUTHORIZED", "Token invalide"));
  }
}

