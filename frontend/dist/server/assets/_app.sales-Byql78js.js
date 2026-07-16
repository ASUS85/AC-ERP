import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useState } from "react";
import { ShoppingCart, Receipt, Minus, Plus, Trash2 } from "lucide-react";
import { P as PageHeader } from "./PageHeader-Dn6TWXax.js";
import { a as SectionCard, P as Pagination } from "./widgets-D8uCN_-E.js";
import { D as DataTable } from "./DataTable-Dj3dfIqk.js";
import { S as StatusBadge } from "./StatusBadge-ClcddGdN.js";
import { B as Button } from "./input-DRGbboqL.js";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-D5l5KdR-.js";
import { p as products, f as fmtCurrency, c as salesOrders } from "./erp-data-DdbAvP8x.js";
import { toast } from "sonner";
import "@tanstack/react-router";
import "./router-C1QYPkjn.js";
import "@tanstack/react-query";
import "clsx";
import "tailwind-merge";
import "react-dom";
import "./dropdown-menu-CQ-LP4ME.js";
import "@radix-ui/react-dropdown-menu";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "@radix-ui/react-tabs";
import "./currency-oCEgfK2m.js";
const cols = [{
  key: "ref",
  header: "Vente",
  render: (o) => /* @__PURE__ */ jsx("span", { className: "font-medium text-foreground", children: o.ref })
}, {
  key: "client",
  header: "Client"
}, {
  key: "articles",
  header: "Articles",
  align: "right"
}, {
  key: "date",
  header: "Date"
}, {
  key: "montant",
  header: "Montant",
  align: "right",
  render: (o) => /* @__PURE__ */ jsx("span", { className: "font-medium text-foreground", children: fmtCurrency(o.montant) })
}, {
  key: "statut",
  header: "Statut",
  align: "right",
  render: (o) => /* @__PURE__ */ jsx(StatusBadge, { status: o.statut })
}];
function SalesPage() {
  const [cart, setCart] = useState([{
    ref: "PRD-001",
    nom: "Ordinateur portable Pro 15",
    prix: 1299,
    qte: 1
  }, {
    ref: "PRD-002",
    nom: "Casque sans fil ANC",
    prix: 199,
    qte: 2
  }]);
  const add = (p) => setCart((c) => {
    const ex = c.find((i) => i.ref === p.ref);
    if (ex) return c.map((i) => i.ref === p.ref ? {
      ...i,
      qte: i.qte + 1
    } : i);
    return [...c, {
      ref: p.ref,
      nom: p.nom,
      prix: p.prix,
      qte: 1
    }];
  });
  const setQte = (ref, d) => setCart((c) => c.map((i) => i.ref === ref ? {
    ...i,
    qte: Math.max(1, i.qte + d)
  } : i));
  const remove = (ref) => setCart((c) => c.filter((i) => i.ref !== ref));
  const total = cart.reduce((s, i) => s + i.prix * i.qte, 0);
  const tva = total * 0.2;
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(PageHeader, { title: "Ventes", description: "Création de ventes, panier et facturation", breadcrumb: ["Transactions", "Ventes"] }),
    /* @__PURE__ */ jsxs(Tabs, { defaultValue: "new", children: [
      /* @__PURE__ */ jsxs(TabsList, { className: "mb-4", children: [
        /* @__PURE__ */ jsxs(TabsTrigger, { value: "new", className: "gap-1.5", children: [
          /* @__PURE__ */ jsx(ShoppingCart, { className: "h-4 w-4" }),
          " Nouvelle vente"
        ] }),
        /* @__PURE__ */ jsxs(TabsTrigger, { value: "list", className: "gap-1.5", children: [
          /* @__PURE__ */ jsx(Receipt, { className: "h-4 w-4" }),
          " Historique"
        ] })
      ] }),
      /* @__PURE__ */ jsx(TabsContent, { value: "new", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-4 lg:grid-cols-3", children: [
        /* @__PURE__ */ jsx(SectionCard, { title: "Catalogue", description: "Cliquez pour ajouter au panier", className: "lg:col-span-2", children: /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-3 sm:grid-cols-3", children: products.slice(0, 9).map((p) => /* @__PURE__ */ jsxs("button", { onClick: () => add(p), className: "group rounded-lg border border-border p-3 text-left transition-all hover:border-primary/40 hover:shadow-card", children: [
          /* @__PURE__ */ jsx("div", { className: "mb-2 flex h-16 items-center justify-center rounded-md bg-secondary/60 text-primary", children: /* @__PURE__ */ jsx(ShoppingCart, { className: "h-6 w-6 opacity-70" }) }),
          /* @__PURE__ */ jsx("p", { className: "line-clamp-1 text-sm font-medium text-foreground", children: p.nom }),
          /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-primary", children: fmtCurrency(p.prix) })
        ] }, p.ref)) }) }),
        /* @__PURE__ */ jsxs(SectionCard, { title: "Panier", description: `${cart.length} article(s)`, children: [
          /* @__PURE__ */ jsx("div", { className: "space-y-3", children: cart.map((i) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 rounded-lg border border-border p-2.5", children: [
            /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
              /* @__PURE__ */ jsx("p", { className: "truncate text-sm font-medium text-foreground", children: i.nom }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: fmtCurrency(i.prix) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
              /* @__PURE__ */ jsx(Button, { variant: "outline", size: "icon", className: "h-6 w-6", onClick: () => setQte(i.ref, -1), children: /* @__PURE__ */ jsx(Minus, { className: "h-3 w-3" }) }),
              /* @__PURE__ */ jsx("span", { className: "w-6 text-center text-sm font-medium", children: i.qte }),
              /* @__PURE__ */ jsx(Button, { variant: "outline", size: "icon", className: "h-6 w-6", onClick: () => setQte(i.ref, 1), children: /* @__PURE__ */ jsx(Plus, { className: "h-3 w-3" }) })
            ] }),
            /* @__PURE__ */ jsx("button", { onClick: () => remove(i.ref), className: "text-muted-foreground hover:text-destructive", children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" }) })
          ] }, i.ref)) }),
          /* @__PURE__ */ jsxs("div", { className: "mt-4 space-y-2 border-t border-border pt-4 text-sm", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-muted-foreground", children: [
              /* @__PURE__ */ jsx("span", { children: "Sous-total" }),
              /* @__PURE__ */ jsx("span", { children: fmtCurrency(total) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-muted-foreground", children: [
              /* @__PURE__ */ jsx("span", { children: "TVA (20 %)" }),
              /* @__PURE__ */ jsx("span", { children: fmtCurrency(tva) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-base font-bold text-foreground", children: [
              /* @__PURE__ */ jsx("span", { children: "Total TTC" }),
              /* @__PURE__ */ jsx("span", { children: fmtCurrency(total + tva) })
            ] })
          ] }),
          /* @__PURE__ */ jsx(Button, { className: "mt-4 w-full", onClick: () => toast.success("Vente validée", {
            description: "Facture générée automatiquement."
          }), children: "Valider & facturer" })
        ] })
      ] }) }),
      /* @__PURE__ */ jsx(TabsContent, { value: "list", children: /* @__PURE__ */ jsxs(SectionCard, { title: "Historique des ventes", children: [
        /* @__PURE__ */ jsx(DataTable, { columns: cols, rows: salesOrders, rowKey: (o) => o.ref }),
        /* @__PURE__ */ jsx(Pagination, { count: 1248 })
      ] }) })
    ] })
  ] });
}
export {
  SalesPage as component
};
