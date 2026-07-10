import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { ArrowDownToLine, ClipboardList, Warehouse, ArrowUpFromLine, AlertTriangle } from "lucide-react";
import { P as PageHeader } from "./PageHeader-Dn6TWXax.js";
import { S as StatCard, a as SectionCard, T as Toolbar } from "./widgets-CMPdIU-O.js";
import { D as DataTable } from "./DataTable-BdeZJD0g.js";
import { S as StatusBadge } from "./StatusBadge-DSMu8YcM.js";
import { B as Button } from "./input-Dis5tVWN.js";
import { h as stockMovements, p as products } from "./erp-data-Dpg9mwIn.js";
import { c as cn } from "./router-BPNLrioU.js";
import { toast } from "sonner";
import "@tanstack/react-router";
import "react";
import "./dropdown-menu-D2wOmaKU.js";
import "@radix-ui/react-dropdown-menu";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "@tanstack/react-query";
import "clsx";
import "tailwind-merge";
const cols = [{
  key: "ref",
  header: "Référence",
  render: (m) => /* @__PURE__ */ jsx("span", { className: "font-medium text-foreground", children: m.ref })
}, {
  key: "produit",
  header: "Produit"
}, {
  key: "type",
  header: "Type",
  render: (m) => /* @__PURE__ */ jsx(StatusBadge, { status: m.type })
}, {
  key: "qte",
  header: "Quantité",
  align: "right",
  render: (m) => /* @__PURE__ */ jsxs("span", { className: cn("font-medium", m.type === "Entrée" ? "text-success" : "text-info"), children: [
    m.type === "Entrée" ? "+" : "−",
    m.qte
  ] })
}, {
  key: "depot",
  header: "Dépôt"
}, {
  key: "date",
  header: "Date",
  align: "right"
}];
const lowStock = products.filter((p) => p.statut !== "Actif");
function InventoryPage() {
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(PageHeader, { title: "Gestion des stocks", description: "Vue globale, mouvements et alertes de rupture", breadcrumb: ["Gestion commerciale", "Stocks"], actions: /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", className: "gap-1.5", onClick: () => toast.info("Nouvelle entrée de stock"), children: [
        /* @__PURE__ */ jsx(ArrowDownToLine, { className: "h-4 w-4" }),
        " Entrée"
      ] }),
      /* @__PURE__ */ jsxs(Button, { size: "sm", className: "gap-1.5", onClick: () => toast.info("Nouvel inventaire"), children: [
        /* @__PURE__ */ jsx(ClipboardList, { className: "h-4 w-4" }),
        " Inventaire"
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4", children: [
      /* @__PURE__ */ jsx(StatCard, { label: "Valeur du stock", value: "512 300 f", delta: "-2,8 %", sub: "vs mois dernier", icon: /* @__PURE__ */ jsx(Warehouse, { className: "h-5 w-5" }) }),
      /* @__PURE__ */ jsx(StatCard, { label: "Entrées (30j)", value: "1 240", sub: "unités reçues", icon: /* @__PURE__ */ jsx(ArrowDownToLine, { className: "h-5 w-5" }) }),
      /* @__PURE__ */ jsx(StatCard, { label: "Sorties (30j)", value: "982", sub: "unités expédiées", icon: /* @__PURE__ */ jsx(ArrowUpFromLine, { className: "h-5 w-5" }) }),
      /* @__PURE__ */ jsx(StatCard, { label: "Alertes rupture", value: "3", sub: "produits critiques", icon: /* @__PURE__ */ jsx(AlertTriangle, { className: "h-5 w-5" }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-4 lg:grid-cols-3", children: [
      /* @__PURE__ */ jsxs(SectionCard, { title: "Mouvements de stock", description: "Entrées et sorties récentes", className: "lg:col-span-2", children: [
        /* @__PURE__ */ jsx("div", { className: "mb-4", children: /* @__PURE__ */ jsx(Toolbar, { placeholder: "Rechercher un mouvement…" }) }),
        /* @__PURE__ */ jsx(DataTable, { columns: cols, rows: stockMovements, rowKey: (m) => m.ref, withActions: false })
      ] }),
      /* @__PURE__ */ jsx(SectionCard, { title: "Alertes de rupture", description: "Produits à réapprovisionner", children: /* @__PURE__ */ jsx("div", { className: "space-y-3", children: lowStock.map((p) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-2 rounded-lg border border-border p-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsx("p", { className: "truncate text-sm font-medium text-foreground", children: p.nom }),
          /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
            "Stock : ",
            p.stock,
            " unités"
          ] })
        ] }),
        /* @__PURE__ */ jsx(StatusBadge, { status: p.statut })
      ] }, p.ref)) }) })
    ] })
  ] });
}
export {
  InventoryPage as component
};
