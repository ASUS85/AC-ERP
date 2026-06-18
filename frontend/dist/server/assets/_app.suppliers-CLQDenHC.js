import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { Truck, ShoppingCart, Package } from "lucide-react";
import { P as PageHeader } from "./PageHeader-JmieIep0.js";
import { S as StatCard, a as SectionCard, T as Toolbar, P as Pagination } from "./widgets-Cox8fFgr.js";
import { D as DataTable } from "./DataTable-DyNXzAjJ.js";
import { S as StatusBadge } from "./StatusBadge-DlT8mfWJ.js";
import { c as suppliers, f as fmtCurrency } from "./erp-data-CMZQ6Smj.js";
import { toast } from "sonner";
import "@tanstack/react-router";
import "react";
import "./input-DooCX65b.js";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
const cols = [{
  key: "nom",
  header: "Fournisseur",
  render: (s) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
    /* @__PURE__ */ jsx("span", { className: "flex h-9 w-9 items-center justify-center rounded-lg bg-warning/15 text-warning-foreground", children: /* @__PURE__ */ jsx(Truck, { className: "h-4 w-4" }) }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("p", { className: "font-medium text-foreground", children: s.nom }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: s.email })
    ] })
  ] })
}, {
  key: "ville",
  header: "Ville"
}, {
  key: "commandes",
  header: "Commandes",
  align: "right"
}, {
  key: "total",
  header: "Total achats",
  align: "right",
  render: (s) => /* @__PURE__ */ jsx("span", { className: "font-medium text-foreground", children: fmtCurrency(s.total) })
}, {
  key: "statut",
  header: "Statut",
  align: "right",
  render: (s) => /* @__PURE__ */ jsx(StatusBadge, { status: s.statut })
}];
function SuppliersPage() {
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(PageHeader, { title: "Fournisseurs", description: "Coordonnées, commandes et statistiques", breadcrumb: ["Gestion commerciale", "Fournisseurs"] }),
    /* @__PURE__ */ jsxs("div", { className: "mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4", children: [
      /* @__PURE__ */ jsx(StatCard, { label: "Fournisseurs", value: "87", sub: "actifs", icon: /* @__PURE__ */ jsx(Truck, { className: "h-5 w-5" }) }),
      /* @__PURE__ */ jsx(StatCard, { label: "Commandes", value: "152", sub: "ce trimestre", icon: /* @__PURE__ */ jsx(ShoppingCart, { className: "h-5 w-5" }) }),
      /* @__PURE__ */ jsx(StatCard, { label: "Volume d'achats", value: "555 600 €", sub: "cumulé", icon: /* @__PURE__ */ jsx(Package, { className: "h-5 w-5" }) }),
      /* @__PURE__ */ jsx(StatCard, { label: "Délai moyen", value: "4,2 j", sub: "de livraison", icon: /* @__PURE__ */ jsx(Truck, { className: "h-5 w-5" }) })
    ] }),
    /* @__PURE__ */ jsxs(SectionCard, { title: "Liste des fournisseurs", children: [
      /* @__PURE__ */ jsx("div", { className: "mb-4", children: /* @__PURE__ */ jsx(Toolbar, { placeholder: "Rechercher un fournisseur…", addLabel: "Ajouter un fournisseur", onAdd: () => toast.info("Ajout d'un fournisseur") }) }),
      /* @__PURE__ */ jsx(DataTable, { columns: cols, rows: suppliers, rowKey: (s) => s.email }),
      /* @__PURE__ */ jsx(Pagination, { count: 87 })
    ] })
  ] });
}
export {
  SuppliersPage as component
};
