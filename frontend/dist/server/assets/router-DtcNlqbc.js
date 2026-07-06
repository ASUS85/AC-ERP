import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, useRouter, Link, Outlet, HeadContent, Scripts, createFileRoute, lazyRouteComponent, createRouter } from "@tanstack/react-router";
import { jsx, jsxs } from "react/jsx-runtime";
import { useRef, useState, useCallback, useEffect, useMemo, createContext, useContext } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Toaster as Toaster$1 } from "sonner";
const appCss = "/assets/styles-Dubvvasv.css";
function reportLovableError(error, context = {}) {
  if (typeof window === "undefined") return;
  window.__lovableEvents?.captureException?.(
    error,
    {
      source: "react_error_boundary",
      route: window.location.pathname,
      ...context
    },
    {
      mechanism: "react_error_boundary",
      handled: false,
      severity: "error"
    }
  );
}
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
const DEFAULT_MAX_DURATION_MS = 500;
const DEFAULT_LABEL = "Chargement...";
const GlobalLoaderContext = createContext(
  null
);
function GlobalLoaderProvider({ children }) {
  const timeoutRef = useRef(null);
  const activeIdRef = useRef(0);
  const [loader, setLoader] = useState({
    visible: false,
    target: "main",
    label: DEFAULT_LABEL
  });
  const clearLoaderTimeout = useCallback(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);
  const hideLoader = useCallback(() => {
    clearLoaderTimeout();
    activeIdRef.current += 1;
    setLoader((current) => ({ ...current, visible: false }));
  }, [clearLoaderTimeout]);
  const showLoader = useCallback(
    (options = {}) => {
      clearLoaderTimeout();
      const requestId = activeIdRef.current + 1;
      activeIdRef.current = requestId;
      const maxDurationMs = DEFAULT_MAX_DURATION_MS;
      setLoader({
        visible: true,
        target: options.target ?? "main",
        label: options.label ?? DEFAULT_LABEL
      });
      timeoutRef.current = window.setTimeout(() => {
        if (activeIdRef.current === requestId) {
          setLoader((current) => ({ ...current, visible: false }));
          timeoutRef.current = null;
        }
      }, maxDurationMs);
      return () => {
        if (activeIdRef.current === requestId) hideLoader();
      };
    },
    [clearLoaderTimeout, hideLoader]
  );
  const runWithLoader = useCallback(
    async (task, options) => {
      const stop = showLoader(options);
      try {
        return await task;
      } finally {
        stop();
      }
    },
    [showLoader]
  );
  useEffect(() => clearLoaderTimeout, [clearLoaderTimeout]);
  const value = useMemo(
    () => ({ loader, showLoader, hideLoader, runWithLoader }),
    [hideLoader, loader, runWithLoader, showLoader]
  );
  return /* @__PURE__ */ jsx(GlobalLoaderContext.Provider, { value, children });
}
function useGlobalLoader() {
  const context = useContext(GlobalLoaderContext);
  if (!context)
    throw new Error(
      "useGlobalLoader must be used within GlobalLoaderProvider."
    );
  return context;
}
function GlobalLoaderSlot({
  target = "main",
  className
}) {
  const { loader } = useGlobalLoader();
  if (!loader.visible || loader.target !== target) return null;
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: cn(
        "absolute inset-0 z-20 flex min-h-48 items-center justify-center rounded-lg bg-background/5 backdrop-blur-sm",
        className
      ),
      role: "status",
      "aria-live": "polite",
      "aria-label": loader.label,
      children: /* @__PURE__ */ jsx("div", { className: "flex flex-col items-center gap-4", children: /* @__PURE__ */ jsxs("div", { className: "relative h-20 w-20", children: [
        /* @__PURE__ */ jsx("span", { className: "absolute inset-0 rounded-full border-4 border-primary/15" }),
        /* @__PURE__ */ jsx("span", { className: "absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin" }),
        /* @__PURE__ */ jsx("span", { className: "absolute inset-3 rounded-full bg-primary/10" })
      ] }) })
    }
  );
}
const Toaster = ({ ...props }) => {
  return /* @__PURE__ */ jsx(
    Toaster$1,
    {
      className: "toaster group",
      toastOptions: {
        classNames: {
          toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
        }
      },
      ...props
    }
  );
};
function NotFoundComponent() {
  return /* @__PURE__ */ jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-7xl font-bold text-foreground", children: "404" }),
    /* @__PURE__ */ jsx("h2", { className: "mt-4 text-xl font-semibold text-foreground", children: "Page not found" }),
    /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "The page you're looking for doesn't exist or has been moved." }),
    /* @__PURE__ */ jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsx(
      Link,
      {
        to: "/",
        className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
        children: "Go home"
      }
    ) })
  ] }) });
}
function ErrorComponent({ error, reset }) {
  console.error(error);
  const router2 = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return /* @__PURE__ */ jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-xl font-semibold tracking-tight text-foreground", children: "This page didn't load" }),
    /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Something went wrong on our end. You can try refreshing or head back home." }),
    /* @__PURE__ */ jsxs("div", { className: "mt-6 flex flex-wrap justify-center gap-2", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => {
            router2.invalidate();
            reset();
          },
          className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
          children: "Try again"
        }
      ),
      /* @__PURE__ */ jsx(
        "a",
        {
          href: "/",
          className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
          children: "Go home"
        }
      )
    ] })
  ] }) });
}
const Route$m = createRootRouteWithContext()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "AC ERP — Plateforme de gestion commerciale intelligente" },
      {
        name: "description",
        content: "AC ERP centralise ventes, achats, stocks, clients et finances dans une plateforme moderne dotée d'intelligence artificielle."
      },
      { name: "author", content: "AC ERP" },
      { property: "og:title", content: "AC ERP — Gestion commerciale intelligente" },
      {
        property: "og:description",
        content: "ERP intelligent pour l'optimisation de la gestion commerciale des PME."
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" }
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@500;600;700;800&display=swap"
      }
    ]
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent
});
function RootShell({ children }) {
  return /* @__PURE__ */ jsxs("html", { lang: "en", children: [
    /* @__PURE__ */ jsx("head", { children: /* @__PURE__ */ jsx(HeadContent, {}) }),
    /* @__PURE__ */ jsxs("body", { children: [
      children,
      /* @__PURE__ */ jsx(Scripts, {})
    ] })
  ] });
}
function RootComponent() {
  const { queryClient } = Route$m.useRouteContext();
  return /* @__PURE__ */ jsx(QueryClientProvider, { client: queryClient, children: /* @__PURE__ */ jsxs(GlobalLoaderProvider, { children: [
    /* @__PURE__ */ jsx(Outlet, {}),
    /* @__PURE__ */ jsx(Toaster, { richColors: true, position: "top-right" })
  ] }) });
}
const BASE_URL = "";
const Route$l = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/products", changefreq: "weekly", priority: "0.7" },
          { path: "/customers", changefreq: "weekly", priority: "0.7" },
          { path: "/sales", changefreq: "weekly", priority: "0.7" },
          { path: "/invoices", changefreq: "weekly", priority: "0.7" },
          { path: "/reports", changefreq: "monthly", priority: "0.6" }
        ];
        const urls = entries.map(
          (e) => [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`
          ].filter(Boolean).join("\n")
        );
        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`
        ].join("\n");
        return new Response(xml, {
          headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" }
        });
      }
    }
  }
});
const $$splitComponentImporter$k = () => import("./reset-password-BwkzzfaD.js");
const Route$k = createFileRoute("/reset-password")({
  head: () => ({
    meta: [{
      title: "Réinitialiser le mot de passe — AC ERP"
    }, {
      name: "description",
      content: "Choisissez un nouveau mot de passe pour votre compte AC ERP."
    }]
  }),
  validateSearch: (search) => ({
    token: typeof search.token === "string" ? search.token : ""
  }),
  component: lazyRouteComponent($$splitComponentImporter$k, "component")
});
const $$splitComponentImporter$j = () => import("./login-wKdJLB2s.js");
const Route$j = createFileRoute("/login")({
  head: () => ({
    meta: [{
      title: "Connexion — AC ERP"
    }, {
      name: "description",
      content: "Connectez-vous à votre espace AC ERP."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$j, "component")
});
const $$splitComponentImporter$i = () => import("./_app-CTTzhhl8.js");
const Route$i = createFileRoute("/_app")({
  component: lazyRouteComponent($$splitComponentImporter$i, "component")
});
const $$splitComponentImporter$h = () => import("./_app.index-CgioOr0J.js");
const Route$h = createFileRoute("/_app/")({
  head: () => ({
    meta: [{
      title: "Tableau de bord — AC ERP"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$h, "component")
});
const $$splitComponentImporter$g = () => import("./_app.users-DLqrcGj1.js");
const Route$g = createFileRoute("/_app/users")({
  head: () => ({
    meta: [{
      title: "Utilisateurs — AC ERP"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$g, "component")
});
const $$splitComponentImporter$f = () => import("./_app.suppliers-CYOgshkx.js");
const Route$f = createFileRoute("/_app/suppliers")({
  head: () => ({
    meta: [{
      title: "Fournisseurs — AC ERP"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$f, "component")
});
const $$splitComponentImporter$e = () => import("./_app.statistics-Do7A6u9I.js");
const Route$e = createFileRoute("/_app/statistics")({
  head: () => ({
    meta: [{
      title: "Statistiques — AC ERP"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$e, "component")
});
const $$splitComponentImporter$d = () => import("./_app.settings-BadENAte.js");
const Route$d = createFileRoute("/_app/settings")({
  head: () => ({
    meta: [{
      title: "Paramètres — AC ERP"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$d, "component")
});
const $$splitComponentImporter$c = () => import("./_app.sales-Du6ogXub.js");
const Route$c = createFileRoute("/_app/sales")({
  head: () => ({
    meta: [{
      title: "Ventes — AC ERP"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$c, "component")
});
const $$splitComponentImporter$b = () => import("./_app.roles-BzNLKuhV.js");
const Route$b = createFileRoute("/_app/roles")({
  head: () => ({
    meta: [{
      title: "Rôles & permissions — AC ERP"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$b, "component")
});
const $$splitComponentImporter$a = () => import("./_app.reports-CSvSeKtB.js");
const Route$a = createFileRoute("/_app/reports")({
  head: () => ({
    meta: [{
      title: "Rapports — AC ERP"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$a, "component")
});
const $$splitComponentImporter$9 = () => import("./_app.purchases-CXCcPMaK.js");
const Route$9 = createFileRoute("/_app/purchases")({
  head: () => ({
    meta: [{
      title: "Achats — AC ERP"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
const $$splitComponentImporter$8 = () => import("./_app.products-C-bM0kAW.js");
const Route$8 = createFileRoute("/_app/products")({
  head: () => ({
    meta: [{
      title: "Produits — AC ERP"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
const $$splitComponentImporter$7 = () => import("./_app.payments-afqGREcW.js");
const Route$7 = createFileRoute("/_app/payments")({
  head: () => ({
    meta: [{
      title: "Paiements — AC ERP"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
const $$splitComponentImporter$6 = () => import("./_app.notifications-cRrp0ffT.js");
const Route$6 = createFileRoute("/_app/notifications")({
  head: () => ({
    meta: [{
      title: "Notifications — AC ERP"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
const $$splitComponentImporter$5 = () => import("./_app.invoices-CQvIY7Kk.js");
const Route$5 = createFileRoute("/_app/invoices")({
  head: () => ({
    meta: [{
      title: "Factures — AC ERP"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
const $$splitComponentImporter$4 = () => import("./_app.inventory-BxGHTgD4.js");
const Route$4 = createFileRoute("/_app/inventory")({
  head: () => ({
    meta: [{
      title: "Stocks — AC ERP"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
const $$splitComponentImporter$3 = () => import("./_app.customers-Bnv4URRg.js");
const Route$3 = createFileRoute("/_app/customers")({
  head: () => ({
    meta: [{
      title: "Clients — AC ERP"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
const $$splitComponentImporter$2 = () => import("./_app.categories-BlDpNPNz.js");
const Route$2 = createFileRoute("/_app/categories")({
  head: () => ({
    meta: [{
      title: "Catégories — AC ERP"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
const $$splitComponentImporter$1 = () => import("./_app.assistant-B1nuNa6C.js");
const Route$1 = createFileRoute("/_app/assistant")({
  head: () => ({
    meta: [{
      title: "Assistant ERP — AC ERP"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
const $$splitComponentImporter = () => import("./_app.ai-LJuJMkJM.js");
const Route = createFileRoute("/_app/ai")({
  head: () => ({
    meta: [{
      title: "Prévisions IA — AC ERP"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter, "component")
});
const SitemapDotxmlRoute = Route$l.update({
  id: "/sitemap.xml",
  path: "/sitemap.xml",
  getParentRoute: () => Route$m
});
const ResetPasswordRoute = Route$k.update({
  id: "/reset-password",
  path: "/reset-password",
  getParentRoute: () => Route$m
});
const LoginRoute = Route$j.update({
  id: "/login",
  path: "/login",
  getParentRoute: () => Route$m
});
const AppRoute = Route$i.update({
  id: "/_app",
  getParentRoute: () => Route$m
});
const AppIndexRoute = Route$h.update({
  id: "/",
  path: "/",
  getParentRoute: () => AppRoute
});
const AppUsersRoute = Route$g.update({
  id: "/users",
  path: "/users",
  getParentRoute: () => AppRoute
});
const AppSuppliersRoute = Route$f.update({
  id: "/suppliers",
  path: "/suppliers",
  getParentRoute: () => AppRoute
});
const AppStatisticsRoute = Route$e.update({
  id: "/statistics",
  path: "/statistics",
  getParentRoute: () => AppRoute
});
const AppSettingsRoute = Route$d.update({
  id: "/settings",
  path: "/settings",
  getParentRoute: () => AppRoute
});
const AppSalesRoute = Route$c.update({
  id: "/sales",
  path: "/sales",
  getParentRoute: () => AppRoute
});
const AppRolesRoute = Route$b.update({
  id: "/roles",
  path: "/roles",
  getParentRoute: () => AppRoute
});
const AppReportsRoute = Route$a.update({
  id: "/reports",
  path: "/reports",
  getParentRoute: () => AppRoute
});
const AppPurchasesRoute = Route$9.update({
  id: "/purchases",
  path: "/purchases",
  getParentRoute: () => AppRoute
});
const AppProductsRoute = Route$8.update({
  id: "/products",
  path: "/products",
  getParentRoute: () => AppRoute
});
const AppPaymentsRoute = Route$7.update({
  id: "/payments",
  path: "/payments",
  getParentRoute: () => AppRoute
});
const AppNotificationsRoute = Route$6.update({
  id: "/notifications",
  path: "/notifications",
  getParentRoute: () => AppRoute
});
const AppInvoicesRoute = Route$5.update({
  id: "/invoices",
  path: "/invoices",
  getParentRoute: () => AppRoute
});
const AppInventoryRoute = Route$4.update({
  id: "/inventory",
  path: "/inventory",
  getParentRoute: () => AppRoute
});
const AppCustomersRoute = Route$3.update({
  id: "/customers",
  path: "/customers",
  getParentRoute: () => AppRoute
});
const AppCategoriesRoute = Route$2.update({
  id: "/categories",
  path: "/categories",
  getParentRoute: () => AppRoute
});
const AppAssistantRoute = Route$1.update({
  id: "/assistant",
  path: "/assistant",
  getParentRoute: () => AppRoute
});
const AppAiRoute = Route.update({
  id: "/ai",
  path: "/ai",
  getParentRoute: () => AppRoute
});
const AppRouteChildren = {
  AppAiRoute,
  AppAssistantRoute,
  AppCategoriesRoute,
  AppCustomersRoute,
  AppInventoryRoute,
  AppInvoicesRoute,
  AppNotificationsRoute,
  AppPaymentsRoute,
  AppProductsRoute,
  AppPurchasesRoute,
  AppReportsRoute,
  AppRolesRoute,
  AppSalesRoute,
  AppSettingsRoute,
  AppStatisticsRoute,
  AppSuppliersRoute,
  AppUsersRoute,
  AppIndexRoute
};
const AppRouteWithChildren = AppRoute._addFileChildren(AppRouteChildren);
const rootRouteChildren = {
  AppRoute: AppRouteWithChildren,
  LoginRoute,
  ResetPasswordRoute,
  SitemapDotxmlRoute
};
const routeTree = Route$m._addFileChildren(rootRouteChildren)._addFileTypes();
const getRouter = () => {
  const queryClient = new QueryClient();
  const router2 = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0
  });
  return router2;
};
const router = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getRouter
}, Symbol.toStringTag, { value: "Module" }));
export {
  GlobalLoaderSlot as G,
  Route$k as R,
  cn as c,
  router as r,
  useGlobalLoader as u
};
