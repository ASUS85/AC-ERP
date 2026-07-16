import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useState, useEffect, useMemo } from "react";
import { CheckCheck, LoaderCircle, CheckCircle2, Sparkles, AlertTriangle, FileWarning } from "lucide-react";
import { P as PageHeader } from "./PageHeader-Dn6TWXax.js";
import { a as SectionCard } from "./widgets-D8uCN_-E.js";
import { B as Button } from "./input-DRGbboqL.js";
import { T as Tabs, a as TabsList, b as TabsTrigger } from "./tabs-D5l5KdR-.js";
import { g as getNotifications, a as marquerToutesLues, m as marquerLue } from "./notifications.service-B7_FQ1hs.js";
import { c as cn } from "./router-C1QYPkjn.js";
import { toast } from "sonner";
import "@tanstack/react-router";
import "react-dom";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "@radix-ui/react-tabs";
import "./client-B-gDdwdO.js";
import "axios";
import "@tanstack/react-query";
import "clsx";
import "tailwind-merge";
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
const notificationStyle = (type) => {
  if (type === "FACTURE_ECHEANCE" || type === "DEVIS_EXPIRE") return styles.destructive;
  if (type === "ALERTE_STOCK" || type === "SECURITE") return styles.warning;
  if (type === "PAIEMENT_RECU" || type === "RAPPORT_PRET") return styles.success;
  return styles.info;
};
const isAiNotification = (notification) => notification.typeNotif === "RAPPORT_PRET" || notification.entityType?.toLowerCase().includes("ia") || /\b(ia|intelligence artificielle|prévision)\b/i.test(`${notification.titre} ${notification.message}`);
const localDateValue = (date = /* @__PURE__ */ new Date()) => {
  const offset = date.getTimezoneOffset() * 6e4;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
};
const dateBounds = (value) => {
  const start = /* @__PURE__ */ new Date(`${value}T00:00:00`);
  const end = /* @__PURE__ */ new Date(`${value}T23:59:59.999`);
  return {
    dateFrom: start.toISOString(),
    dateTo: end.toISOString()
  };
};
const relativeTime = (value) => {
  const elapsed = Date.now() - new Date(value).getTime();
  const formatter = new Intl.RelativeTimeFormat("fr", {
    numeric: "auto"
  });
  const units = [["year", 31536e6], ["month", 2592e6], ["day", 864e5], ["hour", 36e5], ["minute", 6e4]];
  for (const [unit, size] of units) {
    if (elapsed >= size) return formatter.format(-Math.floor(elapsed / size), unit);
  }
  return "à l'instant";
};
function NotificationsPage() {
  const [items, setItems] = useState([]);
  const [tab, setTab] = useState("all");
  const [selectedDate, setSelectedDate] = useState(localDateValue);
  const [expandedIds, setExpandedIds] = useState(/* @__PURE__ */ new Set());
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    setLoading(true);
    getNotifications(dateBounds(selectedDate)).then((response) => {
      if (active) setItems(response.data || []);
    }).catch(() => toast.error("Impossible de charger les notifications")).finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [selectedDate]);
  const visibleItems = useMemo(() => items.filter((item) => {
    if (tab === "unread") return !item.isLue;
    if (tab === "ai") return isAiNotification(item);
    return true;
  }), [items, tab]);
  const toggleNotification = async (notification) => {
    setExpandedIds((current) => {
      const next = new Set(current);
      next.has(notification.id) ? next.delete(notification.id) : next.add(notification.id);
      return next;
    });
    if (!notification.isLue) {
      try {
        await marquerLue(notification.id);
        setItems((current) => current.map((item) => item.id === notification.id ? {
          ...item,
          isLue: true
        } : item));
      } catch {
        toast.error("La notification n'a pas pu être marquée comme lue");
      }
    }
  };
  const markAllAsRead = async () => {
    try {
      await marquerToutesLues();
      setItems((current) => current.map((item) => ({
        ...item,
        isLue: true
      })));
      toast.success("Toutes les notifications ont été marquées comme lues");
    } catch {
      toast.error("Impossible de marquer les notifications comme lues");
    }
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(PageHeader, { title: "Centre de notifications", description: "Alertes ERP et intelligence artificielle en temps réel", breadcrumb: ["Administration", "Notifications"], actions: /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", className: "gap-1.5", onClick: markAllAsRead, children: [
      /* @__PURE__ */ jsx(CheckCheck, { className: "h-4 w-4" }),
      " Tout marquer comme lu"
    ] }) }),
    /* @__PURE__ */ jsx(Tabs, { value: tab, onValueChange: (value) => setTab(value), className: "mb-4", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", children: [
      /* @__PURE__ */ jsxs(TabsList, { children: [
        /* @__PURE__ */ jsx(TabsTrigger, { value: "all", children: "Toutes" }),
        /* @__PURE__ */ jsx(TabsTrigger, { value: "unread", children: "Non lues" }),
        /* @__PURE__ */ jsx(TabsTrigger, { value: "ai", children: "Alertes IA" })
      ] }),
      /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 text-sm text-muted-foreground", children: [
        "Date",
        /* @__PURE__ */ jsx("input", { type: "date", value: selectedDate, onChange: (event) => setSelectedDate(event.target.value || localDateValue()), className: "h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-sm outline-none focus:ring-2 focus:ring-ring", "aria-label": "Filtrer les notifications par date" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(SectionCard, { title: "Activité", description: `${visibleItems.length} notification${visibleItems.length > 1 ? "s" : ""} pour cette date`, children: /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
      loading && /* @__PURE__ */ jsx("div", { className: "flex justify-center py-8", children: /* @__PURE__ */ jsx(LoaderCircle, { className: "h-5 w-5 animate-spin text-muted-foreground" }) }),
      !loading && visibleItems.length === 0 && /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center py-14 text-center", children: [
        /* @__PURE__ */ jsx("img", { src: "/src/assets/sorry.svg", alt: "Aucun élément", className: "mb-3 w-28 opacity-90" }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-muted-foreground/70", children: "Aucune notification pour cette date." })
      ] }),
      !loading && visibleItems.map((n) => {
        const s = notificationStyle(n.typeNotif);
        const expanded = expandedIds.has(n.id);
        return /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => toggleNotification(n), "aria-expanded": expanded, className: cn("flex w-full items-start gap-3 rounded-lg border p-3.5 text-left transition-all hover:bg-secondary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", n.isLue ? "border-border" : "border-primary/20 bg-primary/[0.03]"), children: [
          /* @__PURE__ */ jsx("span", { className: cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", s.wrap), children: s.icon }),
          /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-foreground", children: n.titre }),
              !n.isLue && /* @__PURE__ */ jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-primary" })
            ] }),
            /* @__PURE__ */ jsx("p", { className: cn("whitespace-pre-wrap break-words text-sm text-muted-foreground", !expanded && "line-clamp-2"), children: n.message }),
            /* @__PURE__ */ jsx("p", { className: "mt-0.5 text-xs text-muted-foreground/70", children: relativeTime(n.createdAt) })
          ] })
        ] }, n.id);
      })
    ] }) })
  ] });
}
export {
  NotificationsPage as component
};
