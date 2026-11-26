import { QueryClient } from "@tanstack/react-query";
import {
  createBrowserHistory,
  createHashHistory,
  createRouter,
} from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();
  const history =
    typeof window === "undefined"
      ? undefined
      : import.meta.env.VITE_TARGET === "electron"
        ? createHashHistory()
        : createBrowserHistory();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    ...(history ? { history } : {}),
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  return router;
};
