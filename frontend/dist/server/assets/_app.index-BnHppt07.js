import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { ResponsiveContainer, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Area, PieChart, Pie, Cell, BarChart, Bar } from "recharts";
import { Loader2, Eye, Download, Plus, Truck, Warehouse, Package, Users, Receipt, Banknote, Target, Sparkles, FileWarning, AlertTriangle } from "lucide-react";
import { P as PageHeader } from "./PageHeader-CfvoM4wf.js";
import { S as StatCard, a as SectionCard } from "./widgets-CpNLLYbf.js";
import { C as ChartFrame } from "./ChartFrame-CZaxVeaS.js";
import { S as StatusBadge } from "./StatusBadge-uJo4wGa2.js";
import { A as AppModal } from "./AppModal-C0J9hUIk.js";
import { B as Button } from "./input-Bk3f2XgL.js";
import { useState, useEffect } from "react";
import { u as useDashboardStore, E as EMPTY_DASHBOARD_OVERVIEW, g as getDashboardPdf } from "./dashboard.store-BPsABuCg.js";
import { g as getStoredCurrency } from "./currency-BmQmAj7J.js";
import { f as fmtCurrency } from "./erp-data-lC_Sts2J.js";
import { toast } from "sonner";
import "./router-Ccz3J_v4.js";
import "@tanstack/react-query";
import "clsx";
import "tailwind-merge";
import "zod";
import "zustand";
import "axios";
import "react-dom";
import "./skeleton-O68sTdxD.js";
import "@radix-ui/react-dialog";
import "@radix-ui/react-slot";
import "class-variance-authority";
const kpiIcons = {
  revenue: /* @__PURE__ */ jsx(Banknote, { className: "h-5 w-5" }),
  sales: /* @__PURE__ */ jsx(Receipt, { className: "h-5 w-5" }),
  customers: /* @__PURE__ */ jsx(Users, { className: "h-5 w-5" }),
  products: /* @__PURE__ */ jsx(Package, { className: "h-5 w-5" }),
  stock: /* @__PURE__ */ jsx(Warehouse, { className: "h-5 w-5" }),
  suppliers: /* @__PURE__ */ jsx(Truck, { className: "h-5 w-5" })
};
const alertIcons = {
  stock: /* @__PURE__ */ jsx(AlertTriangle, { className: "h-4 w-4" }),
  invoice: /* @__PURE__ */ jsx(FileWarning, { className: "h-4 w-4" }),
  ai: /* @__PURE__ */ jsx(Sparkles, { className: "h-4 w-4" }),
  goal: /* @__PURE__ */ jsx(Target, { className: "h-4 w-4" })
};
const alertStyles = {
  warning: "bg-warning/12 text-warning-foreground",
  destructive: "bg-destructive/10 text-destructive",
  info: "bg-info/12 text-info",
  success: "bg-success/12 text-success"
};
const pieColors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];
function ChartTooltip({
  active,
  payload,
  label
}) {
  if (!active || !payload?.length) return null;
  return /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-pop", children: [
    /* @__PURE__ */ jsx("p", { className: "mb-1 font-medium text-foreground", children: label }),
    payload.map((p) => /* @__PURE__ */ jsxs("p", { className: "flex items-center gap-1.5 text-muted-foreground", children: [
      /* @__PURE__ */ jsx("span", { className: "h-2 w-2 rounded-full", style: {
        background: p.color
      } }),
      p.name,
      ":",
      " ",
      /* @__PURE__ */ jsx("span", { className: "font-medium text-foreground", children: fmtCurrency(p.value) })
    ] }, p.dataKey))
  ] });
}
function Dashboard() {
  const [currencyCode, setCurrencyCode] = useState(() => getStoredCurrency());
  const dashboardData = useDashboardStore((state) => state.data);
  const loading = useDashboardStore((state) => state.loading);
  const fetchOverview = useDashboardStore((state) => state.fetchOverview);
  const [exporting, setExporting] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  useEffect(() => {
    const handleCurrencyChange = () => setCurrencyCode(getStoredCurrency());
    window.addEventListener("erp:currency-changed", handleCurrencyChange);
    window.addEventListener("storage", handleCurrencyChange);
    void fetchOverview().catch(() => toast.error("Impossible de charger le tableau de bord"));
    return () => {
      window.removeEventListener("erp:currency-changed", handleCurrencyChange);
      window.removeEventListener("storage", handleCurrencyChange);
    };
  }, [currencyCode, fetchOverview]);
  const {
    kpis,
    salesTrend,
    topProducts,
    stockSplit,
    recentSales,
    alerts
  } = dashboardData || EMPTY_DASHBOARD_OVERVIEW;
  const exportDashboard = async () => {
    try {
      setExporting(true);
      const blob = await getDashboardPdf();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `dashboard-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast.success("PDF du dashboard exporte");
    } catch {
      toast.error("Export PDF impossible");
    } finally {
      setExporting(false);
    }
  };
  const openPreview = async () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setPreviewLoading(true);
    try {
      const blob = await getDashboardPdf();
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      setPreviewOpen(true);
    } catch {
      toast.error("Impossible de generer l'apercu PDF");
    } finally {
      setPreviewLoading(false);
    }
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(PageHeader, { title: "Tableau de bord", description: "Vue decisionnelle de votre activite commerciale", actions: /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", className: "gap-1.5", onClick: () => void openPreview(), disabled: previewLoading, children: [
        previewLoading ? /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsx(Eye, { className: "h-4 w-4" }),
        "Apercu"
      ] }),
      /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", className: "gap-1.5", onClick: exportDashboard, disabled: loading || exporting, children: [
        /* @__PURE__ */ jsx(Download, { className: "h-4 w-4" }),
        " ",
        exporting ? "Export..." : "Exporter"
      ] }),
      /* @__PURE__ */ jsx(Button, { size: "sm", className: "gap-1.5", asChild: true, children: /* @__PURE__ */ jsxs(Link, { to: "/sales", children: [
        /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
        " Nouvelle vente"
      ] }) })
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6", children: loading ? Array.from({
      length: 6
    }).map((_, i) => /* @__PURE__ */ jsx("div", { className: "h-32 animate-pulse rounded-lg border border-border bg-muted/40" }, i)) : kpis.map((k) => /* @__PURE__ */ jsx(StatCard, { ...k, icon: kpiIcons[k.icon] }, k.label)) }),
    /* @__PURE__ */ jsxs("div", { className: "mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3", children: [
      /* @__PURE__ */ jsx(SectionCard, { title: "Evolution des ventes & achats", description: "Chiffre d'affaires mensuel sur 12 mois", className: "lg:col-span-2", children: /* @__PURE__ */ jsx(ChartFrame, { loading, className: "h-72", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(AreaChart, { data: salesTrend, margin: {
        left: -10,
        right: 8,
        top: 8
      }, children: [
        /* @__PURE__ */ jsxs("defs", { children: [
          /* @__PURE__ */ jsxs("linearGradient", { id: "gVentes", x1: "0", y1: "0", x2: "0", y2: "1", children: [
            /* @__PURE__ */ jsx("stop", { offset: "5%", stopColor: "var(--chart-1)", stopOpacity: 0.35 }),
            /* @__PURE__ */ jsx("stop", { offset: "95%", stopColor: "var(--chart-1)", stopOpacity: 0 })
          ] }),
          /* @__PURE__ */ jsxs("linearGradient", { id: "gAchats", x1: "0", y1: "0", x2: "0", y2: "1", children: [
            /* @__PURE__ */ jsx("stop", { offset: "5%", stopColor: "var(--chart-3)", stopOpacity: 0.3 }),
            /* @__PURE__ */ jsx("stop", { offset: "95%", stopColor: "var(--chart-3)", stopOpacity: 0 })
          ] })
        ] }),
        /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "var(--border)", vertical: false }),
        /* @__PURE__ */ jsx(XAxis, { dataKey: "mois", tickLine: false, axisLine: false, fontSize: 12, stroke: "var(--muted-foreground)" }),
        /* @__PURE__ */ jsx(YAxis, { tickLine: false, axisLine: false, fontSize: 12, stroke: "var(--muted-foreground)", tickFormatter: (v) => `${v / 1e3}k` }),
        /* @__PURE__ */ jsx(Tooltip, { content: /* @__PURE__ */ jsx(ChartTooltip, {}) }),
        /* @__PURE__ */ jsx(Legend, { iconType: "circle", wrapperStyle: {
          fontSize: 12
        } }),
        /* @__PURE__ */ jsx(Area, { type: "monotone", dataKey: "ventes", name: "Ventes", stroke: "var(--chart-1)", strokeWidth: 2.5, fill: "url(#gVentes)" }),
        /* @__PURE__ */ jsx(Area, { type: "monotone", dataKey: "achats", name: "Achats", stroke: "var(--chart-3)", strokeWidth: 2.5, fill: "url(#gAchats)" })
      ] }) }) }) }),
      /* @__PURE__ */ jsx(SectionCard, { title: "Repartition des stocks", description: "Par categorie de produits", children: /* @__PURE__ */ jsx(ChartFrame, { loading, className: "h-72", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(PieChart, { children: [
        /* @__PURE__ */ jsx(Pie, { data: stockSplit, dataKey: "value", nameKey: "name", innerRadius: 55, outerRadius: 88, paddingAngle: 3, children: stockSplit.map((_, i) => /* @__PURE__ */ jsx(Cell, { fill: pieColors[i % pieColors.length] }, i)) }),
        /* @__PURE__ */ jsx(Tooltip, { contentStyle: {
          borderRadius: 12,
          border: "1px solid var(--border)",
          fontSize: 12
        }, formatter: (v, n) => [`${v} %`, n] }),
        /* @__PURE__ */ jsx(Legend, { iconType: "circle", wrapperStyle: {
          fontSize: 11
        } })
      ] }) }) }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3", children: [
      /* @__PURE__ */ jsx(SectionCard, { title: "Produits les plus vendus", description: "Top 5 ce mois-ci", className: "lg:col-span-2", children: /* @__PURE__ */ jsx(ChartFrame, { loading, className: "h-64", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(BarChart, { data: topProducts, layout: "vertical", margin: {
        left: 40,
        right: 16
      }, children: [
        /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "var(--border)", horizontal: false }),
        /* @__PURE__ */ jsx(XAxis, { type: "number", tickLine: false, axisLine: false, fontSize: 12, stroke: "var(--muted-foreground)" }),
        /* @__PURE__ */ jsx(YAxis, { type: "category", dataKey: "nom", tickLine: false, axisLine: false, width: 150, fontSize: 11, stroke: "var(--muted-foreground)" }),
        /* @__PURE__ */ jsx(Tooltip, { cursor: {
          fill: "var(--secondary)"
        }, contentStyle: {
          borderRadius: 12,
          border: "1px solid var(--border)",
          fontSize: 12
        } }),
        /* @__PURE__ */ jsx(Bar, { dataKey: "ventes", name: "Unites vendues", fill: "var(--chart-1)", radius: [0, 6, 6, 0], barSize: 18 })
      ] }) }) }) }),
      /* @__PURE__ */ jsx(SectionCard, { title: "Alertes & notifications", description: "Elements necessitant votre attention", children: /* @__PURE__ */ jsx("div", { className: "space-y-3", children: alerts.map((a) => /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 rounded-lg border border-border p-3", children: [
        /* @__PURE__ */ jsx("span", { className: `flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${alertStyles[a.type]}`, children: alertIcons[a.icon] }),
        /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-foreground", children: a.title }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: a.text })
        ] })
      ] }, a.title)) }) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mt-4", children: /* @__PURE__ */ jsx(SectionCard, { title: "Dernieres ventes", description: "Activite recente", action: /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", asChild: true, children: /* @__PURE__ */ jsx(Link, { to: "/sales", children: "Tout voir" }) }), children: /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground", children: [
        /* @__PURE__ */ jsx("th", { className: "pb-2 font-medium", children: "Reference" }),
        /* @__PURE__ */ jsx("th", { className: "pb-2 font-medium", children: "Client" }),
        /* @__PURE__ */ jsx("th", { className: "pb-2 font-medium", children: "Date" }),
        /* @__PURE__ */ jsx("th", { className: "pb-2 text-right font-medium", children: "Montant" }),
        /* @__PURE__ */ jsx("th", { className: "pb-2 text-right font-medium", children: "Statut" })
      ] }) }),
      /* @__PURE__ */ jsxs("tbody", { children: [
        recentSales.map((s) => /* @__PURE__ */ jsxs("tr", { className: "border-b border-border/60 last:border-0 hover:bg-secondary/40", children: [
          /* @__PURE__ */ jsx("td", { className: "py-3 font-medium text-foreground", children: s.ref }),
          /* @__PURE__ */ jsx("td", { className: "py-3 text-muted-foreground", children: s.client }),
          /* @__PURE__ */ jsx("td", { className: "py-3 text-muted-foreground", children: s.date }),
          /* @__PURE__ */ jsx("td", { className: "py-3 text-right font-medium text-foreground", children: fmtCurrency(s.montant) }),
          /* @__PURE__ */ jsx("td", { className: "py-3 text-right", children: /* @__PURE__ */ jsx(StatusBadge, { status: s.statut }) })
        ] }, s.ref)),
        recentSales.length === 0 && /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 5, className: "py-5 text-center text-sm text-muted-foreground", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center py-5 text-center", children: [
          /* @__PURE__ */ jsx("img", { src: "/src/assets/sorry.svg", alt: "Aucun element", className: "mb-3 w-28 opacity-90" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-muted-foreground", children: "Aucun element a afficher" })
        ] }) }) })
      ] })
    ] }) }) }) }),
    /* @__PURE__ */ jsx(AppModal, { open: previewOpen, onOpenChange: (open) => {
      if (!open && previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewOpen(open);
    }, title: "Apercu PDF", description: "Rapport du tableau de bord", size: "xxl", footer: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-end gap-2", children: [
      /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewOpen(false);
      }, children: "Fermer" }),
      /* @__PURE__ */ jsxs(Button, { onClick: () => {
        if (!previewUrl) return;
        const link = document.createElement("a");
        link.href = previewUrl;
        link.download = `dashboard-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.pdf`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        toast.success("PDF telecharge");
      }, children: [
        /* @__PURE__ */ jsx(Download, { className: "mr-2 h-4 w-4" }),
        " Telecharger"
      ] })
    ] }), children: previewUrl ? /* @__PURE__ */ jsx("iframe", { src: previewUrl, className: "h-[70vh] w-full rounded-lg border border-border", title: "Apercu PDF dashboard" }) : /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center py-12 text-muted-foreground", children: [
      /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }),
      " Generation du PDF..."
    ] }) })
  ] });
}
export {
  Dashboard as component
};
