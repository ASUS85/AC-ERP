import { ApiError } from "../utils/response.util.js";

export function authorize(...permissions) {
  return (req, _res, next) => {
    const userPermissions = req.user?.permissions || [];
    const allowed = permissions.every((permission) => userPermissions.includes(permission));
    if (!allowed) {
      next(new ApiError(403, "FORBIDDEN", "Permission insuffisante"));
      return;
    }
    next();
  };
}

