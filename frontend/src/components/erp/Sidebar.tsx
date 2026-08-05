import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { navGroups } from "@/lib/erp-data";
import { cn } from "@/lib/utils";
import logo from "@/assets/erp-logo.png";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  canAccessPermission,
  getRoleName,
  getStoredUser,
  type AuthUserLike,
} from "@/lib/auth-session";

function initials(user: AuthUserLike | null) {
  const raw =
    `${user?.prenom?.[0] || ""}${user?.nom?.[0] || ""}` ||
    user?.email?.slice(0, 2) ||
    "AC";
  return raw.toUpperCase();
}

export function SidebarNav({
  onNavigate,
  collapsed = false,
  onToggleCollapsed,
}: {
  onNavigate?: () => void;
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [user, setUser] = useState<AuthUserLike | null>(() => getStoredUser());

  useEffect(() => {
    const syncUser = () => setUser(getStoredUser());
    syncUser();
    window.addEventListener("auth-change", syncUser);
    window.addEventListener("erp:user-updated", syncUser);
    return () => {
      window.removeEventListener("auth-change", syncUser);
      window.removeEventListener("erp:user-updated", syncUser);
    };
  }, []);

  const canSee = (permission?: string) => {
    if (!permission) return true;
    const [module, action] = permission.split(":");
    return canAccessPermission(user, module, action);
  };

  const visibleGroups = navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => canSee(item.permission)),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
        <div
          className={cn(
            "flex h-16 shrink-0 items-center border-b border-sidebar-border",
            collapsed ? "justify-center px-3" : "gap-2.5 px-5",
          )}
        >
          <img
            src={logo}
            alt="Logo AC ERP"
            width={36}
            height={36}
            className="h-9 w-9 rounded-lg bg-white/95 p-1"
          />
          {!collapsed ? (
            <div className="leading-tight">
              <p className="font-display text-base font-bold text-white">
                AC ERP
              </p>
              <p className="text-[10px] uppercase tracking-wider text-sidebar-foreground/60">
                Gestion intelligente
              </p>
            </div>
          ) : null}
          {onToggleCollapsed ? (
            <button
              type="button"
              onClick={onToggleCollapsed}
              className={cn(
                "ml-auto hidden h-9 w-9 items-center justify-center rounded-xl border border-sidebar-border/50 bg-sidebar-accent/40 text-sidebar-foreground/80 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-sidebar-accent hover:text-white lg:inline-flex",
                collapsed ? "mx-auto ml-0" : "",
              )}
              aria-label={collapsed ? "Déplier le sidebar" : "Plier le sidebar"}
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </button>
          ) : null}
        </div>

        <nav
          className={cn(
            "sidebar-scrollbar flex-1 space-y-5 overflow-y-auto py-4",
            collapsed ? "px-0" : "px-0",
          )}
        >
          {visibleGroups.map((group, groupIndex) => (
            <div key={group.label}>
              {collapsed && groupIndex > 0 ? (
                <div
                  className="flex items-center justify-center py-1 text-[10px] tracking-[0.35em] text-sidebar-foreground/30"
                  aria-hidden="true"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    fill="currentColor"
                    class="bi bi-three-dots"
                    viewBox="0 0 16 16"
                  >
                    <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3" />
                  </svg>
                </div>
              ) : null}
              {!collapsed ? (
                <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">
                  {group.label}
                </p>
              ) : null}
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const active = pathname === item.url;
                  const link = (
                    <Link
                      to={item.url}
                      onClick={onNavigate}
                      className={cn(
                        "group flex items-center py-2 text-sm font-medium transition-all",
                        collapsed ? "justify-center px-2" : "gap-3 px-3",
                        active
                          ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                          : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      )}
                      title={collapsed ? item.title : undefined}
                    >
                      <item.icon
                        className={cn(
                          "h-[18px] w-[18px] shrink-0",
                          active
                            ? ""
                            : "text-sidebar-foreground/60 group-hover:text-sidebar-accent-foreground",
                        )}
                      />
                      {!collapsed ? (
                        <span className="flex-1 truncate">{item.title}</span>
                      ) : null}
                      {item.badge && !collapsed ? (
                        <span
                          className={cn(
                            "rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                            active
                              ? "bg-white/25 text-white"
                              : "bg-sidebar-accent text-sidebar-accent-foreground",
                          )}
                        >
                          {item.badge}
                        </span>
                      ) : null}
                    </Link>
                  );

                  return (
                    <li key={item.url}>
                      {collapsed ? (
                        <Tooltip>
                          <TooltipTrigger asChild>{link}</TooltipTrigger>
                          <TooltipContent
                            side="right"
                            align="center"
                            className="max-w-56 border border-sidebar-border/60 bg-sidebar px-3 py-2 text-sidebar-foreground shadow-xl"
                          >
                            <div className="space-y-0.5">
                              <p className="text-sm font-semibold text-white">
                                {item.title}
                              </p>
                              <p className="text-[11px] uppercase tracking-wider text-sidebar-foreground/60">
                                {group.label}
                              </p>
                              {item.badge ? (
                                <p className="text-[11px] text-sidebar-foreground/50">
                                  Badge: {item.badge}
                                </p>
                              ) : null}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        link
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="shrink-0 border-t border-sidebar-border p-3">
          <div
            className={cn(
              "flex items-center rounded-lg bg-sidebar-accent/50 py-2.5",
              collapsed ? "justify-center px-2" : "gap-3 px-3",
            )}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-primary text-sm font-semibold text-white">
              {initials(user)}
            </div>
            {!collapsed ? (
              <div className="min-w-0 flex-1 leading-tight">
                <p className="truncate text-sm font-medium text-white">
                  {user
                    ? `${user.prenom || ""} ${user.nom || ""}`.trim() ||
                      user.email
                    : "Non connecte"}
                </p>
                <p className="truncate text-xs text-sidebar-foreground/60">
                  {getRoleName(user)}
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
