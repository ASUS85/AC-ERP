import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useRouterState, Link, useNavigate, Outlet } from "@tanstack/react-router";
import * as React from "react";
import { useState, useEffect, useCallback, useMemo } from "react";
import { n as navGroups } from "./erp-data-C8LoOZfP.js";
import { g as getStoredUser, c as cn, e as getRoleName$1, d as canAccessPermission, h as logout, u as useGlobalLoader, G as GlobalLoaderSlot } from "./router-soiu03Zn.js";
import { l as logo } from "./erp-logo-C4ESMtut.js";
import { Menu, Search, Bell, Settings, ChevronDown, LogOut, X } from "lucide-react";
import { b as buttonVariants, B as Button, I as Input } from "./input-DgNX5wjv.js";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import { D as DropdownMenu, a as DropdownMenuTrigger, b as DropdownMenuContent, c as DropdownMenuLabel, d as DropdownMenuSeparator, e as DropdownMenuItem } from "./dropdown-menu-BYb2pE4C.js";
import { A as Avatar, a as AvatarImage, r as resolveAvatarUrl, b as AvatarFallback, g as getEntreprise } from "./parametres.service-BzdHjQZ5.js";
import { io } from "socket.io-client";
import { g as getNotifications, m as marquerLue } from "./notifications.service-BjPtqQAK.js";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { cva } from "class-variance-authority";
import { s as setStoredCurrency } from "./currency-BGNe4_9Y.js";
import "@tanstack/react-query";
import "clsx";
import "tailwind-merge";
import "sonner";
import "zod";
import "axios";
import "@radix-ui/react-slot";
import "@radix-ui/react-dropdown-menu";
import "@radix-ui/react-avatar";
function initials(user) {
  const raw = `${user?.prenom?.[0] || ""}${user?.nom?.[0] || ""}` || user?.email?.slice(0, 2) || "AC";
  return raw.toUpperCase();
}
function SidebarNav({ onNavigate }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [user, setUser] = useState(() => getStoredUser());
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
  const canSee = (permission) => {
    if (!permission) return true;
    const [module, action] = permission.split(":");
    return canAccessPermission(user, module, action);
  };
  const visibleGroups = navGroups.map((group) => ({
    ...group,
    items: group.items.filter((item) => canSee(item.permission))
  })).filter((group) => group.items.length > 0);
  return /* @__PURE__ */ jsxs("div", { className: "flex h-full flex-col bg-sidebar text-sidebar-foreground", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex h-16 shrink-0 items-center gap-2.5 border-b border-sidebar-border px-5", children: [
      /* @__PURE__ */ jsx(
        "img",
        {
          src: logo,
          alt: "Logo AC ERP",
          width: 36,
          height: 36,
          className: "h-9 w-9 rounded-lg bg-white/95 p-1"
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "leading-tight", children: [
        /* @__PURE__ */ jsx("p", { className: "font-display text-base font-bold text-white", children: "AC ERP" }),
        /* @__PURE__ */ jsx("p", { className: "text-[10px] uppercase tracking-wider text-sidebar-foreground/60", children: "Gestion intelligente" })
      ] })
    ] }),
    /* @__PURE__ */ jsx("nav", { className: "sidebar-scrollbar flex-1 space-y-5 overflow-y-auto px-3 py-4", children: visibleGroups.map((group) => /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("p", { className: "px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/40", children: group.label }),
      /* @__PURE__ */ jsx("ul", { className: "space-y-0.5", children: group.items.map((item) => {
        const active = pathname === item.url;
        return /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs(
          Link,
          {
            to: item.url,
            onClick: onNavigate,
            className: cn(
              "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
              active ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm" : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            ),
            children: [
              /* @__PURE__ */ jsx(
                item.icon,
                {
                  className: cn(
                    "h-[18px] w-[18px] shrink-0",
                    active ? "" : "text-sidebar-foreground/60 group-hover:text-sidebar-accent-foreground"
                  )
                }
              ),
              /* @__PURE__ */ jsx("span", { className: "flex-1 truncate", children: item.title }),
              item.badge && /* @__PURE__ */ jsx(
                "span",
                {
                  className: cn(
                    "rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                    active ? "bg-white/25 text-white" : "bg-sidebar-accent text-sidebar-accent-foreground"
                  ),
                  children: item.badge
                }
              )
            ]
          }
        ) }, item.url);
      }) })
    ] }, group.label)) }),
    /* @__PURE__ */ jsx("div", { className: "shrink-0 border-t border-sidebar-border p-3", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 rounded-lg bg-sidebar-accent/50 px-3 py-2.5", children: [
      /* @__PURE__ */ jsx("div", { className: "flex h-9 w-9 items-center justify-center rounded-full bg-gradient-primary text-sm font-semibold text-white", children: initials(user) }),
      /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1 leading-tight", children: [
        /* @__PURE__ */ jsx("p", { className: "truncate text-sm font-medium text-white", children: user ? `${user.prenom || ""} ${user.nom || ""}`.trim() || user.email : "Non connecte" }),
        /* @__PURE__ */ jsx("p", { className: "truncate text-xs text-sidebar-foreground/60", children: getRoleName$1(user) })
      ] })
    ] }) })
  ] });
}
const AlertDialog = AlertDialogPrimitive.Root;
const AlertDialogPortal = AlertDialogPrimitive.Portal;
const AlertDialogOverlay = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  AlertDialogPrimitive.Overlay,
  {
    className: cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    ),
    ...props,
    ref
  }
));
AlertDialogOverlay.displayName = AlertDialogPrimitive.Overlay.displayName;
const AlertDialogContent = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxs(AlertDialogPortal, { children: [
  /* @__PURE__ */ jsx(AlertDialogOverlay, {}),
  /* @__PURE__ */ jsx(
    AlertDialogPrimitive.Content,
    {
      ref,
      className: cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg",
        className
      ),
      ...props
    }
  )
] }));
AlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName;
const AlertDialogHeader = ({
  className,
  ...props
}) => /* @__PURE__ */ jsx(
  "div",
  {
    className: cn(
      "flex flex-col space-y-2 text-center sm:text-left",
      className
    ),
    ...props
  }
);
AlertDialogHeader.displayName = "AlertDialogHeader";
const AlertDialogFooter = ({
  className,
  ...props
}) => /* @__PURE__ */ jsx(
  "div",
  {
    className: cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    ),
    ...props
  }
);
AlertDialogFooter.displayName = "AlertDialogFooter";
const AlertDialogTitle = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  AlertDialogPrimitive.Title,
  {
    ref,
    className: cn("text-lg font-semibold", className),
    ...props
  }
));
AlertDialogTitle.displayName = AlertDialogPrimitive.Title.displayName;
const AlertDialogDescription = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  AlertDialogPrimitive.Description,
  {
    ref,
    className: cn("text-sm text-muted-foreground", className),
    ...props
  }
));
AlertDialogDescription.displayName = AlertDialogPrimitive.Description.displayName;
const AlertDialogAction = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  AlertDialogPrimitive.Action,
  {
    ref,
    className: cn(buttonVariants(), className),
    ...props
  }
));
AlertDialogAction.displayName = AlertDialogPrimitive.Action.displayName;
const AlertDialogCancel = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  AlertDialogPrimitive.Cancel,
  {
    ref,
    className: cn(
      buttonVariants({ variant: "outline" }),
      "mt-2 sm:mt-0",
      className
    ),
    ...props
  }
));
AlertDialogCancel.displayName = AlertDialogPrimitive.Cancel.displayName;
function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  useEffect(() => {
    let socket = null;
    let mounted = true;
    getNotifications().then((response) => {
      if (mounted) setNotifications(response.data || []);
    }).catch(() => {
    });
    const token = localStorage.getItem("erp_access_token");
    const user = JSON.parse(localStorage.getItem("erp_user") || "null");
    socket = io(
      "http://localhost:3000/api/v1".replace(
        "/api/v1",
        ""
      ),
      {
        auth: { token, userId: user?.id }
      }
    );
    socket.on("notification", (notification) => {
      setNotifications((current) => [notification, ...current]);
    });
    return () => {
      mounted = false;
      socket?.disconnect();
    };
  }, []);
  const markAsRead = useCallback(async (id) => {
    await marquerLue(id);
    setNotifications(
      (items) => items.map((item) => item.id === id ? { ...item, isLue: true } : item)
    );
  }, []);
  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.isLue).length,
    [notifications]
  );
  return { notifications, unreadCount, markAsRead };
}
function readStoredUser() {
  try {
    if (typeof window === "undefined") return null;
    return JSON.parse(localStorage.getItem("erp_user") || "null");
  } catch {
    return null;
  }
}
function getDisplayName(user) {
  const fullName = `${user?.prenom || ""} ${user?.nom || ""}`.trim();
  return fullName || user?.email || "Utilisateur";
}
function getInitials(user) {
  const initials2 = `${user?.prenom?.[0] || ""}${user?.nom?.[0] || ""}`;
  return (initials2 || user?.email?.slice(0, 2) || "AC").toUpperCase();
}
function getRoleName(user) {
  if (!user?.role) return "Non connecté";
  return typeof user.role === "string" ? user.role : user.role.nomRole || "Utilisateur";
}
function Topbar({ onMenu }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const { notifications, unreadCount } = useNotifications();
  useEffect(() => {
    setUser(readStoredUser());
    const syncUser = (event) => {
      const updatedUser = event instanceof CustomEvent ? event.detail : null;
      setUser(updatedUser ?? readStoredUser());
    };
    window.addEventListener("erp:user-updated", syncUser);
    window.addEventListener("storage", syncUser);
    return () => {
      window.removeEventListener("erp:user-updated", syncUser);
      window.removeEventListener("storage", syncUser);
    };
  }, []);
  const canOpenSettings = user?.permissions?.includes("users:modifier") ?? false;
  const visibleNotifications = useMemo(
    () => notifications.slice(0, 4),
    [notifications]
  );
  const menuResults = useMemo(() => {
    const permissions = user?.permissions || [];
    const canSee = (permission) => !permission || permissions.includes(permission);
    const normalize = (value) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    const query = normalize(searchQuery.trim());
    return navGroups.flatMap(
      (group) => group.items.filter((item) => canSee(item.permission)).map((item) => ({ ...item, group: group.label }))
    ).filter((item) => {
      if (!query) return true;
      return normalize(item.title).includes(query) || normalize(item.group).includes(query);
    }).slice(0, 8);
  }, [searchQuery, user?.permissions]);
  const showMenuResults = searchFocused && searchQuery.trim().length > 0;
  const goToMenu = (url) => {
    setSearchQuery("");
    setSearchFocused(false);
    navigate({ to: url });
  };
  const handleLogout = async () => {
    await logout();
    navigate({ to: "/login" });
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("header", { className: "sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-border bg-card/80 px-4 backdrop-blur-md md:px-6", children: [
      /* @__PURE__ */ jsx(
        Button,
        {
          variant: "ghost",
          size: "icon",
          className: "lg:hidden",
          onClick: onMenu,
          "aria-label": "Menu",
          children: /* @__PURE__ */ jsx(Menu, { className: "h-5 w-5" })
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "relative hidden max-w-md flex-1 md:block", children: [
        /* @__PURE__ */ jsx(Search, { className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }),
        /* @__PURE__ */ jsx(
          Input,
          {
            placeholder: "Rechercher un menu…",
            className: "h-9 bg-secondary/60 pl-9",
            value: searchQuery,
            onChange: (event) => setSearchQuery(event.target.value),
            onFocus: () => setSearchFocused(true),
            onBlur: () => setSearchFocused(false),
            onKeyDown: (event) => {
              if (event.key === "Enter" && menuResults[0]) {
                event.preventDefault();
                goToMenu(menuResults[0].url);
              }
              if (event.key === "Escape") {
                setSearchQuery("");
                setSearchFocused(false);
              }
            }
          }
        ),
        showMenuResults && /* @__PURE__ */ jsx("div", { className: "absolute left-0 right-0 top-11 z-50 overflow-hidden rounded-lg border border-border bg-popover shadow-pop", children: menuResults.length > 0 ? /* @__PURE__ */ jsx("div", { className: "py-1", children: menuResults.map((item) => /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            className: cn(
              "flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors",
              "hover:bg-secondary focus:bg-secondary focus:outline-none"
            ),
            onMouseDown: (event) => {
              event.preventDefault();
              goToMenu(item.url);
            },
            children: [
              /* @__PURE__ */ jsx(item.icon, { className: "h-4 w-4 shrink-0 text-muted-foreground" }),
              /* @__PURE__ */ jsxs("span", { className: "min-w-0 flex-1", children: [
                /* @__PURE__ */ jsx("span", { className: "block truncate font-medium text-foreground", children: item.title }),
                /* @__PURE__ */ jsx("span", { className: "block truncate text-xs text-muted-foreground", children: item.group })
              ] })
            ]
          },
          item.url
        )) }) : /* @__PURE__ */ jsx("div", { className: "px-3 py-3 text-sm text-muted-foreground", children: "Aucun menu trouvé" }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "ml-auto flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsxs(DropdownMenu, { children: [
          /* @__PURE__ */ jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(
            Button,
            {
              variant: "ghost",
              size: "icon",
              className: "relative",
              "aria-label": "Notifications",
              children: [
                /* @__PURE__ */ jsx(Bell, { className: "h-5 w-5" }),
                unreadCount > 0 && /* @__PURE__ */ jsx("span", { className: "absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground", children: unreadCount })
              ]
            }
          ) }),
          /* @__PURE__ */ jsxs(DropdownMenuContent, { align: "end", className: "w-80", children: [
            /* @__PURE__ */ jsxs(DropdownMenuLabel, { className: "flex items-center justify-between", children: [
              "Notifications",
              /* @__PURE__ */ jsxs("span", { className: "text-xs font-normal text-muted-foreground", children: [
                unreadCount,
                " non lues"
              ] })
            ] }),
            /* @__PURE__ */ jsx(DropdownMenuSeparator, {}),
            visibleNotifications.length > 0 ? visibleNotifications.map((notification) => /* @__PURE__ */ jsxs(
              DropdownMenuItem,
              {
                className: "flex flex-col items-start gap-0.5 py-2",
                children: [
                  /* @__PURE__ */ jsx("span", { className: "text-sm font-medium", children: notification.titre }),
                  /* @__PURE__ */ jsx("span", { className: "line-clamp-2 text-xs text-muted-foreground", children: notification.message }),
                  /* @__PURE__ */ jsx("span", { className: "text-[10px] text-muted-foreground/70", children: new Date(notification.createdAt).toLocaleString("fr-FR") })
                ]
              },
              notification.id
            )) : /* @__PURE__ */ jsx(
              DropdownMenuItem,
              {
                disabled: true,
                className: "py-3 text-xs text-muted-foreground",
                children: "Aucune notification"
              }
            ),
            /* @__PURE__ */ jsx(DropdownMenuSeparator, {}),
            /* @__PURE__ */ jsx(DropdownMenuItem, { asChild: true, children: /* @__PURE__ */ jsx(
              Link,
              {
                to: "/notifications",
                className: "justify-center text-sm font-medium text-primary",
                children: "Voir toutes les notifications"
              }
            ) })
          ] })
        ] }),
        canOpenSettings && /* @__PURE__ */ jsx(Button, { asChild: true, variant: "ghost", size: "icon", "aria-label": "Paramètres", children: /* @__PURE__ */ jsx(Link, { to: "/settings", children: /* @__PURE__ */ jsx(Settings, { className: "h-5 w-5" }) }) }),
        /* @__PURE__ */ jsxs(DropdownMenu, { children: [
          /* @__PURE__ */ jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(Button, { variant: "ghost", className: "gap-2 pl-1.5 pr-2", children: [
            /* @__PURE__ */ jsxs(Avatar, { className: "h-9 w-8", children: [
              /* @__PURE__ */ jsx(
                AvatarImage,
                {
                  src: resolveAvatarUrl(user?.avatar),
                  alt: getDisplayName(user)
                }
              ),
              /* @__PURE__ */ jsx(AvatarFallback, { className: "bg-gradient-primary text-xs font-semibold text-white", children: getInitials(user) })
            ] }),
            /* @__PURE__ */ jsxs("span", { className: "hidden text-left leading-tight sm:block", children: [
              /* @__PURE__ */ jsx("span", { className: "block max-w-36 truncate text-sm font-medium", children: getDisplayName(user) }),
              /* @__PURE__ */ jsx("span", { className: "block max-w-36 truncate text-[11px] text-muted-foreground", children: getRoleName(user) })
            ] }),
            /* @__PURE__ */ jsx(ChevronDown, { className: "hidden h-4 w-4 text-muted-foreground sm:block" })
          ] }) }),
          /* @__PURE__ */ jsxs(DropdownMenuContent, { align: "end", className: "w-56", children: [
            /* @__PURE__ */ jsxs(DropdownMenuLabel, { children: [
              /* @__PURE__ */ jsx("span", { className: "block truncate", children: "Mon compte" }),
              user?.email && /* @__PURE__ */ jsx("span", { className: "block truncate text-xs font-normal text-muted-foreground", children: user.email })
            ] }),
            /* @__PURE__ */ jsx(DropdownMenuSeparator, {}),
            /* @__PURE__ */ jsx(DropdownMenuItem, { asChild: true, children: /* @__PURE__ */ jsx(Link, { to: "/settings", children: "Profil" }) }),
            /* @__PURE__ */ jsx(DropdownMenuSeparator, {}),
            /* @__PURE__ */ jsxs(
              DropdownMenuItem,
              {
                className: "text-destructive focus:text-destructive",
                onSelect: (event) => {
                  event.preventDefault();
                  setConfirmLogoutOpen(true);
                },
                children: [
                  /* @__PURE__ */ jsx(LogOut, { className: "h-4 w-4" }),
                  " Se déconnecter"
                ]
              }
            )
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx(AlertDialog, { open: confirmLogoutOpen, onOpenChange: setConfirmLogoutOpen, children: /* @__PURE__ */ jsxs(AlertDialogContent, { children: [
      /* @__PURE__ */ jsxs(AlertDialogHeader, { children: [
        /* @__PURE__ */ jsx(AlertDialogTitle, { children: "Confirmer la déconnexion" }),
        /* @__PURE__ */ jsx(AlertDialogDescription, { children: "Votre session actuelle sera fermée et vous devrez vous reconnecter pour accéder à AC ERP." })
      ] }),
      /* @__PURE__ */ jsxs(AlertDialogFooter, { children: [
        /* @__PURE__ */ jsx(AlertDialogCancel, { children: "Annuler" }),
        /* @__PURE__ */ jsx(
          AlertDialogAction,
          {
            onClick: handleLogout,
            className: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
            children: "Se déconnecter"
          }
        )
      ] })
    ] }) })
  ] });
}
const Sheet = SheetPrimitive.Root;
const SheetPortal = SheetPrimitive.Portal;
const SheetOverlay = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  SheetPrimitive.Overlay,
  {
    className: cn(
      "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    ),
    ...props,
    ref
  }
));
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName;
const sheetVariants = cva(
  "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500 data-[state=open]:animate-in data-[state=closed]:animate-out",
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
        bottom: "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
        left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
        right: "inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm"
      }
    },
    defaultVariants: {
      side: "right"
    }
  }
);
const SheetContent = React.forwardRef(({ side = "right", className, children, ...props }, ref) => /* @__PURE__ */ jsxs(SheetPortal, { children: [
  /* @__PURE__ */ jsx(SheetOverlay, {}),
  /* @__PURE__ */ jsxs(
    SheetPrimitive.Content,
    {
      ref,
      className: cn(sheetVariants({ side }), className),
      ...props,
      children: [
        /* @__PURE__ */ jsxs(SheetPrimitive.Close, { className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background cursor-pointer transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary", children: [
          /* @__PURE__ */ jsx(X, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsx("span", { className: "sr-only", children: "Close" })
        ] }),
        children
      ]
    }
  )
] }));
SheetContent.displayName = SheetPrimitive.Content.displayName;
const SheetTitle = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  SheetPrimitive.Title,
  {
    ref,
    className: cn("text-lg font-semibold text-foreground", className),
    ...props
  }
));
SheetTitle.displayName = SheetPrimitive.Title.displayName;
const SheetDescription = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  SheetPrimitive.Description,
  {
    ref,
    className: cn("text-sm text-muted-foreground", className),
    ...props
  }
));
SheetDescription.displayName = SheetPrimitive.Description.displayName;
function AppLayout() {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({
    select: (state) => state.location.pathname
  });
  const {
    showLoader
  } = useGlobalLoader();
  useEffect(() => {
    return showLoader({
      target: "main",
      maxDurationMs: 2e3
    });
  }, [pathname, showLoader]);
  useEffect(() => {
    getEntreprise().then((response) => setStoredCurrency(response?.data?.devise)).catch(() => void 0);
  }, []);
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen w-full bg-background", children: [
    /* @__PURE__ */ jsx("aside", { className: "fixed inset-y-0 left-0 z-40 hidden w-64 lg:block", children: /* @__PURE__ */ jsx(SidebarNav, {}) }),
    /* @__PURE__ */ jsx(Sheet, { open, onOpenChange: setOpen, children: /* @__PURE__ */ jsx(SheetContent, { side: "left", className: "w-64 border-0 p-0", children: /* @__PURE__ */ jsx(SidebarNav, { onNavigate: () => setOpen(false) }) }) }),
    /* @__PURE__ */ jsxs("div", { className: "flex min-h-screen flex-col lg:pl-64", children: [
      /* @__PURE__ */ jsx(Topbar, { onMenu: () => setOpen(true) }),
      /* @__PURE__ */ jsxs("main", { className: "main-scrollbar relative flex-1 p-4 md:p-6 lg:p-8", children: [
        /* @__PURE__ */ jsx(Outlet, {}),
        /* @__PURE__ */ jsx(GlobalLoaderSlot, { target: "main" })
      ] })
    ] })
  ] });
}
export {
  AppLayout as component
};
