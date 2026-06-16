import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { Plus, FileEdit, CheckCircle2, Truck, PackageCheck } from "lucide-react";
import { P as PageHeader } from "./PageHeader-JmieIep0.js";
import { a as SectionCard, T as Toolbar, P as Pagination } from "./widgets-VozA-0is.js";
import { D as DataTable } from "./DataTable-DBZj_p8y.js";
import { S as StatusBadge } from "./StatusBadge-BUsotgKH.js";
import { B as Button } from "./input-BiB-PFhx.js";
import { j as purchaseOrders, f as fmtCurrency } from "./erp-data-CgsBYils.js";
import { toast } from "sonner";
import "@tanstack/react-router";
import "react";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
const cols = [{
  key: "ref",
  header: "Bon de commande",
  render: (o) => /* @__PURE__ */ jsx("span", { className: "font-medium text-foreground", children: o.ref })
}, {
  key: "fournisseur",
  header: "Fournisseur"
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
const steps = [{
  icon: FileEdit,
  label: "Brouillon",
  done: true
}, {
  icon: CheckCircle2,
  label: "Validation",
  done: true
}, {
  icon: Truck,
  label: "Commande envoyée",
  done: true
}, {
  icon: PackageCheck,
  label: "Réception",
  done: false
}];
function PurchasesPage() {
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(PageHeader, { title: "Achats", description: "Bons de commande, réceptions et validation fournisseurs", breadcrumb: ["Transactions", "Achats"], actions: /* @__PURE__ */ jsxs(Button, { size: "sm", className: "gap-1.5", onClick: () => toast.info("Nouveau bon de commande"), children: [
      /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
      " Nouveau bon de commande"
    ] }) }),
    /* @__PURE__ */ jsx(SectionCard, { title: "Workflow d'achat", description: "Cycle de vie d'un bon de commande", className: "mb-6", children: /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-4 sm:flex-row sm:items-center", children: steps.map((s, i) => /* @__PURE__ */ jsxs("div", { className: "flex flex-1 items-center gap-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("span", { className: `flex h-10 w-10 items-center justify-center rounded-full ${s.done ? "bg-gradient-primary text-white" : "border-2 border-dashed border-border text-muted-foreground"}`, children: /* @__PURE__ */ jsx(s.icon, { className: "h-5 w-5" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
            "Étape ",
            i + 1
          ] }),
          /* @__PURE__ */ jsx("p", { className: `text-sm font-medium ${s.done ? "text-foreground" : "text-muted-foreground"}`, children: s.label })
        ] })
      ] }),
      i < steps.length - 1 && /* @__PURE__ */ jsx("div", { className: `hidden h-0.5 flex-1 sm:block ${s.done ? "bg-primary/40" : "bg-border"}` })
    ] }, s.label)) }) }),
    /* @__PURE__ */ jsxs(SectionCard, { title: "Bons de commande", children: [
      /* @__PURE__ */ jsx("div", { className: "mb-4", children: /* @__PURE__ */ jsx(Toolbar, { placeholder: "Rechercher un bon de commande…" }) }),
      /* @__PURE__ */ jsx(DataTable, { columns: cols, rows: purchaseOrders, rowKey: (o) => o.ref }),
      /* @__PURE__ */ jsx(Pagination, { count: 64 })
    ] })
  ] });
}
export {
  PurchasesPage as component
};
