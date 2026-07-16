import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { FolderTree, ChevronRight, Folder } from "lucide-react";
import { P as PageHeader } from "./PageHeader-Dn6TWXax.js";
import { a as SectionCard, T as Toolbar } from "./widgets-D8uCN_-E.js";
import { D as DataTable } from "./DataTable-Dj3dfIqk.js";
import { j as categories } from "./erp-data-DdbAvP8x.js";
import { toast } from "sonner";
import "@tanstack/react-router";
import "react";
import "./router-C1QYPkjn.js";
import "@tanstack/react-query";
import "clsx";
import "tailwind-merge";
import "./input-DRGbboqL.js";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "react-dom";
import "./dropdown-menu-CQ-LP4ME.js";
import "@radix-ui/react-dropdown-menu";
import "./currency-oCEgfK2m.js";
const cols = [{
  key: "nom",
  header: "Catégorie",
  render: (c) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
    /* @__PURE__ */ jsx("span", { className: "flex h-8 w-8 items-center justify-center rounded-lg bg-info/12 text-info", children: /* @__PURE__ */ jsx(Folder, { className: "h-4 w-4" }) }),
    /* @__PURE__ */ jsx("span", { className: "font-medium text-foreground", children: c.nom })
  ] })
}, {
  key: "desc",
  header: "Description"
}, {
  key: "parent",
  header: "Parent"
}, {
  key: "produits",
  header: "Produits",
  align: "right",
  render: (c) => /* @__PURE__ */ jsx("span", { className: "font-medium text-foreground", children: c.produits })
}];
const tree = [{
  name: "Informatique",
  count: 642,
  children: ["Ordinateurs", "Composants", "Réseau"]
}, {
  name: "Accessoires",
  count: 458,
  children: ["Claviers & souris", "Audio"]
}, {
  name: "Mobilier",
  count: 214,
  children: ["Bureaux", "Sièges"]
}, {
  name: "Consommables",
  count: 392,
  children: ["Encre & toner", "Papeterie"]
}];
function CategoriesPage() {
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(PageHeader, { title: "Catégories", description: "Organisation arborescente du catalogue", breadcrumb: ["Gestion commerciale", "Catégories"] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-4 lg:grid-cols-3", children: [
      /* @__PURE__ */ jsx(SectionCard, { title: "Arborescence", description: "Structure des catégories", children: /* @__PURE__ */ jsx("div", { className: "space-y-1", children: tree.map((t) => /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2", children: [
          /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-2 text-sm font-medium text-foreground", children: [
            /* @__PURE__ */ jsx(FolderTree, { className: "h-4 w-4 text-primary" }),
            " ",
            t.name
          ] }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: t.count })
        ] }),
        /* @__PURE__ */ jsx("ul", { className: "ml-4 mt-1 space-y-0.5 border-l border-border pl-3", children: t.children.map((ch) => /* @__PURE__ */ jsxs("li", { className: "flex items-center gap-1.5 py-1 text-sm text-muted-foreground", children: [
          /* @__PURE__ */ jsx(ChevronRight, { className: "h-3.5 w-3.5" }),
          " ",
          ch
        ] }, ch)) })
      ] }, t.name)) }) }),
      /* @__PURE__ */ jsxs(SectionCard, { title: "Toutes les catégories", className: "lg:col-span-2", children: [
        /* @__PURE__ */ jsx("div", { className: "mb-4", children: /* @__PURE__ */ jsx(Toolbar, { placeholder: "Rechercher une catégorie…", addLabel: "Nouvelle catégorie", onAdd: () => toast.info("Ajout de catégorie") }) }),
        /* @__PURE__ */ jsx(DataTable, { columns: cols, rows: categories, rowKey: (c) => c.nom })
      ] })
    ] })
  ] });
}
export {
  CategoriesPage as component
};
