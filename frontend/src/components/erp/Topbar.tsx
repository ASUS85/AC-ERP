import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Bell, Menu, Search, Settings, LogOut, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logout } from "@/lib/api/auth.service";
import { useNotifications } from "@/hooks/useNotifications";

type StoredUser = {
  nom?: string;
  prenom?: string;
  email?: string;
  role?: { nomRole?: string } | string | null;
  permissions?: string[];
};

function readStoredUser(): StoredUser | null {
  try {
    if (typeof window === "undefined") return null;
    return JSON.parse(localStorage.getItem("erp_user") || "null");
  } catch {
    return null;
  }
}

function getDisplayName(user: StoredUser | null) {
  const fullName = `${user?.prenom || ""} ${user?.nom || ""}`.trim();
  return fullName || user?.email || "Utilisateur";
}

function getInitials(user: StoredUser | null) {
  const initials = `${user?.prenom?.[0] || ""}${user?.nom?.[0] || ""}`;
  return (initials || user?.email?.slice(0, 2) || "AC").toUpperCase();
}

function getRoleName(user: StoredUser | null) {
  if (!user?.role) return "Non connecté";
  return typeof user.role === "string" ? user.role : user.role.nomRole || "Utilisateur";
}

export function Topbar({ onMenu }: { onMenu: () => void }) {
  const navigate = useNavigate();
  const [user, setUser] = useState<StoredUser | null>(null);
  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);
  const { notifications, unreadCount } = useNotifications();

  useEffect(() => {
    setUser(readStoredUser());
  }, []);

  const canOpenSettings = user?.permissions?.includes("users:modifier") ?? false;
  const visibleNotifications = useMemo(() => notifications.slice(0, 4), [notifications]);

  const handleLogout = async () => {
    await logout();
    navigate({ to: "/login" });
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-border bg-card/80 px-4 backdrop-blur-md md:px-6">
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenu} aria-label="Menu">
          <Menu className="h-5 w-5" />
        </Button>

        <div className="relative hidden max-w-md flex-1 md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Rechercher produits, clients, factures…" className="h-9 bg-secondary/60 pl-9" />
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
                    {unreadCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel className="flex items-center justify-between">
                Notifications
                <span className="text-xs font-normal text-muted-foreground">{unreadCount} non lues</span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {visibleNotifications.length > 0 ? (
                visibleNotifications.map((notification) => (
                  <DropdownMenuItem key={notification.id} className="flex flex-col items-start gap-0.5 py-2">
                    <span className="text-sm font-medium">{notification.titre}</span>
                    <span className="line-clamp-2 text-xs text-muted-foreground">{notification.message}</span>
                    <span className="text-[10px] text-muted-foreground/70">
                      {new Date(notification.createdAt).toLocaleString("fr-FR")}
                    </span>
                  </DropdownMenuItem>
                ))
              ) : (
                <DropdownMenuItem disabled className="py-3 text-xs text-muted-foreground">
                  Aucune notification
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/notifications" className="justify-center text-sm font-medium text-primary">
                  Voir toutes les notifications
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {canOpenSettings && (
            <Button asChild variant="ghost" size="icon" aria-label="Paramètres">
              <Link to="/settings">
                <Settings className="h-5 w-5" />
              </Link>
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 pl-1.5 pr-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-primary text-xs font-semibold text-white">
                  {getInitials(user)}
                </span>
                <span className="hidden text-left leading-tight sm:block">
                  <span className="block max-w-36 truncate text-sm font-medium">{getDisplayName(user)}</span>
                  <span className="block max-w-36 truncate text-[11px] text-muted-foreground">{getRoleName(user)}</span>
                </span>
                <ChevronDown className="hidden h-4 w-4 text-muted-foreground sm:block" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <span className="block truncate">Mon compte</span>
                {user?.email && <span className="block truncate text-xs font-normal text-muted-foreground">{user.email}</span>}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {canOpenSettings && (
                <DropdownMenuItem asChild>
                  <Link to="/settings">Profil & paramètres</Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onSelect={(event) => {
                  event.preventDefault();
                  setConfirmLogoutOpen(true);
                }}
              >
                <LogOut className="h-4 w-4" /> Se déconnecter
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <AlertDialog open={confirmLogoutOpen} onOpenChange={setConfirmLogoutOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la déconnexion</AlertDialogTitle>
            <AlertDialogDescription>
              Votre session actuelle sera fermée et vous devrez vous reconnecter pour accéder à AC ERP.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Se déconnecter
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
