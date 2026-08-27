import prisma from "../config/database.js";
import { verifyAccessToken } from "../services/jwt.service.js";
import { ApiError } from "../utils/response.util.js";
import { ensureSettingsTables } from "../modules/parametres/parametres.repository.js";

const WRITE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const PUBLIC_AUTH = ["/api/v1/auth/login", "/api/v1/auth/verify-mfa", "/api/v1/auth/resend-mfa", "/api/v1/auth/forgot-password", "/api/v1/auth/reset-password", "/api/v1/auth/refresh", "/api/v1/auth/logout"];

export async function maintenanceGuard(req, _res, next) {
  if (!WRITE_METHODS.has(req.method) || PUBLIC_AUTH.includes(req.path) || req.path === "/api/v1/parametres/systeme/maintenance") return next();
  try {
    await ensureSettingsTables();
    const [settings] = await prisma.$queryRawUnsafe("SELECT mode_maintenance FROM parametres_systeme WHERE id = 'default'");
    if (!settings?.mode_maintenance) return next();
    const token = (req.headers.authorization || "").split(" ")[1];
    const payload = token ? verifyAccessToken(token) : null;
    const user = payload?.userId ? await prisma.utilisateur.findUnique({ where: { id: payload.userId }, include: { role: true } }) : null;
    if (user?.role?.nomRole === "SUPER_ADMIN" || "ADMIN") return next();
    return next(new ApiError(503, "MAINTENANCE_MODE", "Le systeme est en maintenance. Les modifications sont temporairement bloquees"));
  } catch (error) {
    return next(error);
  }
}
