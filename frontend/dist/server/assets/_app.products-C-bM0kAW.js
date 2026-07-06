import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { Download, Package } from "lucide-react";
import { P as PageHeader } from "./PageHeader-JmieIep0.js";
import { S as StatCard, a as SectionCard, T as Toolbar, P as Pagination } from "./widgets-DEep6NAy.js";
import { D as DataTable } from "./DataTable-D09_pJbn.js";
import { S as StatusBadge } from "./StatusBadge-DY_MC48T.js";
import { B as Button } from "./input-AeiaPT4J.js";
import { p as products, f as fmtCurrency, g as fmtNumber } from "./erp-data-M0p2QuEi.js";
import { toast } from "sonner";
import "@tanstack/react-router";
import "react";
import "./router-DtcNlqbc.js";
import "@tanstack/react-query";
import "clsx";
import "tailwind-merge";
import "./dropdown-menu-CEa0MGsQ.js";
import "@radix-ui/react-dropdown-menu";
import "@radix-ui/react-slot";
import "class-variance-authority";
const cols = [{
  key: "nom",
  header: "Produit",
  render: (p) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
    /* @__PURE__ */ jsx("span", { className: "flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary", children: /* @__PURE__ */ jsx(Package, { className: "h-4 w-4" }) }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("p", { className: "font-medium text-foreground", children: p.nom }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: p.ref })
    ] })
  ] })
}, {
  key: "cat",
  header: "Catégorie"
}, {
  key: "prix",
  header: "Prix",
  align: "right",
  render: (p) => /* @__PURE__ */ jsx("span", { className: "font-medium text-foreground", children: fmtCurrency(p.prix) })
}, {
  key: "stock",
  header: "Stock",
  align: "right",
  render: (p) => /* @__PURE__ */ jsx("span", { className: "text-foreground", children: fmtNumber(p.stock) })
}, {
  key: "statut",
  header: "Statut",
  align: "right",
  render: (p) => /* @__PURE__ */ jsx(StatusBadge, { status: p.statut })
}];
function ProductsPage() {
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(PageHeader, { title: "Produits", description: "Catalogue et gestion des articles", breadcrumb: ["Gestion commerciale", "Produits"], actions: /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", className: "gap-1.5", children: [
      /* @__PURE__ */ jsx(Download, { className: "h-4 w-4" }),
      " Exporter"
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4", children: [
      /* @__PURE__ */ jsx(StatCard, { label: "Total produits", value: "1 894", sub: "en catalogue", icon: /* @__PURE__ */ jsx(Package, { className: "h-5 w-5" }) }),
      /* @__PURE__ */ jsx(StatCard, { label: "Actifs", value: "1 712", sub: "disponibles", icon: /* @__PURE__ */ jsx(Package, { className: "h-5 w-5" }) }),
      /* @__PURE__ */ jsx(StatCard, { label: "Stock faible", value: "9", sub: "à réapprovisionner", icon: /* @__PURE__ */ jsx(Package, { className: "h-5 w-5" }) }),
      /* @__PURE__ */ jsx(StatCard, { label: "Ruptures", value: "3", sub: "indisponibles", icon: /* @__PURE__ */ jsx(Package, { className: "h-5 w-5" }) })
    ] }),
    /* @__PURE__ */ jsxs(SectionCard, { title: "Catalogue produits", description: "1 894 produits", action: void 0, children: [
      /* @__PURE__ */ jsx("div", { className: "mb-4", children: /* @__PURE__ */ jsx(Toolbar, { placeholder: "Rechercher un produit…", addLabel: "Ajouter un produit", onAdd: () => toast.info("Formulaire d'ajout de produit") }) }),
      /* @__PURE__ */ jsx(DataTable, { columns: cols, rows: products, rowKey: (p) => p.ref }),
      /* @__PURE__ */ jsx(Pagination, { count: 1894 })
    ] })
  ] });
}
export {
  ProductsPage as component
};
