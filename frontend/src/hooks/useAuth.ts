import { useCallback, useEffect, useMemo, useState } from "react";
import * as authService from "../lib/api/auth.service";

export type AuthUser = {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role?: { id: string; nomRole: string } | string | null;
  permissions: string[];
};

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("erp_user");
    if (stored) setUser(JSON.parse(stored));
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const result = await authService.login(email, password);
      setUser(result.user);
      return result;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const hasPermission = useCallback(
    (permission: string) => Boolean(user?.permissions?.includes(permission)),
    [user],
  );

  return useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(
        user && localStorage.getItem("erp_access_token"),
      ),
      isLoading,
      login,
      logout,
      hasPermission,
    }),
    [user, isLoading, login, logout, hasPermission],
  );
}
