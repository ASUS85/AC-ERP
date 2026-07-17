import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Line } from "recharts";
import { TrendingUp, BrainCircuit, AlertTriangle, Lightbulb } from "lucide-react";
import { P as PageHeader } from "./PageHeader-Dn6TWXax.js";
import { S as StatCard, a as SectionCard } from "./widgets-BO9olZIU.js";
import { S as StatusBadge } from "./StatusBadge-DzwZoZIv.js";
import { f as fmtCurrency, g as salesForecast, h as stockRisks } from "./erp-data-C0zPHDd1.js";
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
const recommendations = ['Réapprovisionner « Écran 27" 4K » sous 8 jours pour éviter une rupture.', "Augmenter le stock de « Casque sans fil ANC » de 20 % avant le pic de demande.", "Proposer une remise ciblée sur « Souris ergonomique » (rotation élevée).", "Négocier un délai plus court avec NordTech (livraisons les plus lentes)."];
function AiPage() {
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(PageHeader, { title: "Prévisions & intelligence artificielle", description: "Anticipez ventes, stocks et risques", breadcrumb: ["Intelligence", "Prévisions IA"] }),
    /* @__PURE__ */ jsxs("div", { className: "mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4", children: [
      /* @__PURE__ */ jsx(StatCard, { label: "CA prévu (juil.)", value: fmtCurrency(98200), delta: "+6,2 %", up: true, sub: "vs juin", icon: /* @__PURE__ */ jsx(TrendingUp, { className: "h-5 w-5" }) }),
      /* @__PURE__ */ jsx(StatCard, { label: "Fiabilité du modèle", value: "92 %", sub: "précision", icon: /* @__PURE__ */ jsx(BrainCircuit, { className: "h-5 w-5" }) }),
      /* @__PURE__ */ jsx(StatCard, { label: "Produits à risque", value: "4", sub: "rupture probable", icon: /* @__PURE__ */ jsx(AlertTriangle, { className: "h-5 w-5" }) }),
      /* @__PURE__ */ jsx(StatCard, { label: "Recommandations", value: "12", sub: "actions suggérées", icon: /* @__PURE__ */ jsx(Lightbulb, { className: "h-5 w-5" }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-4 lg:grid-cols-3", children: [
      /* @__PURE__ */ jsx(SectionCard, { title: "Prévision des ventes", description: "Projection sur 6 mois (modèle prédictif)", className: "lg:col-span-2", children: /* @__PURE__ */ jsx("div", { className: "h-72", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(LineChart, { data: salesForecast, margin: {
        left: -8,
        right: 8,
        top: 8
      }, children: [
        /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "var(--border)", vertical: false }),
        /* @__PURE__ */ jsx(XAxis, { dataKey: "mois", tickLine: false, axisLine: false, fontSize: 12, stroke: "var(--muted-foreground)" }),
        /* @__PURE__ */ jsx(YAxis, { tickLine: false, axisLine: false, fontSize: 12, stroke: "var(--muted-foreground)", tickFormatter: (v) => `${v / 1e3}k` }),
        /* @__PURE__ */ jsx(Tooltip, { contentStyle: {
          borderRadius: 12,
          border: "1px solid var(--border)",
          fontSize: 12
        }, formatter: (v) => fmtCurrency(v) }),
        /* @__PURE__ */ jsx(Line, { type: "monotone", dataKey: "reel", name: "Réel", stroke: "var(--chart-1)", strokeWidth: 2.5, dot: {
          r: 3
        }, connectNulls: true }),
        /* @__PURE__ */ jsx(Line, { type: "monotone", dataKey: "prevu", name: "Prévision IA", stroke: "var(--chart-3)", strokeWidth: 2.5, strokeDasharray: "6 4", dot: {
          r: 3
        } })
      ] }) }) }) }),
      /* @__PURE__ */ jsx(SectionCard, { title: "Recommandations IA", description: "Actions prioritaires", children: /* @__PURE__ */ jsx("div", { className: "space-y-3", children: recommendations.map((r) => /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 rounded-lg border border-border p-3", children: [
        /* @__PURE__ */ jsx("span", { className: "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-info/12 text-info", children: /* @__PURE__ */ jsx(Lightbulb, { className: "h-4 w-4" }) }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-foreground", children: r })
      ] }, r)) }) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mt-4", children: /* @__PURE__ */ jsx(SectionCard, { title: "Risques de rupture de stock", description: "Produits critiques détectés par l'IA", children: /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground", children: [
        /* @__PURE__ */ jsx("th", { className: "px-3 py-2.5 font-medium first:pl-1", children: "Produit" }),
        /* @__PURE__ */ jsx("th", { className: "px-3 py-2.5 text-right font-medium", children: "Stock actuel" }),
        /* @__PURE__ */ jsx("th", { className: "px-3 py-2.5 text-right font-medium", children: "Rupture estimée" }),
        /* @__PURE__ */ jsx("th", { className: "px-3 py-2.5 text-right font-medium", children: "Niveau de risque" })
      ] }) }),
      /* @__PURE__ */ jsx("tbody", { children: stockRisks.map((s) => /* @__PURE__ */ jsxs("tr", { className: "border-b border-border/60 last:border-0 hover:bg-secondary/40", children: [
        /* @__PURE__ */ jsx("td", { className: "px-3 py-3.5 font-medium text-foreground first:pl-1", children: s.produit }),
        /* @__PURE__ */ jsxs("td", { className: "px-3 py-3.5 text-right text-foreground", children: [
          s.stock,
          " unités"
        ] }),
        /* @__PURE__ */ jsx("td", { className: "px-3 py-3.5 text-right text-muted-foreground", children: s.jours === 0 ? "Immédiate" : `~ ${s.jours} jours` }),
        /* @__PURE__ */ jsx("td", { className: "px-3 py-3.5 text-right", children: /* @__PURE__ */ jsx(StatusBadge, { status: s.risque }) })
      ] }, s.produit)) })
    ] }) }) }) })
  ] });
}
export {
  AiPage as component
};
