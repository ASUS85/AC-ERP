import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { Download, Users, Contact, Wallet } from "lucide-react";
import { P as PageHeader } from "./PageHeader-Dn6TWXax.js";
import { S as StatCard, a as SectionCard, T as Toolbar, P as Pagination } from "./widgets-TR90zn21.js";
import { D as DataTable } from "./DataTable-GDNjj3LS.js";
import { S as StatusBadge } from "./StatusBadge-Dz4xfF4y.js";
import { B as Button } from "./input-Bxvgloed.js";
import { l as customers, f as fmtCurrency } from "./erp-data-DbNh89rB.js";
import { c as cn } from "./router-DKXtA4iJ.js";
import { toast } from "sonner";
import "@tanstack/react-router";
import "react";
import "./dropdown-menu-PQToeZcP.js";
import "@radix-ui/react-dropdown-menu";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "@tanstack/react-query";
import "clsx";
import "tailwind-merge";
const initials = (n) => n.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
const cols = [{
  key: "nom",
  header: "Client",
  render: (c) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
    /* @__PURE__ */ jsx("span", { className: "flex h-9 w-9 items-center justify-center rounded-full bg-gradient-primary text-xs font-semibold text-white", children: initials(c.nom) }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("p", { className: "font-medium text-foreground", children: c.nom }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: c.email })
    ] })
  ] })
}, {
  key: "ville",
  header: "Ville"
}, {
  key: "achats",
  header: "Commandes",
  align: "right"
}, {
  key: "solde",
  header: "Solde",
  align: "right",
  render: (c) => /* @__PURE__ */ jsx("span", { className: cn("font-medium", c.solde < 0 ? "text-destructive" : "text-foreground"), children: fmtCurrency(c.solde) })
}, {
  key: "statut",
  header: "Statut",
  align: "right",
  render: (c) => /* @__PURE__ */ jsx(StatusBadge, { status: c.statut })
}];
function CustomersPage() {
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(PageHeader, { title: "Clients", description: "Fiches, soldes et historique d'achats", breadcrumb: ["Gestion commerciale", "Clients"], actions: /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", className: "gap-1.5", children: [
      /* @__PURE__ */ jsx(Download, { className: "h-4 w-4" }),
      " Exporter"
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4", children: [
      /* @__PURE__ */ jsx(StatCard, { label: "Clients", value: "642", sub: "au total", icon: /* @__PURE__ */ jsx(Users, { className: "h-5 w-5" }) }),
      /* @__PURE__ */ jsx(StatCard, { label: "Actifs", value: "588", sub: "ce trimestre", icon: /* @__PURE__ */ jsx(Contact, { className: "h-5 w-5" }) }),
      /* @__PURE__ */ jsx(StatCard, { label: "Encours total", value: "48 200 f", sub: "à recouvrer", icon: /* @__PURE__ */ jsx(Wallet, { className: "h-5 w-5" }) }),
      /* @__PURE__ */ jsx(StatCard, { label: "Nouveaux", value: "24", delta: "+12 %", up: true, sub: "ce mois", icon: /* @__PURE__ */ jsx(Users, { className: "h-5 w-5" }) })
    ] }),
    /* @__PURE__ */ jsxs(SectionCard, { title: "Liste des clients", description: "642 clients", children: [
      /* @__PURE__ */ jsx("div", { className: "mb-4", children: /* @__PURE__ */ jsx(Toolbar, { placeholder: "Rechercher un client…", addLabel: "Ajouter un client", onAdd: () => toast.info("Ajout d'un client") }) }),
      /* @__PURE__ */ jsx(DataTable, { columns: cols, rows: customers, rowKey: (c) => c.email }),
      /* @__PURE__ */ jsx(Pagination, { count: 642 })
    ] })
  ] });
}
export {
  CustomersPage as component
};
