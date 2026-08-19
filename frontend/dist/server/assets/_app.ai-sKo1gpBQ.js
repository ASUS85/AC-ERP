import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useState, useRef, useEffect } from "react";
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Line } from "recharts";
import { TrendingUp, BrainCircuit, AlertTriangle, Lightbulb } from "lucide-react";
import { P as PageHeader } from "./PageHeader-CfvoM4wf.js";
import { S as StatCard, a as SectionCard } from "./widgets-CpNLLYbf.js";
import { C as ChartFrame } from "./ChartFrame-CZaxVeaS.js";
import { S as StatusBadge } from "./StatusBadge-uJo4wGa2.js";
import { f as fmtCurrency } from "./erp-data-lC_Sts2J.js";
import { c as getPrevisions } from "./ia.service-DnLpN5qT.js";
import { S as Skeleton } from "./skeleton-O68sTdxD.js";
import { toast } from "sonner";
import "@tanstack/react-router";
import "./router-Ccz3J_v4.js";
import "@tanstack/react-query";
import "clsx";
import "tailwind-merge";
import "zod";
import "zustand";
import "axios";
import "./input-Bk3f2XgL.js";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "react-dom";
import "./currency-BmQmAj7J.js";
function riskLevel(days) {
  if (days === null || days <= 7) return "Critique";
  if (days <= 14) return "Élevé";
  if (days <= 30) return "Moyen";
  return "Faible";
}
function AiPage() {
  const [previsions, setPrevisions] = useState();
  const [loading, setLoading] = useState(true);
  const hasLoadedPrevisions = useRef(false);
  useEffect(() => {
    if (hasLoadedPrevisions.current) return;
    hasLoadedPrevisions.current = true;
    async function loadPrevisions() {
      try {
        const response = await getPrevisions();
        setPrevisions(response.data);
      } catch {
        toast.error("Impossible de charger les prévisions IA");
      } finally {
        setLoading(false);
      }
    }
    void loadPrevisions();
  }, []);
  const salesForecast = (previsions?.previsionsMensuelles ?? []).map((forecast) => ({
    mois: new Intl.DateTimeFormat("fr-FR", {
      month: "short",
      year: "numeric"
    }).format(/* @__PURE__ */ new Date(`${forecast.mois}-01T00:00:00`)),
    reel: null,
    prevu: forecast.montantPrevu
  }));
  const produitsRisque = previsions?.produitsRisque ?? [];
  const recommandations = previsions?.recommandations ?? [];
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(PageHeader, { title: "Prévisions & intelligence artificielle", description: "Anticipez ventes, stocks et risques", breadcrumb: ["Intelligence", "Prévisions IA"] }),
    /* @__PURE__ */ jsxs("div", { className: "mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4", children: [
      /* @__PURE__ */ jsx(StatCard, { label: "CA prévu (prochain mois)", value: loading ? /* @__PURE__ */ jsx(Skeleton, { className: "h-8 w-32" }) : fmtCurrency(previsions?.caPrevu ?? 0), delta: "Projection IA", up: true, sub: "sur les 6 prochains mois", icon: /* @__PURE__ */ jsx(TrendingUp, { className: "h-5 w-5" }) }),
      /* @__PURE__ */ jsx(StatCard, { label: "Fiabilité du modèle", value: loading ? /* @__PURE__ */ jsx(Skeleton, { className: "h-8 w-16" }) : `${previsions?.fiabilite ?? 0} %`, sub: "précision", icon: /* @__PURE__ */ jsx(BrainCircuit, { className: "h-5 w-5" }) }),
      /* @__PURE__ */ jsx(StatCard, { label: "Produits à risque", value: loading ? /* @__PURE__ */ jsx(Skeleton, { className: "h-8 w-10" }) : String(produitsRisque.length), sub: "rupture probable", icon: /* @__PURE__ */ jsx(AlertTriangle, { className: "h-5 w-5" }) }),
      /* @__PURE__ */ jsx(StatCard, { label: "Recommandations", value: loading ? /* @__PURE__ */ jsx(Skeleton, { className: "h-8 w-10" }) : String(recommandations.length), sub: "actions suggérées", icon: /* @__PURE__ */ jsx(Lightbulb, { className: "h-5 w-5" }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-4 lg:grid-cols-3", children: [
      /* @__PURE__ */ jsx(SectionCard, { title: "Prévision des ventes", description: "Projection sur 6 mois (modèle prédictif)", className: "lg:col-span-2", children: /* @__PURE__ */ jsx(ChartFrame, { loading, className: "h-72", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(LineChart, { data: salesForecast, margin: {
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
      /* @__PURE__ */ jsx(SectionCard, { title: "Recommandations IA", description: "Actions prioritaires", children: /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
        recommandations.map((r) => /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 rounded-lg border border-border p-3", children: [
          /* @__PURE__ */ jsx("span", { className: "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-info/12 text-info", children: /* @__PURE__ */ jsx(Lightbulb, { className: "h-4 w-4" }) }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-foreground", children: r })
        ] }, r)),
        !loading && recommandations.length === 0 && /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Aucune recommandation disponible pour le moment." })
      ] }) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mt-4", children: /* @__PURE__ */ jsx(SectionCard, { title: "Risques de rupture de stock", description: "Produits critiques détectés par l'IA", children: /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground", children: [
        /* @__PURE__ */ jsx("th", { className: "px-3 py-2.5 font-medium first:pl-1", children: "Produit" }),
        /* @__PURE__ */ jsx("th", { className: "px-3 py-2.5 text-right font-medium", children: "Stock actuel" }),
        /* @__PURE__ */ jsx("th", { className: "px-3 py-2.5 text-right font-medium", children: "Rupture estimée" }),
        /* @__PURE__ */ jsx("th", { className: "px-3 py-2.5 text-right font-medium", children: "Niveau de risque" })
      ] }) }),
      /* @__PURE__ */ jsxs("tbody", { children: [
        produitsRisque.map((s) => /* @__PURE__ */ jsxs("tr", { className: "border-b border-border/60 last:border-0 hover:bg-secondary/40", children: [
          /* @__PURE__ */ jsx("td", { className: "px-3 py-3.5 font-medium text-foreground first:pl-1", children: s.produit }),
          /* @__PURE__ */ jsxs("td", { className: "px-3 py-3.5 text-right text-foreground", children: [
            s.stockActuel,
            " unités"
          ] }),
          /* @__PURE__ */ jsx("td", { className: "px-3 py-3.5 text-right text-muted-foreground", children: s.joursAvantRupture === null ? "À surveiller" : s.joursAvantRupture <= 0 ? "Immédiate" : `~ ${s.joursAvantRupture} jours` }),
          /* @__PURE__ */ jsx("td", { className: "px-3 py-3.5 text-right", children: /* @__PURE__ */ jsx(StatusBadge, { status: riskLevel(s.joursAvantRupture) }) })
        ] }, s.idProduit)),
        !loading && produitsRisque.length === 0 && /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 4, className: "px-3 py-8 text-center text-muted-foreground", children: "Aucun risque de rupture détecté." }) })
      ] })
    ] }) }) }) })
  ] });
}
export {
  AiPage as component
};
