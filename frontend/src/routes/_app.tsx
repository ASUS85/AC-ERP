import {
  createFileRoute,
  Outlet,
  useRouterState,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SidebarNav } from "@/components/erp/Sidebar";
import { Topbar } from "@/components/erp/Topbar";
import {
  GlobalLoaderSlot,
  useGlobalLoader,
} from "@/components/erp/GlobalLoader";
import { Sheet, SheetContent } from "@/components/ui/sheet";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const { showLoader } = useGlobalLoader();

  useEffect(() => {
    return showLoader({ target: "main", maxDurationMs: 2000 });
  }, [pathname, showLoader]);

  return (
    <div className="min-h-screen w-full bg-background">
      {/* Desktop fixed sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 lg:block">
        <SidebarNav />
      </aside>

      {/* Mobile drawer */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-64 border-0 p-0">
          <SidebarNav onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex min-h-screen flex-col lg:pl-64">
        <Topbar onMenu={() => setOpen(true)} />
        <main className="main-scrollbar relative flex-1 p-4 md:p-6 lg:p-8">
          <Outlet />
          <GlobalLoaderSlot target="main" />
        </main>
      </div>
    </div>
  );
}
