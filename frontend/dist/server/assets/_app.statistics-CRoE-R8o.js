import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { ResponsiveContainer, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, Area, BarChart, Bar, ComposedChart, Legend, Line, Cell, PieChart, Pie, Brush } from "recharts";
import { P as PageHeader } from "./PageHeader-D6EtHCBB.js";
import { S as StatCard, a as SectionCard } from "./widgets-VrwHyJZb.js";
import { C as ChartFrame } from "./ChartFrame-8YfPAK_M.js";
import { f as fmtCurrency } from "./erp-data-lC_Sts2J.js";
import { g as getStoredCurrency } from "./currency-BmQmAj7J.js";
import { Loader2, TrendingUp, ShoppingCart, Banknote, Warehouse } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { u as useDashboardStore, a as getTopClients, E as EMPTY_DASHBOARD_OVERVIEW } from "./dashboard.store-xZQKiLDF.js";
import { i as api } from "./router-B5GAJ1jr.js";
import "@tanstack/react-router";
import "./input-B0E-1hwS.js";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "react-dom";
import "./skeleton-DCOpnToG.js";
import "zustand";
import "@tanstack/react-query";
import "clsx";
import "tailwind-merge";
import "zod";
import "axios";
const getRapportVentes = (params) => api.get("/rapports/ventes", { params });
const getRapportAchats = (params) => api.get("/rapports/achats", { params });
const pieColors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];
const grid = "var(--border)";
const axis = "var(--muted-foreground)";
const toNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};
const responseData = (response) => {
  if (!response || typeof response !== "object" || !("data" in response)) {
    return [];
  }
  const data = response.data;
  return Array.isArray(data) ? data : [];
};
const dateInputValue = (date) => date.toISOString().slice(0, 10);
const dayKey = (value) => {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
};
const shortDate = (value) => (/* @__PURE__ */ new Date(`${value}T00:00:00`)).toLocaleDateString("fr-FR", {
  day: "2-digit",
  month: "short"
});
function StatsPage() {
  const [currencyCode, setCurrencyCode] = useState(() => getStoredCurrency());
  const [topClients, setTopClients] = useState([]);
  const [dailyData, setDailyData] = useState([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const dashboardData = useDashboardStore((state) => state.data);
  const loading = useDashboardStore((state) => state.loading);
  const fetchOverview = useDashboardStore((state) => state.fetchOverview);
  useEffect(() => {
    const handleCurrencyChange = () => setCurrencyCode(getStoredCurrency());
    window.addEventListener("erp:currency-changed", handleCurrencyChange);
    window.addEventListener("storage", handleCurrencyChange);
    void fetchOverview().catch(() => toast.error("Impossible de charger les statistiques"));
    return () => {
      window.removeEventListener("erp:currency-changed", handleCurrencyChange);
      window.removeEventListener("storage", handleCurrencyChange);
    };
  }, [currencyCode, fetchOverview]);
  useEffect(() => {
    let active = true;
    const end = /* @__PURE__ */ new Date();
    const start = new Date(end.getFullYear() - 1, 0, 1);
    setAnalyticsLoading(true);
    Promise.all([getTopClients(), getRapportVentes({
      dateDebut: dateInputValue(start),
      dateFin: dateInputValue(end)
    }), getRapportAchats({
      dateDebut: dateInputValue(start),
      dateFin: dateInputValue(end)
    })]).then(([clientsResponse, ventesResponse, achatsResponse]) => {
      if (!active) return;
      setTopClients(responseData(clientsResponse));
      const grouped = /* @__PURE__ */ new Map();
      const ensureDay = (date) => {
        const current = grouped.get(date);
        if (current) return current;
        const next = {
          date,
          ventes: 0,
          achats: 0,
          marge: 0,
          paiements: 0
        };
        grouped.set(date, next);
        return next;
      };
      responseData(ventesResponse).forEach((facture) => {
        const date = dayKey(facture.dateEmission);
        if (!date) return;
        const point = ensureDay(date);
        point.ventes += toNumber(facture.totalTtc);
        point.paiements += toNumber(facture.montantPaye);
      });
      responseData(achatsResponse).forEach((facture) => {
        const date = dayKey(facture.dateEmission);
        if (!date) return;
        const point = ensureDay(date);
        point.achats += toNumber(facture.totalTtc);
      });
      setDailyData(Array.from(grouped.values()).sort((a, b) => a.date.localeCompare(b.date)).map((point) => ({
        ...point,
        marge: point.ventes - point.achats
      })));
    }).catch(() => toast.error("Impossible de charger les séries analytiques détaillées")).finally(() => active && setAnalyticsLoading(false));
    return () => {
      active = false;
    };
  }, []);
  const {
    salesTrend,
    topProducts,
    stockSplit,
    globalStats
  } = dashboardData || EMPTY_DASHBOARD_OVERVIEW;
  const stats = globalStats;
  const chartLoading = loading || analyticsLoading;
  const stockRotation = stats && stats.valeurStock > 0 ? stats.totalAchats / stats.valeurStock : 0;
  const monthlyData = useMemo(() => salesTrend.map((item) => ({
    ...item,
    marge: toNumber(item.ventes) - toNumber(item.achats)
  })), [salesTrend]);
  const financeStructure = useMemo(() => [{
    name: "CA",
    value: stats?.totalVentes ?? 0
  }, {
    name: "Achats",
    value: stats?.totalAchats ?? 0
  }, {
    name: "Marge",
    value: stats?.margeBrute ?? 0
  }, {
    name: "Paiements",
    value: stats?.paiementsRecus ?? 0
  }], [stats]);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(PageHeader, { title: "Statistiques & analyses", description: "Indicateurs ventes, achats, stocks et finances", breadcrumb: ["Intelligence", "Statistiques"] }),
    /* @__PURE__ */ jsx("div", { className: "mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4", children: loading ? Array.from({
      length: 4
    }).map((_, index) => /* @__PURE__ */ jsx("div", { className: "flex h-32 items-center justify-center rounded-lg border border-border bg-muted/40", children: /* @__PURE__ */ jsx(Loader2, { className: "h-5 w-5 animate-spin text-muted-foreground" }) }, index)) : /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(StatCard, { label: "Ventes (an)", value: fmtCurrency(stats?.totalVentes ?? 0, currencyCode), sub: `cumulé ${stats?.annee ?? (/* @__PURE__ */ new Date()).getFullYear()}`, icon: /* @__PURE__ */ jsx(TrendingUp, { className: "h-5 w-5" }) }),
      /* @__PURE__ */ jsx(StatCard, { label: "Achats (an)", value: fmtCurrency(stats?.totalAchats ?? 0, currencyCode), sub: `cumulé ${stats?.annee ?? (/* @__PURE__ */ new Date()).getFullYear()}`, icon: /* @__PURE__ */ jsx(ShoppingCart, { className: "h-5 w-5" }) }),
      /* @__PURE__ */ jsx(StatCard, { label: "Marge brute", value: `${(stats?.margeBrutePourcentage ?? 0).toFixed(1).replace(".", ",")} %`, sub: fmtCurrency(stats?.margeBrute ?? 0, currencyCode), icon: /* @__PURE__ */ jsx(Banknote, { className: "h-5 w-5" }) }),
      /* @__PURE__ */ jsx(StatCard, { label: "Rotation stock", value: `${stockRotation.toFixed(1).replace(".", ",")}x`, sub: "par an", icon: /* @__PURE__ */ jsx(Warehouse, { className: "h-5 w-5" }) })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-4 lg:grid-cols-3", children: [
      /* @__PURE__ */ jsx(SectionCard, { title: "CA mensuel", description: "Chiffre d'affaires", headerGradient: true, children: /* @__PURE__ */ jsx(ChartFrame, { loading, className: "h-64", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(AreaChart, { data: monthlyData, margin: {
        left: -10,
        right: 8
      }, children: [
        /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: grid, vertical: false }),
        /* @__PURE__ */ jsx(XAxis, { dataKey: "mois", tickLine: false, axisLine: false, fontSize: 11, stroke: axis }),
        /* @__PURE__ */ jsx(YAxis, { tickLine: false, axisLine: false, fontSize: 11, stroke: axis, tickFormatter: (v) => `${v / 1e3}k` }),
        /* @__PURE__ */ jsx(Tooltip, { formatter: (v) => fmtCurrency(v, currencyCode) }),
        /* @__PURE__ */ jsx(Area, { type: "monotone", dataKey: "ventes", name: "CA", stroke: "var(--chart-1)", strokeWidth: 2.5, fill: "var(--chart-1)", fillOpacity: 0.18 })
      ] }) }) }) }),
      /* @__PURE__ */ jsx(SectionCard, { title: "Achats mensuels", description: "Dépenses fournisseurs", headerGradient: true, children: /* @__PURE__ */ jsx(ChartFrame, { loading, className: "h-64", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(BarChart, { data: monthlyData, margin: {
        left: -10,
        right: 8
      }, children: [
        /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: grid, vertical: false }),
        /* @__PURE__ */ jsx(XAxis, { dataKey: "mois", tickLine: false, axisLine: false, fontSize: 11, stroke: axis }),
        /* @__PURE__ */ jsx(YAxis, { tickLine: false, axisLine: false, fontSize: 11, stroke: axis, tickFormatter: (v) => `${v / 1e3}k` }),
        /* @__PURE__ */ jsx(Tooltip, { formatter: (v) => fmtCurrency(v, currencyCode) }),
        /* @__PURE__ */ jsx(Bar, { dataKey: "achats", name: "Achats", fill: "var(--chart-3)", radius: [4, 4, 0, 0] })
      ] }) }) }) }),
      /* @__PURE__ */ jsx(SectionCard, { title: "Marge mensuelle", description: "Ventes moins achats", headerGradient: true, children: /* @__PURE__ */ jsx(ChartFrame, { loading, className: "h-64", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(BarChart, { data: monthlyData, margin: {
        left: -10,
        right: 8
      }, children: [
        /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: grid, vertical: false }),
        /* @__PURE__ */ jsx(XAxis, { dataKey: "mois", tickLine: false, axisLine: false, fontSize: 11, stroke: axis }),
        /* @__PURE__ */ jsx(YAxis, { tickLine: false, axisLine: false, fontSize: 11, stroke: axis, tickFormatter: (v) => `${v / 1e3}k` }),
        /* @__PURE__ */ jsx(Tooltip, { formatter: (v) => fmtCurrency(v, currencyCode) }),
        /* @__PURE__ */ jsx(Bar, { dataKey: "marge", name: "Marge", fill: "var(--chart-2)", radius: [4, 4, 0, 0] })
      ] }) }) }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2", children: [
      /* @__PURE__ */ jsx(SectionCard, { title: "Ventes vs achats", description: "Comparatif mensuel", headerGradient: true, children: /* @__PURE__ */ jsx(ChartFrame, { loading, className: "h-80", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(ComposedChart, { data: monthlyData, margin: {
        left: -10,
        right: 8
      }, children: [
        /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: grid, vertical: false }),
        /* @__PURE__ */ jsx(XAxis, { dataKey: "mois", tickLine: false, axisLine: false, fontSize: 11, stroke: axis }),
        /* @__PURE__ */ jsx(YAxis, { tickLine: false, axisLine: false, fontSize: 11, stroke: axis, tickFormatter: (v) => `${v / 1e3}k` }),
        /* @__PURE__ */ jsx(Tooltip, { formatter: (v) => fmtCurrency(v, currencyCode) }),
        /* @__PURE__ */ jsx(Legend, { iconType: "circle", wrapperStyle: {
          fontSize: 11
        } }),
        /* @__PURE__ */ jsx(Bar, { dataKey: "achats", name: "Achats", fill: "var(--chart-3)", radius: [4, 4, 0, 0] }),
        /* @__PURE__ */ jsx(Line, { type: "monotone", dataKey: "ventes", name: "Ventes", stroke: "var(--chart-1)", strokeWidth: 2.5, dot: false })
      ] }) }) }) }),
      /* @__PURE__ */ jsx(SectionCard, { title: "Structure financière", description: "CA, achats, marge et paiements", headerGradient: true, children: /* @__PURE__ */ jsx(ChartFrame, { loading, className: "h-80", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(BarChart, { data: financeStructure, margin: {
        left: -10,
        right: 8
      }, children: [
        /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: grid, vertical: false }),
        /* @__PURE__ */ jsx(XAxis, { dataKey: "name", tickLine: false, axisLine: false, fontSize: 11, stroke: axis }),
        /* @__PURE__ */ jsx(YAxis, { tickLine: false, axisLine: false, fontSize: 11, stroke: axis, tickFormatter: (v) => `${v / 1e3}k` }),
        /* @__PURE__ */ jsx(Tooltip, { formatter: (v) => fmtCurrency(v, currencyCode) }),
        /* @__PURE__ */ jsx(Bar, { dataKey: "value", name: "Montant", radius: [4, 4, 0, 0], children: financeStructure.map((_, i) => /* @__PURE__ */ jsx(Cell, { fill: pieColors[i % pieColors.length] }, i)) })
      ] }) }) }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3", children: [
      /* @__PURE__ */ jsx(SectionCard, { title: "Top produits", description: "Unités vendues", headerGradient: true, children: /* @__PURE__ */ jsx(ChartFrame, { loading, className: "h-64", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(BarChart, { data: topProducts, layout: "vertical", margin: {
        left: 32,
        right: 16
      }, children: [
        /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: grid, horizontal: false }),
        /* @__PURE__ */ jsx(XAxis, { type: "number", tickLine: false, axisLine: false, fontSize: 11, stroke: axis }),
        /* @__PURE__ */ jsx(YAxis, { type: "category", dataKey: "nom", tickLine: false, axisLine: false, width: 130, fontSize: 10, stroke: axis }),
        /* @__PURE__ */ jsx(Tooltip, { cursor: {
          fill: "var(--secondary)"
        } }),
        /* @__PURE__ */ jsx(Bar, { dataKey: "ventes", name: "Unités", fill: "var(--chart-2)", radius: [0, 4, 4, 0], barSize: 16 })
      ] }) }) }) }),
      /* @__PURE__ */ jsx(SectionCard, { title: "Top clients", description: "Chiffre d'affaires", headerGradient: true, children: /* @__PURE__ */ jsx(ChartFrame, { loading: chartLoading, className: "h-64", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(BarChart, { data: topClients, layout: "vertical", margin: {
        left: 32,
        right: 16
      }, children: [
        /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: grid, horizontal: false }),
        /* @__PURE__ */ jsx(XAxis, { type: "number", tickLine: false, axisLine: false, fontSize: 11, stroke: axis, tickFormatter: (v) => `${v / 1e3}k` }),
        /* @__PURE__ */ jsx(YAxis, { type: "category", dataKey: "client", tickLine: false, axisLine: false, width: 130, fontSize: 10, stroke: axis }),
        /* @__PURE__ */ jsx(Tooltip, { formatter: (v) => fmtCurrency(v, currencyCode), cursor: {
          fill: "var(--secondary)"
        } }),
        /* @__PURE__ */ jsx(Bar, { dataKey: "chiffreAffaires", name: "CA", fill: "var(--chart-1)", radius: [0, 4, 4, 0], barSize: 16 })
      ] }) }) }) }),
      /* @__PURE__ */ jsx(SectionCard, { title: "Répartition des stocks", description: "Par catégorie", headerGradient: true, children: /* @__PURE__ */ jsx(ChartFrame, { loading, className: "h-64", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(PieChart, { children: [
        /* @__PURE__ */ jsx(Pie, { data: stockSplit, dataKey: "value", nameKey: "name", innerRadius: 45, outerRadius: 82, paddingAngle: 3, children: stockSplit.map((_, i) => /* @__PURE__ */ jsx(Cell, { fill: pieColors[i % pieColors.length] }, i)) }),
        /* @__PURE__ */ jsx(Tooltip, { formatter: (v, n) => [`${v} %`, n] }),
        /* @__PURE__ */ jsx(Legend, { iconType: "circle", wrapperStyle: {
          fontSize: 11
        } })
      ] }) }) }) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mt-4", children: /* @__PURE__ */ jsx(SectionCard, { title: "Historique journalier de l'activité", description: "Ventes, achats, marge et paiements sur longue période", headerGradient: true, children: /* @__PURE__ */ jsx(ChartFrame, { loading: chartLoading, className: "h-[520px]", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(ComposedChart, { data: dailyData, margin: {
      left: -10,
      right: 20,
      top: 10,
      bottom: 5
    }, children: [
      /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: grid, vertical: false }),
      /* @__PURE__ */ jsx(XAxis, { dataKey: "date", tickFormatter: shortDate, minTickGap: 28, tickLine: false, axisLine: false, fontSize: 11, stroke: axis }),
      /* @__PURE__ */ jsx(YAxis, { tickLine: false, axisLine: false, fontSize: 11, stroke: axis, tickFormatter: (v) => `${v / 1e3}k` }),
      /* @__PURE__ */ jsx(Tooltip, { labelFormatter: (label) => (/* @__PURE__ */ new Date(`${label}T00:00:00`)).toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric"
      }), formatter: (v) => fmtCurrency(v, currencyCode) }),
      /* @__PURE__ */ jsx(Legend, { iconType: "circle", wrapperStyle: {
        fontSize: 12
      } }),
      /* @__PURE__ */ jsx(Area, { type: "monotone", dataKey: "ventes", name: "Ventes", stroke: "var(--chart-1)", fill: "var(--chart-1)", fillOpacity: 0.12, strokeWidth: 2, dot: false, isAnimationActive: false }),
      /* @__PURE__ */ jsx(Line, { type: "monotone", dataKey: "achats", name: "Achats", stroke: "var(--chart-3)", strokeWidth: 2, dot: false, isAnimationActive: false }),
      /* @__PURE__ */ jsx(Line, { type: "monotone", dataKey: "marge", name: "Marge", stroke: "var(--chart-2)", strokeWidth: 2, dot: false, isAnimationActive: false }),
      /* @__PURE__ */ jsx(Line, { type: "monotone", dataKey: "paiements", name: "Paiements", stroke: "var(--chart-4)", strokeWidth: 1.8, dot: false, isAnimationActive: false }),
      /* @__PURE__ */ jsx(Brush, { dataKey: "date", height: 28, stroke: "var(--primary)", tickFormatter: shortDate, travellerWidth: 10 })
    ] }) }) }) }) })
  ] });
}
export {
  StatsPage as component
};
