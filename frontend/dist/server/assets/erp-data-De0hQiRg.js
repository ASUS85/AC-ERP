import { LayoutDashboard, Package, FolderTree, Contact, Truck, Warehouse, ShoppingCart, Receipt, FileText, CreditCard, BrainCircuit, Bot, FileBarChart, BarChart3, Users, ShieldCheck, Bell, Settings } from "lucide-react";
import { f as formatCurrency } from "./currency-BmQmAj7J.js";
const navGroups = [
  {
    label: "Pilotage",
    items: [
      {
        title: "Tableau de bord",
        url: "/",
        icon: LayoutDashboard,
        permission: "dashboard:lire"
      }
    ]
  },
  {
    label: "Gestion commerciale",
    items: [
      {
        title: "Produits",
        url: "/products",
        icon: Package,
        permission: "produits:lire"
      },
      {
        title: "Catégories",
        url: "/categories",
        icon: FolderTree,
        permission: "categories:lire"
      },
      {
        title: "Clients",
        url: "/customers",
        icon: Contact,
        permission: "clients:lire"
      },
      {
        title: "Fournisseurs",
        url: "/suppliers",
        icon: Truck,
        permission: "fournisseurs:lire"
      },
      {
        title: "Stocks",
        url: "/inventory",
        icon: Warehouse,
        badge: "3",
        permission: "stocks:lire"
      }
    ]
  },
  {
    label: "Transactions",
    items: [
      {
        title: "Achats",
        url: "/purchases",
        icon: ShoppingCart,
        permission: "achats:lire"
      },
      {
        title: "Ventes",
        url: "/sales",
        icon: Receipt,
        permission: "ventes:lire"
      },
      {
        title: "Factures",
        url: "/invoices",
        icon: FileText,
        badge: "5",
        permission: "factures:lire"
      },
      {
        title: "Paiements",
        url: "/payments",
        icon: CreditCard,
        permission: "paiements:lire"
      }
    ]
  },
  {
    label: "Intelligence",
    items: [
      {
        title: "Prévisions IA",
        url: "/ai",
        icon: BrainCircuit,
        permission: "ia:lire"
      },
      {
        title: "Assistant ERP",
        url: "/assistant",
        icon: Bot,
        permission: "ia:chat"
      },
      {
        title: "Rapports",
        url: "/reports",
        icon: FileBarChart,
        permission: "rapports:lire"
      },
      {
        title: "Statistiques",
        url: "/statistics",
        icon: BarChart3,
        permission: "dashboard:lire"
      }
    ]
  },
  {
    label: "Administration",
    items: [
      {
        title: "Utilisateurs",
        url: "/users",
        icon: Users,
        permission: "users:lire"
      },
      {
        title: "Rôles & permissions",
        url: "/roles",
        icon: ShieldCheck,
        permission: "roles:lire"
      },
      { title: "Notifications", url: "/notifications", icon: Bell, badge: "8" },
      {
        title: "Paramètres",
        url: "/settings",
        icon: Settings,
        permission: "users:modifier"
      }
    ]
  }
];
const fmtCurrency = (n, currencyCode) => formatCurrency(n, currencyCode);
const fmtNumber = (n) => new Intl.NumberFormat("fr-FR").format(n);
const permModules = [
  "Ventes",
  "Achats",
  "Stocks",
  "Clients",
  "Factures",
  "Rapports",
  "Utilisateurs"
];
({
  Administrateur: Object.fromEntries(permModules.map((m) => [m, true]))
});
export {
  fmtNumber as a,
  fmtCurrency as f,
  navGroups as n
};
