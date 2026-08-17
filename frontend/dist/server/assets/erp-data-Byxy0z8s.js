import { LayoutDashboard, Package, FolderTree, Contact, Truck, Warehouse, ShoppingCart, Receipt, FileText, CreditCard, BrainCircuit, Bot, FileBarChart, BarChart3, Users, ShieldCheck, Bell, Settings } from "lucide-react";
import { f as formatCurrency } from "./currency-BGNe4_9Y.js";
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
const fmtCurrency = (n, currencyCode) => formatCurrency(n);
const fmtNumber = (n) => new Intl.NumberFormat("fr-FR").format(n);
const salesTrend = [
  { mois: "Jan", ventes: 42e3, achats: 28e3 },
  { mois: "Fév", ventes: 38500, achats: 25500 },
  { mois: "Mar", ventes: 51200, achats: 31e3 },
  { mois: "Avr", ventes: 47800, achats: 29800 },
  { mois: "Mai", ventes: 58400, achats: 34200 },
  { mois: "Juin", ventes: 62100, achats: 36800 },
  { mois: "Juil", ventes: 69500, achats: 39500 },
  { mois: "Août", ventes: 64200, achats: 37100 },
  { mois: "Sep", ventes: 73800, achats: 41200 },
  { mois: "Oct", ventes: 81400, achats: 44800 },
  { mois: "Nov", ventes: 78900, achats: 43100 },
  { mois: "Déc", ventes: 92500, achats: 48600 }
];
const topProducts = [
  { nom: "Ordinateur portable Pro 15", ventes: 482 },
  { nom: "Casque sans fil ANC", ventes: 421 },
  { nom: "Clavier mécanique RGB", ventes: 388 },
  { nom: 'Écran 27" 4K', ventes: 312 },
  { nom: "Souris ergonomique", ventes: 276 }
];
const stockSplit = [
  { name: "Informatique", value: 38 },
  { name: "Accessoires", value: 24 },
  { name: "Mobilier", value: 18 },
  { name: "Réseau", value: 12 },
  { name: "Consommables", value: 8 }
];
const payments = [
  {
    ref: "PAY-9031",
    tiers: "TechnoPlus SARL",
    montant: 4280,
    methode: "Virement",
    type: "Reçu",
    date: "10 juin 2026"
  },
  {
    ref: "PAY-9030",
    tiers: "Global Supplies",
    montant: 12400,
    methode: "Virement",
    type: "Émis",
    date: "10 juin 2026"
  },
  {
    ref: "PAY-9029",
    tiers: "Bureau Moderne",
    montant: 7450,
    methode: "Carte",
    type: "Reçu",
    date: "09 juin 2026"
  },
  {
    ref: "PAY-9028",
    tiers: "ElectroDist",
    montant: 8650,
    methode: "Virement",
    type: "Émis",
    date: "08 juin 2026"
  },
  {
    ref: "PAY-9027",
    tiers: "ProShop",
    montant: 3120,
    methode: "Chèque",
    type: "Reçu",
    date: "08 juin 2026"
  }
];
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
const salesForecast = [
  { mois: "Juin", reel: 92500, prevu: 92500 },
  { mois: "Juil", reel: null, prevu: 98200 },
  { mois: "Août", reel: null, prevu: 89400 },
  { mois: "Sep", reel: null, prevu: 104800 },
  { mois: "Oct", reel: null, prevu: 112300 },
  { mois: "Nov", reel: null, prevu: 108900 }
];
const stockRisks = [
  { produit: 'Écran 27" 4K', stock: 5, jours: 8, risque: "Élevé" },
  { produit: "Routeur Wi-Fi 6", stock: 0, jours: 0, risque: "Critique" },
  { produit: "Clavier mécanique RGB", stock: 9, jours: 14, risque: "Moyen" },
  { produit: "Onduleur 1500 VA", stock: 14, jours: 21, risque: "Faible" }
];
export {
  stockSplit as a,
  fmtNumber as b,
  salesForecast as c,
  stockRisks as d,
  fmtCurrency as f,
  navGroups as n,
  payments as p,
  salesTrend as s,
  topProducts as t
};
