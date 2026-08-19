import {
  createFileRoute,
  Outlet,
  redirect,
  useRouterState,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SidebarNav } from "@/components/erp/Sidebar";
import { Topbar } from "@/components/erp/Topbar";
import { GlobalLoaderSlot } from "@/components/erp/GlobalLoader";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { AUTH_STORAGE_KEYS, clearAuthSession } from "@/lib/auth-session";
import { setStoredCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth.store";
import { useSettingsStore } from "@/stores/settings.store";

export const Route = createFileRoute("/_app")({
  beforeLoad: async ({ context, location }) => {
    // Ne pas exécuter la logique d'authentification côté serveur
    if (typeof window === "undefined") {
      return {};
    }

    const token = localStorage.getItem(AUTH_STORAGE_KEYS.accessToken);
    if (!token) {
      throw redirect({
        to: "/login",
        search: {
          redirect: location.href,
        },
      });
    }

    try {
      const user = await useAuthStore.getState().fetchProfile();
      return { auth: { user } };
    } catch (error) {
      clearAuthSession();
      throw redirect({ to: "/login" });
    }
  },
  component: AppLayout,
});

function AppLayout() {
  const [open, setOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isClientAuthenticated, setIsClientAuthenticated] = useState(false);
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  useEffect(() => {
    const token = localStorage.getItem(AUTH_STORAGE_KEYS.accessToken);
    if (!token) {
      const destination = `${window.location.pathname}${window.location.search}`;
      window.location.replace(
        `/login?redirect=${encodeURIComponent(destination)}`,
      );
      return;
    }
    setIsClientAuthenticated(true);
  }, []);

  useEffect(() => {
    useSettingsStore
      .getState()
      .fetchEntreprise()
      .then((entreprise) => setStoredCurrency(String(entreprise.devise || "")))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("erp_sidebar_collapsed");
    setSidebarCollapsed(stored === "true");
  }, []);

  const toggleSidebarCollapsed = () => {
    setSidebarCollapsed((current) => {
      const next = !current;
      if (typeof window !== "undefined") {
        window.localStorage.setItem("erp_sidebar_collapsed", String(next));
      }
      return next;
    });
  };

  // SSR cannot inspect localStorage. Keep private UI unrendered until the
  // client has verified the local access token.
  if (!isClientAuthenticated) return null;

  return (
    <div className="min-h-screen w-full bg-background">
      {/* Desktop fixed sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden transition-[width] duration-200 lg:block",
          sidebarCollapsed ? "w-20" : "w-50",
        )}
      >
        <SidebarNav
          collapsed={sidebarCollapsed}
          onToggleCollapsed={toggleSidebarCollapsed}
        />
      </aside>

      {/* Mobile drawer */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-64 border-0 p-0">
          <SidebarNav onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>

      <div
        className={cn(
          "flex min-h-screen flex-col transition-[padding-left] duration-200",
          sidebarCollapsed ? "lg:pl-20" : "lg:pl-50",
        )}
      >
        <Topbar onMenu={() => setOpen(true)} />
        <main className="main-scrollbar relative flex-1 p-4 md:p-6 lg:p-8">
          <Outlet />
          <GlobalLoaderSlot target="main" />
        </main>
      </div>
    </div>
  );
}
