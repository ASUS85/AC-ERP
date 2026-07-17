import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { ArrowDownLeft, ArrowUpRight, Wallet, Receipt } from "lucide-react";
import { P as PageHeader } from "./PageHeader-Dn6TWXax.js";
import { S as StatCard, a as SectionCard, T as Toolbar, P as Pagination } from "./widgets-BO9olZIU.js";
import { D as DataTable } from "./DataTable-BBLHBa-6.js";
import { S as StatusBadge } from "./StatusBadge-DzwZoZIv.js";
import { f as fmtCurrency, e as payments } from "./erp-data-C0zPHDd1.js";
import { c as cn } from "./router-DoJhw79x.js";
import "@tanstack/react-router";
import "react";
import "./input-Cd6riMgS.js";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "react-dom";
import "./dropdown-menu-BLBl88Iu.js";
import "@radix-ui/react-dropdown-menu";
import "./currency-oCEgfK2m.js";
import "@tanstack/react-query";
import "clsx";
import "tailwind-merge";
import "sonner";
const cols = [{
  key: "ref",
  header: "Référence",
  render: (p) => /* @__PURE__ */ jsx("span", { className: "font-medium text-foreground", children: p.ref })
}, {
  key: "tiers",
  header: "Tiers"
}, {
  key: "methode",
  header: "Méthode"
}, {
  key: "type",
  header: "Type",
  render: (p) => /* @__PURE__ */ jsx(StatusBadge, { status: p.type })
}, {
  key: "montant",
  header: "Montant",
  align: "right",
  render: (p) => /* @__PURE__ */ jsxs("span", { className: cn("font-medium", p.type === "Reçu" ? "text-success" : "text-info"), children: [
    p.type === "Reçu" ? "+" : "−",
    " ",
    fmtCurrency(p.montant)
  ] })
}, {
  key: "date",
  header: "Date",
  align: "right"
}];
function PaymentsPage() {
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(PageHeader, { title: "Paiements", description: "Paiements reçus, paiements effectués et reçus", breadcrumb: ["Transactions", "Paiements"] }),
    /* @__PURE__ */ jsxs("div", { className: "mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4", children: [
      /* @__PURE__ */ jsx(StatCard, { label: "Encaissements", value: fmtCurrency(248100), sub: "ce mois", icon: /* @__PURE__ */ jsx(ArrowDownLeft, { className: "h-5 w-5" }) }),
      /* @__PURE__ */ jsx(StatCard, { label: "Décaissements", value: fmtCurrency(186500), sub: "ce mois", icon: /* @__PURE__ */ jsx(ArrowUpRight, { className: "h-5 w-5" }) }),
      /* @__PURE__ */ jsx(StatCard, { label: "Trésorerie nette", value: `+${fmtCurrency(61600)}`, delta: "+8 %", up: true, sub: "solde du mois", icon: /* @__PURE__ */ jsx(Wallet, { className: "h-5 w-5" }) }),
      /* @__PURE__ */ jsx(StatCard, { label: "Reçus émis", value: "148", sub: "documents", icon: /* @__PURE__ */ jsx(Receipt, { className: "h-5 w-5" }) })
    ] }),
    /* @__PURE__ */ jsxs(SectionCard, { title: "Historique des paiements", children: [
      /* @__PURE__ */ jsx("div", { className: "mb-4", children: /* @__PURE__ */ jsx(Toolbar, { placeholder: "Rechercher un paiement…" }) }),
      /* @__PURE__ */ jsx(DataTable, { columns: cols, rows: payments, rowKey: (p) => p.ref }),
      /* @__PURE__ */ jsx(Pagination, { count: 426 })
    ] })
  ] });
}
export {
  PaymentsPage as component
};
