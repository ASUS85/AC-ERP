import { jsxs, jsx } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { Settings, ShieldCheck, Users, Bell, ChartNoAxesCombined, Contact, BarChart3, FileBarChart, FileText, Bot, BrainCircuit, CreditCard, ReceiptText, ShoppingCart, Truck, Warehouse, Package, Tags, LayoutDashboard, Home, ChevronRight } from "lucide-react";
const headerIcons = {
  "Tableau de bord": [LayoutDashboard, ChartNoAxesCombined, BarChart3],
  Produits: [Package, Tags, Warehouse],
  Catégories: [Tags, Package, ChartNoAxesCombined],
  Clients: [Contact, Users, ReceiptText],
  Fournisseurs: [Truck, Package, ShoppingCart],
  "Gestion des stocks": [Warehouse, Package, ChartNoAxesCombined],
  Achats: [ShoppingCart, Truck, FileText],
  Ventes: [ReceiptText, ShoppingCart, CreditCard],
  Factures: [FileText, ReceiptText, CreditCard],
  Paiements: [CreditCard, ReceiptText, ChartNoAxesCombined],
  "Prévisions & intelligence artificielle": [
    BrainCircuit,
    ChartNoAxesCombined,
    BarChart3
  ],
  "Assistant conversationnel ERP": [Bot, BrainCircuit, ChartNoAxesCombined],
  "Génération de rapports": [FileBarChart, ChartNoAxesCombined, FileText],
  "Statistiques & analyses": [BarChart3, ChartNoAxesCombined, FileBarChart],
  Utilisateurs: [Users, ShieldCheck, Contact],
  "Rôles & permissions": [ShieldCheck, Users, Settings],
  Notifications: [Bell, ChartNoAxesCombined, Settings],
  Paramètres: [Settings, ShieldCheck, Users]
};
function PageHeader({
  title,
  description,
  breadcrumb = [],
  actions
}) {
  const decorativeIcons = headerIcons[title] || [
    ChartNoAxesCombined,
    FileText,
    Settings
  ];
  const decorativeClasses = [
    "text-primary/45 -rotate-6",
    "text-info/45 rotate-3",
    "text-warning/50 rotate-12"
  ];
  return /* @__PURE__ */ jsxs("div", { className: "relative mb-6 overflow-hidden", children: [
    /* @__PURE__ */ jsx("div", { className: "pointer-events-none absolute right-[clamp(11rem,23vw,24rem)] top-4 z-0 hidden items-center gap-9 lg:flex", children: decorativeIcons.map((Icon, index) => /* @__PURE__ */ jsx(
      Icon,
      {
        className: `${index === 1 ? "h-[4.5rem] w-[4.5rem]" : "h-14 w-14"} ${decorativeClasses[index]}`,
        strokeWidth: 1.5
      },
      Icon.displayName || index
    )) }),
    /* @__PURE__ */ jsxs("nav", { className: "relative z-10 mb-3 flex items-center gap-1.5 text-xs text-muted-foreground", children: [
      /* @__PURE__ */ jsxs(
        Link,
        {
          to: "/",
          className: "flex items-center gap-1 transition-colors hover:text-foreground",
          children: [
            /* @__PURE__ */ jsx(Home, { className: "h-3.5 w-3.5" }),
            "Accueil"
          ]
        }
      ),
      breadcrumb.map((b) => /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsx(ChevronRight, { className: "h-3.5 w-3.5" }),
        /* @__PURE__ */ jsx("span", { className: "text-foreground/80", children: b })
      ] }, b))
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "relative z-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", children: [
      /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsx("h1", { className: "truncate text-2xl font-bold text-foreground", children: title }),
        description && /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: description })
      ] }),
      actions && /* @__PURE__ */ jsx("div", { className: "flex shrink-0 flex-wrap items-center gap-2", children: actions })
    ] })
  ] });
}
export {
  PageHeader as P
};
