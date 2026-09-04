import { useRouteContext } from "@tanstack/react-router";
import { p as Route, e as getStoredUser, d as canAccessPermission } from "./router-DmDzdhp9.js";
function useAuth() {
  const { auth } = useRouteContext({ from: Route.id });
  const user = auth?.user ?? getStoredUser();
  if (!user) {
    throw new Error("useAuth must be used within an authenticated context.");
  }
  const hasPermission = (module, action) => {
    return canAccessPermission(user, module, action);
  };
  return { user, isAuthenticated: !!user, hasPermission };
}
export {
  useAuth as u
};
