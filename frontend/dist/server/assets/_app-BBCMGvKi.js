import { jsxs, jsx } from "react/jsx-runtime";
import { useRouterState, Link, Outlet } from "@tanstack/react-router";
import * as React from "react";
import { useState } from "react";
import { n as navGroups, a as notifications } from "./erp-data-CgsBYils.js";
import { c as cn, B as Button, I as Input } from "./input-BiB-PFhx.js";
import { l as logo } from "./erp-logo-C4ESMtut.js";
import { ChevronRight, Check, Circle, Menu, Search, Bell, Settings, ChevronDown, LogOut, X } from "lucide-react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { cva } from "class-variance-authority";
import "@radix-ui/react-slot";
import "clsx";
import "tailwind-merge";
function SidebarNav({ onNavigate }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return /* @__PURE__ */ jsxs("div", { className: "flex h-full flex-col bg-sidebar text-sidebar-foreground", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex h-16 shrink-0 items-center gap-2.5 border-b border-sidebar-border px-5", children: [
      /* @__PURE__ */ jsx("img", { src: logo, alt: "Logo AC ERP", width: 36, height: 36, className: "h-9 w-9 rounded-lg bg-white/95 p-1" }),
      /* @__PURE__ */ jsxs("div", { className: "leading-tight", children: [
        /* @__PURE__ */ jsx("p", { className: "font-display text-base font-bold text-white", children: "AC ERP" }),
        /* @__PURE__ */ jsx("p", { className: "text-[10px] uppercase tracking-wider text-sidebar-foreground/60", children: "Gestion intelligente" })
      ] })
    ] }),
    /* @__PURE__ */ jsx("nav", { className: "flex-1 space-y-5 overflow-y-auto px-3 py-4", children: navGroups.map((group) => /* @__PURE__ */ jsxs("div", { children: [
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
              /* @__PURE__ */ jsx(item.icon, { className: cn("h-[18px] w-[18px] shrink-0", active ? "" : "text-sidebar-foreground/60 group-hover:text-sidebar-accent-foreground") }),
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
      /* @__PURE__ */ jsx("div", { className: "flex h-9 w-9 items-center justify-center rounded-full bg-gradient-primary text-sm font-semibold text-white", children: "SM" }),
      /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1 leading-tight", children: [
        /* @__PURE__ */ jsx("p", { className: "truncate text-sm font-medium text-white", children: "Sophie Martin" }),
        /* @__PURE__ */ jsx("p", { className: "truncate text-xs text-sidebar-foreground/60", children: "Administrateur" })
      ] })
    ] }) })
  ] });
}
const DropdownMenu = DropdownMenuPrimitive.Root;
const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
const DropdownMenuSubTrigger = React.forwardRef(({ className, inset, children, ...props }, ref) => /* @__PURE__ */ jsxs(
  DropdownMenuPrimitive.SubTrigger,
  {
    ref,
    className: cn(
      "flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent data-[state=open]:bg-accent [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
      inset && "pl-8",
      className
    ),
    ...props,
    children: [
      children,
      /* @__PURE__ */ jsx(ChevronRight, { className: "ml-auto" })
    ]
  }
));
DropdownMenuSubTrigger.displayName = DropdownMenuPrimitive.SubTrigger.displayName;
const DropdownMenuSubContent = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  DropdownMenuPrimitive.SubContent,
  {
    ref,
    className: cn(
      "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-dropdown-menu-content-transform-origin)",
      className
    ),
    ...props
  }
));
DropdownMenuSubContent.displayName = DropdownMenuPrimitive.SubContent.displayName;
const DropdownMenuContent = React.forwardRef(({ className, sideOffset = 4, ...props }, ref) => /* @__PURE__ */ jsx(DropdownMenuPrimitive.Portal, { children: /* @__PURE__ */ jsx(
  DropdownMenuPrimitive.Content,
  {
    ref,
    sideOffset,
    className: cn(
      "z-50 max-h-[var(--radix-dropdown-menu-content-available-height)] min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
      "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-dropdown-menu-content-transform-origin)",
      className
    ),
    ...props
  }
) }));
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName;
const DropdownMenuItem = React.forwardRef(({ className, inset, ...props }, ref) => /* @__PURE__ */ jsx(
  DropdownMenuPrimitive.Item,
  {
    ref,
    className: cn(
      "relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0",
      inset && "pl-8",
      className
    ),
    ...props
  }
));
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName;
const DropdownMenuCheckboxItem = React.forwardRef(({ className, children, checked, ...props }, ref) => /* @__PURE__ */ jsxs(
  DropdownMenuPrimitive.CheckboxItem,
  {
    ref,
    className: cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    ),
    checked,
    ...props,
    children: [
      /* @__PURE__ */ jsx("span", { className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center", children: /* @__PURE__ */ jsx(DropdownMenuPrimitive.ItemIndicator, { children: /* @__PURE__ */ jsx(Check, { className: "h-4 w-4" }) }) }),
      children
    ]
  }
));
DropdownMenuCheckboxItem.displayName = DropdownMenuPrimitive.CheckboxItem.displayName;
const DropdownMenuRadioItem = React.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxs(
  DropdownMenuPrimitive.RadioItem,
  {
    ref,
    className: cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    ),
    ...props,
    children: [
      /* @__PURE__ */ jsx("span", { className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center", children: /* @__PURE__ */ jsx(DropdownMenuPrimitive.ItemIndicator, { children: /* @__PURE__ */ jsx(Circle, { className: "h-2 w-2 fill-current" }) }) }),
      children
    ]
  }
));
DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName;
const DropdownMenuLabel = React.forwardRef(({ className, inset, ...props }, ref) => /* @__PURE__ */ jsx(
  DropdownMenuPrimitive.Label,
  {
    ref,
    className: cn("px-2 py-1.5 text-sm font-semibold", inset && "pl-8", className),
    ...props
  }
));
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName;
const DropdownMenuSeparator = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  DropdownMenuPrimitive.Separator,
  {
    ref,
    className: cn("-mx-1 my-1 h-px bg-muted", className),
    ...props
  }
));
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName;
function Topbar({ onMenu }) {
  const unread = notifications.filter((n) => !n.lu).length;
  return /* @__PURE__ */ jsxs("header", { className: "sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-border bg-card/80 px-4 backdrop-blur-md md:px-6", children: [
    /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "icon", className: "lg:hidden", onClick: onMenu, "aria-label": "Menu", children: /* @__PURE__ */ jsx(Menu, { className: "h-5 w-5" }) }),
    /* @__PURE__ */ jsxs("div", { className: "relative hidden max-w-md flex-1 md:block", children: [
      /* @__PURE__ */ jsx(Search, { className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }),
      /* @__PURE__ */ jsx(Input, { placeholder: "Rechercher produits, clients, factures…", className: "h-9 bg-secondary/60 pl-9" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "ml-auto flex items-center gap-1.5", children: [
      /* @__PURE__ */ jsxs(DropdownMenu, { children: [
        /* @__PURE__ */ jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(Button, { variant: "ghost", size: "icon", className: "relative", "aria-label": "Notifications", children: [
          /* @__PURE__ */ jsx(Bell, { className: "h-5 w-5" }),
          unread > 0 && /* @__PURE__ */ jsx("span", { className: "absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground", children: unread })
        ] }) }),
        /* @__PURE__ */ jsxs(DropdownMenuContent, { align: "end", className: "w-80", children: [
          /* @__PURE__ */ jsxs(DropdownMenuLabel, { className: "flex items-center justify-between", children: [
            "Notifications",
            /* @__PURE__ */ jsxs("span", { className: "text-xs font-normal text-muted-foreground", children: [
              unread,
              " non lues"
            ] })
          ] }),
          /* @__PURE__ */ jsx(DropdownMenuSeparator, {}),
          notifications.slice(0, 4).map((n) => /* @__PURE__ */ jsxs(DropdownMenuItem, { className: "flex flex-col items-start gap-0.5 py-2", children: [
            /* @__PURE__ */ jsx("span", { className: "text-sm font-medium", children: n.titre }),
            /* @__PURE__ */ jsx("span", { className: "line-clamp-2 text-xs text-muted-foreground", children: n.texte }),
            /* @__PURE__ */ jsx("span", { className: "text-[10px] text-muted-foreground/70", children: n.temps })
          ] }, n.titre)),
          /* @__PURE__ */ jsx(DropdownMenuSeparator, {}),
          /* @__PURE__ */ jsx(DropdownMenuItem, { asChild: true, children: /* @__PURE__ */ jsx(Link, { to: "/notifications", className: "justify-center text-sm font-medium text-primary", children: "Voir toutes les notifications" }) })
        ] })
      ] }),
      /* @__PURE__ */ jsx(Button, { asChild: true, variant: "ghost", size: "icon", "aria-label": "Paramètres", children: /* @__PURE__ */ jsx(Link, { to: "/settings", children: /* @__PURE__ */ jsx(Settings, { className: "h-5 w-5" }) }) }),
      /* @__PURE__ */ jsxs(DropdownMenu, { children: [
        /* @__PURE__ */ jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(Button, { variant: "ghost", className: "gap-2 pl-1.5 pr-2", children: [
          /* @__PURE__ */ jsx("span", { className: "flex h-8 w-8 items-center justify-center rounded-full bg-gradient-primary text-xs font-semibold text-white", children: "SM" }),
          /* @__PURE__ */ jsxs("span", { className: "hidden text-left leading-tight sm:block", children: [
            /* @__PURE__ */ jsx("span", { className: "block text-sm font-medium", children: "Sophie Martin" }),
            /* @__PURE__ */ jsx("span", { className: "block text-[11px] text-muted-foreground", children: "Administrateur" })
          ] }),
          /* @__PURE__ */ jsx(ChevronDown, { className: "hidden h-4 w-4 text-muted-foreground sm:block" })
        ] }) }),
        /* @__PURE__ */ jsxs(DropdownMenuContent, { align: "end", className: "w-52", children: [
          /* @__PURE__ */ jsx(DropdownMenuLabel, { children: "Mon compte" }),
          /* @__PURE__ */ jsx(DropdownMenuSeparator, {}),
          /* @__PURE__ */ jsx(DropdownMenuItem, { asChild: true, children: /* @__PURE__ */ jsx(Link, { to: "/settings", children: "Profil & paramètres" }) }),
          /* @__PURE__ */ jsx(DropdownMenuSeparator, {}),
          /* @__PURE__ */ jsx(DropdownMenuItem, { asChild: true, className: "text-destructive focus:text-destructive", children: /* @__PURE__ */ jsxs(Link, { to: "/login", children: [
            /* @__PURE__ */ jsx(LogOut, { className: "h-4 w-4" }),
            " Se déconnecter"
          ] }) })
        ] })
      ] })
    ] })
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
  /* @__PURE__ */ jsxs(SheetPrimitive.Content, { ref, className: cn(sheetVariants({ side }), className), ...props, children: [
    /* @__PURE__ */ jsxs(SheetPrimitive.Close, { className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background cursor-pointer transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary", children: [
      /* @__PURE__ */ jsx(X, { className: "h-4 w-4" }),
      /* @__PURE__ */ jsx("span", { className: "sr-only", children: "Close" })
    ] }),
    children
  ] })
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
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen w-full bg-background", children: [
    /* @__PURE__ */ jsx("aside", { className: "fixed inset-y-0 left-0 z-40 hidden w-64 lg:block", children: /* @__PURE__ */ jsx(SidebarNav, {}) }),
    /* @__PURE__ */ jsx(Sheet, { open, onOpenChange: setOpen, children: /* @__PURE__ */ jsx(SheetContent, { side: "left", className: "w-64 border-0 p-0", children: /* @__PURE__ */ jsx(SidebarNav, { onNavigate: () => setOpen(false) }) }) }),
    /* @__PURE__ */ jsxs("div", { className: "flex min-h-screen flex-col lg:pl-64", children: [
      /* @__PURE__ */ jsx(Topbar, { onMenu: () => setOpen(true) }),
      /* @__PURE__ */ jsx("main", { className: "flex-1 p-4 md:p-6 lg:p-8", children: /* @__PURE__ */ jsx(Outlet, {}) })
    ] })
  ] });
}
export {
  AppLayout as component
};
