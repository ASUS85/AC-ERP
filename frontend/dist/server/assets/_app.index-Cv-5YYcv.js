import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { ResponsiveContainer, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Area, PieChart, Pie, Cell, BarChart, Bar } from "recharts";
import { Download, Plus, Truck, Warehouse, Package, Users, Receipt, Banknote, Target, Sparkles, FileWarning, AlertTriangle } from "lucide-react";
import { P as PageHeader } from "./PageHeader-Dn6TWXax.js";
import { S as StatCard, a as SectionCard } from "./widgets-D8uCN_-E.js";
import { S as StatusBadge } from "./StatusBadge-ClcddGdN.js";
import { B as Button } from "./input-DRGbboqL.js";
import { useState, useEffect } from "react";
import { a as api } from "./client-B-gDdwdO.js";
import { f as fmtCurrency } from "./erp-data-DdbAvP8x.js";
import { toast } from "sonner";
import "./router-C1QYPkjn.js";
import "@tanstack/react-query";
import "clsx";
import "tailwind-merge";
import "react-dom";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "axios";
import "./currency-oCEgfK2m.js";
const getDashboardOverview = () => api.get("/dashboard/overview");
const getDashboardPdf = () => api.get("/dashboard/export.pdf", { responseType: "blob" });
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
  const [dashboard, setDashboard] = useState({
    kpis: [],
    salesTrend: [],
    topProducts: [],
    stockSplit: [],
    recentSales: [],
    alerts: []
  });
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        const response = await getDashboardOverview();
        if (response?.data) setDashboard(response.data);
      } catch {
        toast.error("Impossible de charger le tableau de bord");
      } finally {
        setLoading(false);
      }
    }
    void loadDashboard();
  }, []);
  const {
    kpis,
    salesTrend,
    topProducts,
    stockSplit,
    recentSales,
    alerts
  } = dashboard;
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
      toast.success("PDF du dashboard exporté");
    } catch {
      toast.error("Export PDF impossible");
    } finally {
      setExporting(false);
    }
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(PageHeader, { title: "Tableau de bord", description: "Vue décisionnelle de votre activité commerciale", actions: /* @__PURE__ */ jsxs(Fragment, { children: [
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
    }).map((_, index) => /* @__PURE__ */ jsx("div", { className: "h-32 animate-pulse rounded-lg border border-border bg-muted/40" }, index)) : kpis.map((k) => /* @__PURE__ */ jsx(StatCard, { ...k, icon: kpiIcons[k.icon] }, k.label)) }),
    /* @__PURE__ */ jsxs("div", { className: "mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3", children: [
      /* @__PURE__ */ jsx(SectionCard, { title: "Évolution des ventes & achats", description: "Chiffre d'affaires mensuel sur 12 mois", className: "lg:col-span-2", children: /* @__PURE__ */ jsx("div", { className: "h-72", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(AreaChart, { data: salesTrend, margin: {
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
      /* @__PURE__ */ jsx(SectionCard, { title: "Répartition des stocks", description: "Par catégorie de produits", children: /* @__PURE__ */ jsx("div", { className: "h-72", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(PieChart, { children: [
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
      /* @__PURE__ */ jsx(SectionCard, { title: "Produits les plus vendus", description: "Top 5 ce mois-ci", className: "lg:col-span-2", children: /* @__PURE__ */ jsx("div", { className: "h-64", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(BarChart, { data: topProducts, layout: "vertical", margin: {
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
        /* @__PURE__ */ jsx(Bar, { dataKey: "ventes", name: "Unités vendues", fill: "var(--chart-1)", radius: [0, 6, 6, 0], barSize: 18 })
      ] }) }) }) }),
      /* @__PURE__ */ jsx(SectionCard, { title: "Alertes & notifications", description: "Éléments nécessitant votre attention", children: /* @__PURE__ */ jsx("div", { className: "space-y-3", children: alerts.map((a) => /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 rounded-lg border border-border p-3", children: [
        /* @__PURE__ */ jsx("span", { className: `flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${alertStyles[a.type]}`, children: alertIcons[a.icon] }),
        /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-foreground", children: a.title }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: a.text })
        ] })
      ] }, a.title)) }) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mt-4", children: /* @__PURE__ */ jsx(SectionCard, { title: "Dernières ventes", description: "Activité récente", action: /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", asChild: true, children: /* @__PURE__ */ jsx(Link, { to: "/sales", children: "Tout voir" }) }), children: /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground", children: [
        /* @__PURE__ */ jsx("th", { className: "pb-2 font-medium", children: "Référence" }),
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
          /* @__PURE__ */ jsx("img", { src: "/src/assets/sorry.svg", alt: "Aucun élément", className: "mb-3 w-28 opacity-90" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-muted-foreground", children: "Aucun élément à afficher" })
        ] }) }) })
      ] })
    ] }) }) }) })
  ] });
}
export {
  Dashboard as component
};
