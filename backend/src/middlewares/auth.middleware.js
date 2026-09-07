import jwt from "jsonwebtoken";
import prisma from "../config/database.js";
import { verifyAccessToken } from "../services/jwt.service.js";
import { ApiError } from "../utils/response.util.js";

export async function authenticate(req, _res, next) {
  try {
    const header = req.headers.authorization || "";
    const [scheme, token] = header.split(" ");
    if (scheme !== "Bearer" || !token) {
      throw new ApiError(
        401,
        "UNAUTHORIZED",
        "Token d'authentification requis",
      );
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

    const user = await prisma.utilisateur.findUnique({
      where: { id: userId },
      select: {
        id: true,
        statut: true,
        isActive: true,
        idRole: true,
        role: {
          select: {
            permissions: {
              select: {
                permission: { select: { module: true, action: true } },
              },
            },
          },
        },
      },
    });

    if (!user || user.statut !== "ACTIF" || !user.isActive) {
      throw new ApiError(401, "ACCOUNT_DISABLED", "Compte inactif ou bloque");
    }

    const permissions =
      user.role?.permissions?.map(
        ({ permission }) => `${permission.module}:${permission.action}`,
      ) || [];

    req.user = {
      id: userId,
      userId,
      sessionId: session.id,
      roleId: user.idRole,
      permissions,
    };
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      next(new ApiError(401, "TOKEN_EXPIRED", "Token expire"));
      return;
    }
    next(
      error instanceof ApiError
        ? error
        : new ApiError(401, "UNAUTHORIZED", "Token invalide"),
    );
  }
}
