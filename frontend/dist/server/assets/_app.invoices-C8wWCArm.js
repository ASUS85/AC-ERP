import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { Plus, FileText, Printer, Download } from "lucide-react";
import { P as PageHeader } from "./PageHeader-Dn6TWXax.js";
import { S as StatCard, a as SectionCard, T as Toolbar, P as Pagination } from "./widgets-CMPdIU-O.js";
import { D as DataTable } from "./DataTable-BdeZJD0g.js";
import { S as StatusBadge } from "./StatusBadge-DSMu8YcM.js";
import { B as Button } from "./input-Dis5tVWN.js";
import { l as logo } from "./erp-logo-C4ESMtut.js";
import { i as invoices, f as fmtCurrency } from "./erp-data-Dpg9mwIn.js";
import { toast } from "sonner";
import "@tanstack/react-router";
import "react";
import "./router-BPNLrioU.js";
import "@tanstack/react-query";
import "clsx";
import "tailwind-merge";
import "./dropdown-menu-D2wOmaKU.js";
import "@radix-ui/react-dropdown-menu";
import "@radix-ui/react-slot";
import "class-variance-authority";
const cols = [{
  key: "ref",
  header: "N° facture",
  render: (i) => /* @__PURE__ */ jsx("span", { className: "font-medium text-foreground", children: i.ref })
}, {
  key: "client",
  header: "Client"
}, {
  key: "echeance",
  header: "Échéance"
}, {
  key: "montant",
  header: "Montant",
  align: "right",
  render: (i) => /* @__PURE__ */ jsx("span", { className: "font-medium text-foreground", children: fmtCurrency(i.montant) })
}, {
  key: "statut",
  header: "Statut",
  align: "right",
  render: (i) => /* @__PURE__ */ jsx(StatusBadge, { status: i.statut })
}];
const lines = [{
  d: "Ordinateur portable Pro 15",
  q: 2,
  pu: 1299
}, {
  d: "Casque sans fil ANC",
  q: 2,
  pu: 199
}, {
  d: "Souris ergonomique",
  q: 4,
  pu: 49
}];
function InvoicesPage() {
  const ht = lines.reduce((s, l) => s + l.q * l.pu, 0);
  const tva = ht * 0.2;
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(PageHeader, { title: "Factures", description: "Liste, détails, impression PDF et statuts de paiement", breadcrumb: ["Transactions", "Factures"], actions: /* @__PURE__ */ jsxs(Button, { size: "sm", className: "gap-1.5", onClick: () => toast.info("Nouvelle facture"), children: [
      /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
      " Nouvelle facture"
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4", children: [
      /* @__PURE__ */ jsx(StatCard, { label: "Total facturé", value: "284 750 f", sub: "ce mois", icon: /* @__PURE__ */ jsx(FileText, { className: "h-5 w-5" }) }),
      /* @__PURE__ */ jsx(StatCard, { label: "Payées", value: "248 100 f", sub: "encaissées", icon: /* @__PURE__ */ jsx(FileText, { className: "h-5 w-5" }) }),
      /* @__PURE__ */ jsx(StatCard, { label: "En attente", value: "18 230 f", sub: "à venir", icon: /* @__PURE__ */ jsx(FileText, { className: "h-5 w-5" }) }),
      /* @__PURE__ */ jsx(StatCard, { label: "En retard", value: "18 420 f", sub: "5 factures", icon: /* @__PURE__ */ jsx(FileText, { className: "h-5 w-5" }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-4 lg:grid-cols-5", children: [
      /* @__PURE__ */ jsxs(SectionCard, { title: "Liste des factures", className: "lg:col-span-3", children: [
        /* @__PURE__ */ jsx("div", { className: "mb-4", children: /* @__PURE__ */ jsx(Toolbar, { placeholder: "Rechercher une facture…" }) }),
        /* @__PURE__ */ jsx(DataTable, { columns: cols, rows: invoices, rowKey: (i) => i.ref }),
        /* @__PURE__ */ jsx(Pagination, { count: 312 })
      ] }),
      /* @__PURE__ */ jsx(SectionCard, { title: "Aperçu facture", description: "FAC-2026-148", className: "lg:col-span-2", action: /* @__PURE__ */ jsxs("div", { className: "flex gap-1.5", children: [
        /* @__PURE__ */ jsx(Button, { variant: "outline", size: "icon", className: "h-8 w-8", onClick: () => toast.info("Impression…"), children: /* @__PURE__ */ jsx(Printer, { className: "h-4 w-4" }) }),
        /* @__PURE__ */ jsx(Button, { variant: "outline", size: "icon", className: "h-8 w-8", onClick: () => toast.success("PDF exporté"), children: /* @__PURE__ */ jsx(Download, { className: "h-4 w-4" }) })
      ] }), children: /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-border bg-card p-5 text-sm", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("img", { src: logo, alt: "Logo", width: 32, height: 32, className: "h-8 w-8" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-display font-bold text-foreground", children: "AC ERP" }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "12 rue du Commerce, Lyon" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
            /* @__PURE__ */ jsx("p", { className: "font-bold text-foreground", children: "FACTURE" }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "FAC-2026-148" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "my-4 border-t border-border pt-3 text-xs text-muted-foreground", children: [
          /* @__PURE__ */ jsx("p", { className: "font-medium text-foreground", children: "Facturé à : TechnoPlus SARL" }),
          /* @__PURE__ */ jsx("p", { children: "Lyon, France · Échéance : 05 juin 2026" })
        ] }),
        /* @__PURE__ */ jsxs("table", { className: "w-full text-xs", children: [
          /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-border text-left text-muted-foreground", children: [
            /* @__PURE__ */ jsx("th", { className: "pb-2 font-medium", children: "Désignation" }),
            /* @__PURE__ */ jsx("th", { className: "pb-2 text-center font-medium", children: "Qté" }),
            /* @__PURE__ */ jsx("th", { className: "pb-2 text-right font-medium", children: "Total" })
          ] }) }),
          /* @__PURE__ */ jsx("tbody", { children: lines.map((l) => /* @__PURE__ */ jsxs("tr", { className: "border-b border-border/60", children: [
            /* @__PURE__ */ jsx("td", { className: "py-2 text-foreground", children: l.d }),
            /* @__PURE__ */ jsx("td", { className: "py-2 text-center text-muted-foreground", children: l.q }),
            /* @__PURE__ */ jsx("td", { className: "py-2 text-right text-foreground", children: fmtCurrency(l.q * l.pu) })
          ] }, l.d)) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-3 space-y-1 text-xs", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-muted-foreground", children: [
            /* @__PURE__ */ jsx("span", { children: "Total HT" }),
            /* @__PURE__ */ jsx("span", { children: fmtCurrency(ht) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-muted-foreground", children: [
            /* @__PURE__ */ jsx("span", { children: "TVA 20 %" }),
            /* @__PURE__ */ jsx("span", { children: fmtCurrency(tva) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between border-t border-border pt-1 font-bold text-foreground", children: [
            /* @__PURE__ */ jsx("span", { children: "Total TTC" }),
            /* @__PURE__ */ jsx("span", { children: fmtCurrency(ht + tva) })
          ] })
        ] })
      ] }) })
    ] })
  ] });
}
export {
  InvoicesPage as component
};
