import jwt from "jsonwebtoken";
import prisma from "../config/database.js";
import { verifyAccessToken } from "../services/jwt.service.js";
import { ApiError } from "../utils/response.util.js";

export async function authenticate(req, _res, next) {
  try {
    const header = req.headers.authorization || "";
    const [scheme, token] = header.split(" ");
    if (scheme !== "Bearer" || !token) {
      throw new ApiError(401, "UNAUTHORIZED", "Token d'authentification requis");
    }

    const payload = verifyAccessToken(token);
    const userId = payload.userId || payload.id;
    if (!userId || !payload.sessionId) {
      throw new ApiError(401, "UNAUTHORIZED", "Session invalide");
    }

    const session = await prisma.session.findUnique({
      where: { id: payload.sessionId },
      select: { id: true, userId: true },
    });

    if (!session || session.userId !== userId) {
      throw new ApiError(401, "UNAUTHORIZED", "Session invalide");
    }

    req.user = {
      id: userId,
      userId,
      sessionId: session.id,
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
