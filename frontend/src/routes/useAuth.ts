import { useRouteContext } from "@tanstack/react-router";
import { Route as AppRoute } from "@/routes/_app";
import {
  canAccessPermission,
  getStoredUser,
  type AuthUserLike,
} from "@/lib/auth-session";

/**
 * Hook personnalisé pour accéder aux données d'authentification et aux permissions.
 * Doit être utilisé à l'intérieur des composants enfants de `_app.tsx`.
 */
export function useAuth() {
  const { auth } = useRouteContext({ from: AppRoute.id });
  const user = (auth?.user as AuthUserLike | undefined) ?? getStoredUser();

  if (!user) {
    throw new Error("useAuth must be used within an authenticated context.");
  }

  /**
   * Vérifie si l'utilisateur courant a une permission spécifique.
   * @param module Le module de la permission (ex: 'PRODUIT').
   * @param action L'action de la permission (ex: 'CREATE').
   * @returns `true` si l'utilisateur a la permission, `false` sinon.
   */
  const hasPermission = (module: string, action: string): boolean => {
    return canAccessPermission(user, module, action);
  };

  return { user, isAuthenticated: !!user, hasPermission };
}
