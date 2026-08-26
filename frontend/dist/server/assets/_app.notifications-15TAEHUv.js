import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useState, useEffect, useMemo } from "react";
import { CheckCheck, LoaderCircle, Clock, Calendar, CheckCircle2, Sparkles, AlertTriangle, FileWarning } from "lucide-react";
import { P as PageHeader } from "./PageHeader-D6EtHCBB.js";
import { a as SectionCard } from "./widgets-VrwHyJZb.js";
import { B as Button } from "./input-B0E-1hwS.js";
import { T as Tabs, a as TabsList, b as TabsTrigger } from "./tabs-2C0ThIlx.js";
import { g as getNotifications, a as marquerToutesLues, m as marquerLue } from "./notifications.service-CNQu_5sq.js";
import { c as cn } from "./router-B5GAJ1jr.js";
import { toast } from "sonner";
import "@tanstack/react-router";
import "react-dom";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "@radix-ui/react-tabs";
import "@tanstack/react-query";
import "clsx";
import "tailwind-merge";
import "zod";
import "zustand";
import "axios";
const styles = {
  destructive: {
    wrap: "bg-destructive/10 text-destructive border-destructive/20",
    icon: /* @__PURE__ */ jsx(FileWarning, { className: "h-4 w-4" })
  },
  warning: {
    wrap: "bg-warning/15 text-warning-foreground border-warning/20",
    icon: /* @__PURE__ */ jsx(AlertTriangle, { className: "h-4 w-4" })
  },
  info: {
    wrap: "bg-info/12 text-info border-info/20",
    icon: /* @__PURE__ */ jsx(Sparkles, { className: "h-4 w-4" })
  },
  success: {
    wrap: "bg-success/12 text-success border-success/20",
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
const formatDateTime = (value) => {
  const date = new Date(value);
  if (isNaN(date.getTime())) return {
    time: "",
    date: ""
  };
  const time = new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
  const formattedDate = new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(date);
  return {
    time,
    date: formattedDate
  };
};
function NotificationsPage() {
  const [items, setItems] = useState([]);
  const [tab, setTab] = useState("all");
  const [selectedDate, setSelectedDate] = useState("");
  const [expandedIds, setExpandedIds] = useState(/* @__PURE__ */ new Set());
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    setLoading(true);
    const params = selectedDate ? dateBounds(selectedDate) : void 0;
    getNotifications(params).then((response) => {
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
    /* @__PURE__ */ jsx(PageHeader, { title: "Centre de notifications", description: "Alertes ERP et intelligence artificielle en temps réel", breadcrumb: ["Administration", "Notifications"], actions: /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", className: "gap-1.5 bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:text-primary-foreground/90 transition-all", onClick: markAllAsRead, children: [
      /* @__PURE__ */ jsx(CheckCheck, { className: "h-4 w-4" }),
      " Tout marquer comme lu"
    ] }) }),
    /* @__PURE__ */ jsx(Tabs, { value: tab, onValueChange: (value) => setTab(value), className: "mb-4", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", children: [
      /* @__PURE__ */ jsxs(TabsList, { className: "bg-muted/50 p-1", children: [
        /* @__PURE__ */ jsx(TabsTrigger, { value: "all", children: "Toutes" }),
        /* @__PURE__ */ jsx(TabsTrigger, { value: "unread", children: "Non lues" }),
        /* @__PURE__ */ jsx(TabsTrigger, { value: "ai", children: "Alertes IA" })
      ] }),
      /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 text-sm text-muted-foreground", children: [
        "Date",
        /* @__PURE__ */ jsx("input", { type: "date", value: selectedDate, onChange: (event) => setSelectedDate(event.target.value), className: "h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-sm outline-none transition-all focus:ring-2 focus:ring-ring", "aria-label": "Filtrer les notifications par date" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(SectionCard, { title: "Activité", description: `${visibleItems.length} notification${visibleItems.length > 1 ? "s" : ""}${selectedDate ? " pour cette date" : ""}`, headerGradient: true, children: /* @__PURE__ */ jsxs("div", { className: "space-y-2.5", children: [
      loading && /* @__PURE__ */ jsx("div", { className: "flex justify-center py-10", children: /* @__PURE__ */ jsx(LoaderCircle, { className: "h-6 w-6 animate-spin text-muted-foreground" }) }),
      !loading && visibleItems.length === 0 && /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center py-14 text-center", children: [
        /* @__PURE__ */ jsx("img", { src: "/src/assets/sorry.svg", alt: "Aucun élément", className: "mb-3 w-28 opacity-80" }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: selectedDate ? "Aucune notification pour cette date." : "Aucune notification disponible." })
      ] }),
      !loading && visibleItems.map((n, index) => {
        const s = notificationStyle(n.typeNotif);
        const expanded = expandedIds.has(n.id);
        const {
          time,
          date
        } = formatDateTime(n.createdAt);
        const isEven = index % 2 === 0;
        return /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => toggleNotification(n), "aria-expanded": expanded, className: cn(
          "relative group flex w-full items-start gap-3.5 rounded-xl border p-4 text-left transition-all duration-200 hover:shadow-sm hover:translate-x-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          // Notifications non lues
          !n.isLue && "border-primary/25 bg-primary/10 shadow-xs hover:bg-primary/15",
          // Notifications lues : Alternance 1 sur 2
          n.isLue && isEven && "border-border/60 bg-primary/5 hover:bg-primary/10",
          n.isLue && !isEven && "border-border/60 bg-card/50 hover:bg-accent/40"
        ), children: [
          !n.isLue && /* @__PURE__ */ jsx("span", { className: "absolute top-4 left-2.5 h-2 w-2 rounded-full bg-primary ring-4 ring-primary/10" }),
          /* @__PURE__ */ jsx("span", { className: cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border shadow-xs transition-transform group-hover:scale-105", s.wrap), children: s.icon }),
          /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1 space-y-1", children: [
            /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2", children: /* @__PURE__ */ jsx("p", { className: cn("text-sm tracking-tight text-foreground", n.isLue ? "font-medium" : "font-semibold"), children: n.titre }) }),
            /* @__PURE__ */ jsx("p", { className: cn("whitespace-pre-wrap break-words text-xs leading-relaxed text-muted-foreground/90 transition-all", !expanded && "line-clamp-2"), children: n.message }),
            /* @__PURE__ */ jsx("div", { className: "flex items-center gap-1.5 pt-0.5 text-[11px] font-medium text-muted-foreground/70", children: /* @__PURE__ */ jsx("span", { children: relativeTime(n.createdAt) }) })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "shrink-0 self-start text-right pl-2", children: /* @__PURE__ */ jsxs("div", { className: "inline-flex flex-col items-end gap-0.5 rounded-md border border-border/40 bg-muted/30 px-2.5 py-1 text-xs", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 font-semibold text-foreground/80", children: [
              /* @__PURE__ */ jsx(Clock, { className: "h-3 w-3 text-muted-foreground" }),
              /* @__PURE__ */ jsx("span", { children: time })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 text-[11px] text-muted-foreground", children: [
              /* @__PURE__ */ jsx(Calendar, { className: "h-3 w-3 text-muted-foreground/70" }),
              /* @__PURE__ */ jsx("span", { children: date })
            ] })
          ] }) })
        ] }, n.id);
      })
    ] }) })
  ] });
}
export {
  NotificationsPage as component
};
