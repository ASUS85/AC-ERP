export const AUTH_STORAGE_KEYS = {
  accessToken: "erp_access_token",
  refreshToken: "erp_refresh_token",
  user: "erp_user",
} as const;

export type PermissionEntryLike =
  | string
  | {
      permission?: {
        module?: string;
        action?: string;
      };
      module?: string;
      action?: string;
    };

export type AuthUserLike = {
  nom?: string;
  prenom?: string;
  email?: string;
  avatar?: string;
  permissions?: string[];
  role?:
    | string
    | {
        nomRole?: string;
        permissions?: PermissionEntryLike[];
      }
    | null;
};

function emitAuthChange() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("auth-change"));
}

function normalizePermissionKey(module?: string, action?: string) {
  const normalizedModule = String(module || "")
    .trim()
    .toLowerCase();
  const normalizedAction = String(action || "")
    .trim()
    .toLowerCase();
  return normalizedModule && normalizedAction
    ? `${normalizedModule}:${normalizedAction}`
    : "";
}

function permissionKeyFromEntry(entry: PermissionEntryLike) {
  if (typeof entry === "string") {
    return entry.trim().toLowerCase();
  }

  if (entry.permission?.module && entry.permission?.action) {
    return normalizePermissionKey(
      entry.permission.module,
      entry.permission.action,
    );
  }

  if (entry.module && entry.action) {
    return normalizePermissionKey(entry.module, entry.action);
  }

  return "";
}

export function getStoredUser<T extends AuthUserLike = AuthUserLike>() {
  if (typeof window === "undefined") return null as T | null;

  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEYS.user);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function isSuperAdmin(user: AuthUserLike | null | undefined) {
  if (!user?.role) return false;
  return typeof user.role === "string"
    ? user.role === "SUPER_ADMIN"
    : user.role.nomRole === "SUPER_ADMIN";
}

export function getUserPermissions(user: AuthUserLike | null | undefined) {
  if (!user) return [];

  const directPermissions = Array.isArray(user.permissions)
    ? user.permissions.map((permission) => permission.trim().toLowerCase())
    : [];

  const nestedPermissions =
    user.role &&
    typeof user.role === "object" &&
    Array.isArray(user.role.permissions)
      ? user.role.permissions.map(permissionKeyFromEntry).filter(Boolean)
      : [];

  return Array.from(
    new Set([...directPermissions, ...nestedPermissions].filter(Boolean)),
  );
}

export function canAccessPermission(
  user: AuthUserLike | null | undefined,
  module?: string,
  action?: string,
) {
  if (!module || !action) return true;
  if (isSuperAdmin(user)) return true;
  return getUserPermissions(user).includes(
    normalizePermissionKey(module, action),
  );
}

export function getRoleName(user: AuthUserLike | null | undefined) {
  if (!user?.role) return "Utilisateur";
  return typeof user.role === "string"
    ? user.role
    : user.role.nomRole || "Utilisateur";
}

export function storeAuthSession(data: {
  accessToken?: string;
  refreshToken?: string;
  user?: AuthUserLike;
}) {
  if (typeof window === "undefined") return;

  if (data.accessToken) {
    localStorage.setItem(AUTH_STORAGE_KEYS.accessToken, data.accessToken);
  }
  if (data.refreshToken) {
    localStorage.setItem(AUTH_STORAGE_KEYS.refreshToken, data.refreshToken);
  }
  if (data.user) {
    localStorage.setItem(AUTH_STORAGE_KEYS.user, JSON.stringify(data.user));
  }

  emitAuthChange();
}

export function clearAuthSession() {
  if (typeof window === "undefined") return;

  localStorage.removeItem(AUTH_STORAGE_KEYS.accessToken);
  localStorage.removeItem(AUTH_STORAGE_KEYS.refreshToken);
  localStorage.removeItem(AUTH_STORAGE_KEYS.user);
  emitAuthChange();
}
