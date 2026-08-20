import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useState } from "react";
import { Receipt, ShoppingCart, Warehouse, Banknote, LoaderCircle, Sparkles, FileBarChart, FileText, Download } from "lucide-react";
import { P as PageHeader } from "./PageHeader-D6EtHCBB.js";
import { a as SectionCard } from "./widgets-CNypZ_eQ.js";
import { B as Button } from "./input-DWqQzZ0E.js";
import { L as Label } from "./label-ZHiV1bgf.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-DFP2BSph.js";
import { c as cn } from "./router-DPN3mKuc.js";
import { toast } from "sonner";
import { g as genererRapport, t as telechargerRapportPdf } from "./ia.service-vW4D89eG.js";
import { S as Skeleton } from "./skeleton-BWJ4xDE4.js";
import "@tanstack/react-router";
import "react-dom";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "@radix-ui/react-label";
import "@radix-ui/react-select";
import "@tanstack/react-query";
import "clsx";
import "tailwind-merge";
import "zod";
import "zustand";
import "axios";
const types = [{
  id: "ventes",
  label: "Rapport des ventes",
  icon: Receipt,
  desc: "CA, marges et top produits"
}, {
  id: "achats",
  label: "Rapport des achats",
  icon: ShoppingCart,
  desc: "Commandes et fournisseurs"
}, {
  id: "stocks",
  label: "Rapport des stocks",
  icon: Warehouse,
  desc: "Valeur, mouvements et ruptures"
}, {
  id: "financier",
  label: "Rapport financier",
  icon: Banknote,
  desc: "Trésorerie et résultats"
}];
const periodLabels = {
  semaine: "Cette semaine",
  mois: "Ce mois-ci",
  trimestre: "Ce trimestre",
  annee: "Cette année"
};
function ReportsPage() {
  const [selected, setSelected] = useState("ventes");
  const [periode, setPeriode] = useState("mois");
  const [report, setReport] = useState();
  const [generating, setGenerating] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const active = types.find((t) => t.id === selected);
  const generate = async () => {
    setGenerating(true);
    try {
      const response = await genererRapport(selected, periode);
      setReport(response.data);
      toast.success("Rapport généré à partir des données ERP");
    } catch (error) {
      const message = typeof error === "object" && error && "message" in error ? String(error.message) : "Impossible de générer le rapport";
      toast.error(message);
    } finally {
      setGenerating(false);
    }
  };
  const downloadReport = async () => {
    if (!report || downloading) return;
    setDownloading(true);
    try {
      const blob = await telechargerRapportPdf(report.id);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `rapport-${report.typeRapport}-${report.periode}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 0);
      toast.success("Rapport PDF téléchargé");
    } catch (error) {
      const message = typeof error === "object" && error && "message" in error ? String(error.message) : "Impossible de télécharger le rapport PDF";
      toast.error(message);
    } finally {
      setDownloading(false);
    }
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(PageHeader, { title: "Génération de rapports", description: "Créez et exportez des rapports automatiques", breadcrumb: ["Intelligence", "Rapports"] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-4 lg:grid-cols-3", children: [
      /* @__PURE__ */ jsxs(SectionCard, { title: "Configuration", description: "Choisissez le type de rapport", children: [
        /* @__PURE__ */ jsx("div", { className: "space-y-2", children: types.map((t) => /* @__PURE__ */ jsxs("button", { onClick: () => {
          setSelected(t.id);
          setReport(void 0);
        }, className: cn("flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-all", selected === t.id ? "border-primary bg-primary/5" : "border-border hover:bg-secondary/40"), children: [
          /* @__PURE__ */ jsx("span", { className: cn("flex h-9 w-9 items-center justify-center rounded-lg", selected === t.id ? "bg-gradient-primary text-white" : "bg-secondary text-muted-foreground"), children: /* @__PURE__ */ jsx(t.icon, { className: "h-4 w-4" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-foreground", children: t.label }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: t.desc })
          ] })
        ] }, t.id)) }),
        /* @__PURE__ */ jsxs("div", { className: "mt-4 space-y-1.5", children: [
          /* @__PURE__ */ jsx(Label, { children: "Période" }),
          /* @__PURE__ */ jsxs(Select, { value: periode, onValueChange: (value) => {
            setPeriode(value);
            setReport(void 0);
          }, children: [
            /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsx(SelectItem, { value: "semaine", children: "Cette semaine" }),
              /* @__PURE__ */ jsx(SelectItem, { value: "mois", children: "Ce mois-ci" }),
              /* @__PURE__ */ jsx(SelectItem, { value: "trimestre", children: "Ce trimestre" }),
              /* @__PURE__ */ jsx(SelectItem, { value: "annee", children: "Cette année" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs(Button, { className: "mt-4 w-full gap-1.5", onClick: () => void generate(), disabled: generating, children: [
          generating ? /* @__PURE__ */ jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsx(Sparkles, { className: "h-4 w-4" }),
          generating ? "Génération en cours..." : "Générer le rapport"
        ] })
      ] }),
      /* @__PURE__ */ jsx(SectionCard, { title: "Prévisualisation", description: active.label, className: "lg:col-span-2", action: report && /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", className: "gap-1.5", onClick: () => void downloadReport(), disabled: downloading, children: [
        downloading ? /* @__PURE__ */ jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsx(Download, { className: "h-4 w-4" }),
        "Télécharger le PDF"
      ] }), children: generating ? /* @__PURE__ */ jsxs("div", { className: "space-y-5", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Skeleton, { className: "h-5 w-48" }),
            /* @__PURE__ */ jsx(Skeleton, { className: "h-3 w-32" })
          ] }),
          /* @__PURE__ */ jsx(Skeleton, { className: "h-8 w-8 rounded-full" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 gap-4", children: [
          /* @__PURE__ */ jsx(Skeleton, { className: "h-20" }),
          /* @__PURE__ */ jsx(Skeleton, { className: "h-20" }),
          /* @__PURE__ */ jsx(Skeleton, { className: "h-20" })
        ] }),
        /* @__PURE__ */ jsx(Skeleton, { className: "h-72 w-full" })
      ] }) : !report ? /* @__PURE__ */ jsxs("div", { className: "flex h-80 flex-col items-center justify-center gap-3 text-center", children: [
        /* @__PURE__ */ jsx("span", { className: "flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-muted-foreground", children: /* @__PURE__ */ jsx(FileBarChart, { className: "h-7 w-7" }) }),
        /* @__PURE__ */ jsxs("p", { className: "text-sm text-muted-foreground", children: [
          "Configurez puis générez un rapport",
          /* @__PURE__ */ jsx("br", {}),
          "pour afficher la prévisualisation."
        ] })
      ] }) : /* @__PURE__ */ jsxs("div", { className: "overflow-hidden rounded-lg border border-border", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between border-b border-border px-4 py-3", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h3", { className: "font-display text-lg font-bold text-foreground", children: active.label }),
            /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
              "Période : ",
              periodLabels[report.periode]
            ] })
          ] }),
          /* @__PURE__ */ jsx(FileText, { className: "h-8 w-8 text-primary" })
        ] }),
        report.html ? /* @__PURE__ */ jsx("iframe", { title: `Prévisualisation ${active.label}`, srcDoc: report.html, className: "h-[620px] w-full bg-white" }) : /* @__PURE__ */ jsx("p", { className: "p-5 text-sm leading-relaxed text-muted-foreground", children: report.contenu })
      ] }) })
    ] })
  ] });
}
export {
  ReportsPage as component
};
