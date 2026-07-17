import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, AreaChart, Area, PieChart, Pie, Cell } from "recharts";
import { P as PageHeader } from "./PageHeader-Dn6TWXax.js";
import { S as StatCard, a as SectionCard } from "./widgets-BO9olZIU.js";
import { f as fmtCurrency, s as salesTrend, a as stockSplit, t as topProducts } from "./erp-data-C0zPHDd1.js";
import { TrendingUp, ShoppingCart, Banknote, Warehouse } from "lucide-react";
import "@tanstack/react-router";
import "react";
import "./router-DoJhw79x.js";
import "@tanstack/react-query";
import "clsx";
import "tailwind-merge";
import "sonner";
import "./input-Cd6riMgS.js";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "react-dom";
import "./currency-oCEgfK2m.js";
const pieColors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];
const grid = "var(--border)";
const axis = "var(--muted-foreground)";
function StatsPage() {
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(PageHeader, { title: "Statistiques & analyses", description: "Indicateurs ventes, achats, stocks et finances", breadcrumb: ["Intelligence", "Statistiques"] }),
    /* @__PURE__ */ jsxs("div", { className: "mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4", children: [
      /* @__PURE__ */ jsx(StatCard, { label: "Ventes (an)", value: fmtCurrency(780300), delta: "+14 %", up: true, sub: "cumulé 2026", icon: /* @__PURE__ */ jsx(TrendingUp, { className: "h-5 w-5" }) }),
      /* @__PURE__ */ jsx(StatCard, { label: "Achats (an)", value: fmtCurrency(439400), delta: "+9 %", up: true, sub: "cumulé 2026", icon: /* @__PURE__ */ jsx(ShoppingCart, { className: "h-5 w-5" }) }),
      /* @__PURE__ */ jsx(StatCard, { label: "Marge brute", value: "43,7 %", delta: "+2,1 pts", up: true, sub: "moyenne", icon: /* @__PURE__ */ jsx(Banknote, { className: "h-5 w-5" }) }),
      /* @__PURE__ */ jsx(StatCard, { label: "Rotation stock", value: "6,2x", sub: "par an", icon: /* @__PURE__ */ jsx(Warehouse, { className: "h-5 w-5" }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-4 lg:grid-cols-2", children: [
      /* @__PURE__ */ jsx(SectionCard, { title: "Ventes vs achats", description: "Comparatif mensuel", children: /* @__PURE__ */ jsx("div", { className: "h-64", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(BarChart, { data: salesTrend, margin: {
        left: -10,
        right: 8
      }, children: [
        /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: grid, vertical: false }),
        /* @__PURE__ */ jsx(XAxis, { dataKey: "mois", tickLine: false, axisLine: false, fontSize: 11, stroke: axis }),
        /* @__PURE__ */ jsx(YAxis, { tickLine: false, axisLine: false, fontSize: 11, stroke: axis, tickFormatter: (v) => `${v / 1e3}k` }),
        /* @__PURE__ */ jsx(Tooltip, { contentStyle: {
          borderRadius: 12,
          border: `1px solid ${grid}`,
          fontSize: 12
        }, formatter: (v) => fmtCurrency(v) }),
        /* @__PURE__ */ jsx(Bar, { dataKey: "ventes", name: "Ventes", fill: "var(--chart-1)", radius: [4, 4, 0, 0] }),
        /* @__PURE__ */ jsx(Bar, { dataKey: "achats", name: "Achats", fill: "var(--chart-3)", radius: [4, 4, 0, 0] })
      ] }) }) }) }),
      /* @__PURE__ */ jsx(SectionCard, { title: "Évolution du chiffre d'affaires", description: "Tendance annuelle", children: /* @__PURE__ */ jsx("div", { className: "h-64", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(AreaChart, { data: salesTrend, margin: {
        left: -10,
        right: 8
      }, children: [
        /* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsxs("linearGradient", { id: "gStat", x1: "0", y1: "0", x2: "0", y2: "1", children: [
          /* @__PURE__ */ jsx("stop", { offset: "5%", stopColor: "var(--chart-1)", stopOpacity: 0.35 }),
          /* @__PURE__ */ jsx("stop", { offset: "95%", stopColor: "var(--chart-1)", stopOpacity: 0 })
        ] }) }),
        /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: grid, vertical: false }),
        /* @__PURE__ */ jsx(XAxis, { dataKey: "mois", tickLine: false, axisLine: false, fontSize: 11, stroke: axis }),
        /* @__PURE__ */ jsx(YAxis, { tickLine: false, axisLine: false, fontSize: 11, stroke: axis, tickFormatter: (v) => `${v / 1e3}k` }),
        /* @__PURE__ */ jsx(Tooltip, { contentStyle: {
          borderRadius: 12,
          border: `1px solid ${grid}`,
          fontSize: 12
        }, formatter: (v) => fmtCurrency(v) }),
        /* @__PURE__ */ jsx(Area, { type: "monotone", dataKey: "ventes", name: "CA", stroke: "var(--chart-1)", strokeWidth: 2.5, fill: "url(#gStat)" })
      ] }) }) }) }),
      /* @__PURE__ */ jsx(SectionCard, { title: "Répartition des stocks", description: "Par catégorie", children: /* @__PURE__ */ jsx("div", { className: "h-64", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(PieChart, { children: [
        /* @__PURE__ */ jsx(Pie, { data: stockSplit, dataKey: "value", nameKey: "name", outerRadius: 90, children: stockSplit.map((_, i) => /* @__PURE__ */ jsx(Cell, { fill: pieColors[i % pieColors.length] }, i)) }),
        /* @__PURE__ */ jsx(Tooltip, { contentStyle: {
          borderRadius: 12,
          border: `1px solid ${grid}`,
          fontSize: 12
        }, formatter: (v, n) => [`${v} %`, n] })
      ] }) }) }) }),
      /* @__PURE__ */ jsx(SectionCard, { title: "Top produits", description: "Meilleures ventes", children: /* @__PURE__ */ jsx("div", { className: "h-64", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(BarChart, { data: topProducts, layout: "vertical", margin: {
        left: 40,
        right: 16
      }, children: [
        /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: grid, horizontal: false }),
        /* @__PURE__ */ jsx(XAxis, { type: "number", tickLine: false, axisLine: false, fontSize: 11, stroke: axis }),
        /* @__PURE__ */ jsx(YAxis, { type: "category", dataKey: "nom", tickLine: false, axisLine: false, width: 150, fontSize: 10, stroke: axis }),
        /* @__PURE__ */ jsx(Tooltip, { cursor: {
          fill: "var(--secondary)"
        }, contentStyle: {
          borderRadius: 12,
          border: `1px solid ${grid}`,
          fontSize: 12
        } }),
        /* @__PURE__ */ jsx(Bar, { dataKey: "ventes", name: "Unités", fill: "var(--chart-2)", radius: [0, 4, 4, 0], barSize: 16 })
      ] }) }) }) })
    ] })
  ] });
}
export {
  StatsPage as component
};
