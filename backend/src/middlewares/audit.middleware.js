import { logAction } from "../services/audit.service.js";

const WRITE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const SECRET_FIELDS = new Set(["password", "passwordHash", "ancienPassword", "nouveauPassword", "refreshToken", "token", "code"]);

function sanitized(value) {
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, SECRET_FIELDS.has(key) ? "[MASQUE]" : sanitized(item)]));
}

export function auditActivity(req, res, next) {
  if (!WRITE_METHODS.has(req.method)) return next();
  res.on("finish", () => {
    const segments = req.path.split("/").filter(Boolean);
    void logAction({
      userId: req.user?.userId,
      action: `${req.method} ${req.path}`.slice(0, 100),
      module: (segments[2] || segments[0] || "systeme").slice(0, 100),
      entityId: req.params?.id || null,
      newValues: { status: res.statusCode, donnees: sanitized(req.body) },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });
  });
  next();
}
