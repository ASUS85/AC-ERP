import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { CheckCheck, CheckCircle2, Sparkles, AlertTriangle, FileWarning } from "lucide-react";
import { P as PageHeader } from "./PageHeader-JmieIep0.js";
import { a as SectionCard } from "./widgets-VozA-0is.js";
import { B as Button, c as cn } from "./input-BiB-PFhx.js";
import { T as Tabs, a as TabsList, b as TabsTrigger } from "./tabs-CclsoaZT.js";
import { a as notifications } from "./erp-data-CgsBYils.js";
import { toast } from "sonner";
import "@tanstack/react-router";
import "react";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-tabs";
const styles = {
  destructive: {
    wrap: "bg-destructive/10 text-destructive",
    icon: /* @__PURE__ */ jsx(FileWarning, { className: "h-4 w-4" })
  },
  warning: {
    wrap: "bg-warning/15 text-warning-foreground",
    icon: /* @__PURE__ */ jsx(AlertTriangle, { className: "h-4 w-4" })
  },
  info: {
    wrap: "bg-info/12 text-info",
    icon: /* @__PURE__ */ jsx(Sparkles, { className: "h-4 w-4" })
  },
  success: {
    wrap: "bg-success/12 text-success",
    icon: /* @__PURE__ */ jsx(CheckCircle2, { className: "h-4 w-4" })
  }
};
function NotificationsPage() {
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(PageHeader, { title: "Centre de notifications", description: "Alertes ERP et intelligence artificielle en temps réel", breadcrumb: ["Administration", "Notifications"], actions: /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", className: "gap-1.5", onClick: () => toast.success("Toutes les notifications marquées comme lues"), children: [
      /* @__PURE__ */ jsx(CheckCheck, { className: "h-4 w-4" }),
      " Tout marquer comme lu"
    ] }) }),
    /* @__PURE__ */ jsx(Tabs, { defaultValue: "all", className: "mb-4", children: /* @__PURE__ */ jsxs(TabsList, { children: [
      /* @__PURE__ */ jsx(TabsTrigger, { value: "all", children: "Toutes" }),
      /* @__PURE__ */ jsx(TabsTrigger, { value: "unread", children: "Non lues" }),
      /* @__PURE__ */ jsx(TabsTrigger, { value: "ai", children: "Alertes IA" })
    ] }) }),
    /* @__PURE__ */ jsx(SectionCard, { title: "Activité", description: "6 notifications récentes", children: /* @__PURE__ */ jsx("div", { className: "space-y-2", children: notifications.map((n) => {
      const s = styles[n.type];
      return /* @__PURE__ */ jsxs("div", { className: cn("flex items-start gap-3 rounded-lg border p-3.5 transition-colors hover:bg-secondary/40", n.lu ? "border-border" : "border-primary/20 bg-primary/[0.03]"), children: [
        /* @__PURE__ */ jsx("span", { className: cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", s.wrap), children: s.icon }),
        /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-foreground", children: n.titre }),
            !n.lu && /* @__PURE__ */ jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-primary" })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: n.texte }),
          /* @__PURE__ */ jsx("p", { className: "mt-0.5 text-xs text-muted-foreground/70", children: n.temps })
        ] })
      ] }, n.titre + n.temps);
    }) }) })
  ] });
}
export {
  NotificationsPage as component
};
