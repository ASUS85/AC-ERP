import { Link, useRouterState } from "@tanstack/react-router";
import { navGroups } from "@/lib/erp-data";
import { cn } from "@/lib/utils";
import logo from "@/assets/erp-logo.png";

type StoredUser = {
  nom?: string;
  prenom?: string;
  email?: string;
  role?: { nomRole?: string } | string | null;
  permissions?: string[];
};

function getStoredUser(): StoredUser | null {
  try {
    if (typeof window === "undefined") return null;
    return JSON.parse(localStorage.getItem("erp_user") || "null");
  } catch {
    return null;
  }
}

function roleName(user: StoredUser | null) {
  if (!user?.role) return "Utilisateur";
  return typeof user.role === "string" ? user.role : user.role.nomRole || "Utilisateur";
}

function initials(user: StoredUser | null) {
  const raw = `${user?.prenom?.[0] || ""}${user?.nom?.[0] || ""}` || user?.email?.slice(0, 2) || "AC";
  return raw.toUpperCase();
}

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const user = getStoredUser();
  const permissions = user?.permissions || [];
  const canSee = (permission?: string) => !permission || permissions.includes(permission);
  const visibleGroups = navGroups
    .map((group) => ({ ...group, items: group.items.filter((item) => canSee(item.permission)) }))
    .filter((group) => group.items.length > 0);

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex h-16 shrink-0 items-center gap-2.5 border-b border-sidebar-border px-5">
        <img src={logo} alt="Logo AC ERP" width={36} height={36} className="h-9 w-9 rounded-lg bg-white/95 p-1" />
        <div className="leading-tight">
          <p className="font-display text-base font-bold text-white">AC ERP</p>
          <p className="text-[10px] uppercase tracking-wider text-sidebar-foreground/60">Gestion intelligente</p>
        </div>
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
        {visibleGroups.map((group) => (
          <div key={group.label}>
            <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">
              {group.label}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = pathname === item.url;
                return (
                  <li key={item.url}>
                    <Link
                      to={item.url}
                      onClick={onNavigate}
                      className={cn(
                        "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                        active
                          ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                          : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      )}
                    >
                      <item.icon className={cn("h-[18px] w-[18px] shrink-0", active ? "" : "text-sidebar-foreground/60 group-hover:text-sidebar-accent-foreground")} />
                      <span className="flex-1 truncate">{item.title}</span>
                      {item.badge && (
                        <span
                          className={cn(
                            "rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                            active ? "bg-white/25 text-white" : "bg-sidebar-accent text-sidebar-accent-foreground",
                          )}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="shrink-0 border-t border-sidebar-border p-3">
        <div className="flex items-center gap-3 rounded-lg bg-sidebar-accent/50 px-3 py-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-primary text-sm font-semibold text-white">
            {initials(user)}
          </div>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-sm font-medium text-white">
              {user ? `${user.prenom || ""} ${user.nom || ""}`.trim() || user.email : "Non connecte"}
            </p>
            <p className="truncate text-xs text-sidebar-foreground/60">{roleName(user)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
