import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useState } from "react";
import { Receipt, ShoppingCart, Warehouse, Banknote, Sparkles, FileBarChart, FileText, Download } from "lucide-react";
import { P as PageHeader } from "./PageHeader-Dn6TWXax.js";
import { a as SectionCard } from "./widgets-DrjmuOnd.js";
import { B as Button } from "./button-BnXidLRr.js";
import { L as Label } from "./label-C2EMg7Zu.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-RIcQJGrw.js";
import { c as cn } from "./router-CbAtk_cD.js";
import { toast } from "sonner";
import "@tanstack/react-router";
import "./input-Dll8ozDh.js";
import "react-dom";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "@radix-ui/react-label";
import "@radix-ui/react-select";
import "@tanstack/react-query";
import "clsx";
import "tailwind-merge";
import "zod";
import "axios";
const types = [{
  id: "sales",
  label: "Rapport des ventes",
  icon: Receipt,
  desc: "CA, marges et top produits"
}, {
  id: "purchases",
  label: "Rapport des achats",
  icon: ShoppingCart,
  desc: "Commandes et fournisseurs"
}, {
  id: "stock",
  label: "Rapport des stocks",
  icon: Warehouse,
  desc: "Valeur, mouvements et ruptures"
}, {
  id: "finance",
  label: "Rapport financier",
  icon: Banknote,
  desc: "Trésorerie et résultats"
}];
function ReportsPage() {
  const [selected, setSelected] = useState("sales");
  const [generated, setGenerated] = useState(false);
  const active = types.find((t) => t.id === selected);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(PageHeader, { title: "Génération de rapports", description: "Créez et exportez des rapports automatiques", breadcrumb: ["Intelligence", "Rapports"] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-4 lg:grid-cols-3", children: [
      /* @__PURE__ */ jsxs(SectionCard, { title: "Configuration", description: "Choisissez le type de rapport", children: [
        /* @__PURE__ */ jsx("div", { className: "space-y-2", children: types.map((t) => /* @__PURE__ */ jsxs("button", { onClick: () => {
          setSelected(t.id);
          setGenerated(false);
        }, className: cn("flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-all", selected === t.id ? "border-primary bg-primary/5" : "border-border hover:bg-secondary/40"), children: [
          /* @__PURE__ */ jsx("span", { className: cn("flex h-9 w-9 items-center justify-center rounded-lg", selected === t.id ? "bg-gradient-primary text-white" : "bg-secondary text-muted-foreground"), children: /* @__PURE__ */ jsx(t.icon, { className: "h-4 w-4" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-foreground", children: t.label }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: t.desc })
          ] })
        ] }, t.id)) }),
        /* @__PURE__ */ jsxs("div", { className: "mt-4 space-y-1.5", children: [
          /* @__PURE__ */ jsx(Label, { children: "Période" }),
          /* @__PURE__ */ jsxs(Select, { defaultValue: "month", children: [
            /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsx(SelectItem, { value: "month", children: "Ce mois-ci" }),
              /* @__PURE__ */ jsx(SelectItem, { value: "quarter", children: "Ce trimestre" }),
              /* @__PURE__ */ jsx(SelectItem, { value: "year", children: "Cette année" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs(Button, { className: "mt-4 w-full gap-1.5", onClick: () => {
          setGenerated(true);
          toast.success("Rapport généré");
        }, children: [
          /* @__PURE__ */ jsx(Sparkles, { className: "h-4 w-4" }),
          " Générer le rapport"
        ] })
      ] }),
      /* @__PURE__ */ jsx(SectionCard, { title: "Prévisualisation", description: active.label, className: "lg:col-span-2", action: generated && /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", className: "gap-1.5", onClick: () => toast.success("PDF exporté"), children: [
        /* @__PURE__ */ jsx(Download, { className: "h-4 w-4" }),
        " Exporter PDF"
      ] }), children: !generated ? /* @__PURE__ */ jsxs("div", { className: "flex h-80 flex-col items-center justify-center gap-3 text-center", children: [
        /* @__PURE__ */ jsx("span", { className: "flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-muted-foreground", children: /* @__PURE__ */ jsx(FileBarChart, { className: "h-7 w-7" }) }),
        /* @__PURE__ */ jsxs("p", { className: "text-sm text-muted-foreground", children: [
          "Configurez puis générez un rapport",
          /* @__PURE__ */ jsx("br", {}),
          "pour afficher la prévisualisation."
        ] })
      ] }) : /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-border p-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between border-b border-border pb-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h3", { className: "font-display text-lg font-bold text-foreground", children: active.label }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Période : Juin 2026 · Généré le 10 juin 2026" })
          ] }),
          /* @__PURE__ */ jsx(FileText, { className: "h-8 w-8 text-primary" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "mt-4 grid grid-cols-3 gap-4", children: [{
          k: "Total",
          v: "284 750 f"
        }, {
          k: "Croissance",
          v: "+12,4 %"
        }, {
          k: "Transactions",
          v: "1 248"
        }].map((s) => /* @__PURE__ */ jsxs("div", { className: "rounded-lg bg-secondary/50 p-3", children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: s.k }),
          /* @__PURE__ */ jsx("p", { className: "text-lg font-bold text-foreground", children: s.v })
        ] }, s.k)) }),
        /* @__PURE__ */ jsx("p", { className: "mt-4 text-sm leading-relaxed text-muted-foreground", children: "Synthèse automatique : la période analysée affiche une performance solide avec une croissance de 12,4 %. Les indicateurs clés sont en progression, portés par le segment Informatique. Aucun risque financier majeur détecté." })
      ] }) })
    ] })
  ] });
}
export {
  ReportsPage as component
};
