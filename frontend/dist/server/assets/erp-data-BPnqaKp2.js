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
const products = [
  {
    ref: "PRD-001",
    nom: "Ordinateur portable Pro 15",
    cat: "Informatique",
    prix: 1299,
    stock: 48,
    statut: "Actif"
  },
  {
    ref: "PRD-002",
    nom: "Casque sans fil ANC",
    cat: "Accessoires",
    prix: 199,
    stock: 132,
    statut: "Actif"
  },
  {
    ref: "PRD-003",
    nom: "Clavier mécanique RGB",
    cat: "Accessoires",
    prix: 89,
    stock: 9,
    statut: "Stock faible"
  },
  {
    ref: "PRD-004",
    nom: 'Écran 27" 4K',
    cat: "Informatique",
    prix: 449,
    stock: 5,
    statut: "Stock faible"
  },
  {
    ref: "PRD-005",
    nom: "Souris ergonomique",
    cat: "Accessoires",
    prix: 49,
    stock: 210,
    statut: "Actif"
  },
  {
    ref: "PRD-006",
    nom: "Chaise de bureau ergo",
    cat: "Mobilier",
    prix: 329,
    stock: 27,
    statut: "Actif"
  },
  {
    ref: "PRD-007",
    nom: "Routeur Wi-Fi 6",
    cat: "Réseau",
    prix: 159,
    stock: 0,
    statut: "Rupture"
  },
  {
    ref: "PRD-008",
    nom: "Disque SSD 2 To",
    cat: "Informatique",
    prix: 179,
    stock: 64,
    statut: "Actif"
  },
  {
    ref: "PRD-009",
    nom: "Webcam 4K",
    cat: "Accessoires",
    prix: 119,
    stock: 41,
    statut: "Actif"
  },
  {
    ref: "PRD-010",
    nom: "Onduleur 1500 VA",
    cat: "Réseau",
    prix: 249,
    stock: 14,
    statut: "Actif"
  }
];
const salesOrders = [
  {
    ref: "VTE-2048",
    client: "TechnoPlus SARL",
    montant: 4280,
    statut: "Payée",
    date: "10 juin 2026",
    articles: 6
  },
  {
    ref: "VTE-2047",
    client: "Digital Store",
    montant: 1890,
    statut: "En attente",
    date: "10 juin 2026",
    articles: 3
  },
  {
    ref: "VTE-2046",
    client: "Bureau Moderne",
    montant: 7450,
    statut: "Payée",
    date: "09 juin 2026",
    articles: 9
  },
  {
    ref: "VTE-2045",
    client: "InfoCorp",
    montant: 980,
    statut: "Annulée",
    date: "09 juin 2026",
    articles: 2
  },
  {
    ref: "VTE-2044",
    client: "ProShop",
    montant: 3120,
    statut: "Payée",
    date: "08 juin 2026",
    articles: 5
  }
];
const invoices = [
  {
    ref: "FAC-2026-148",
    client: "TechnoPlus SARL",
    montant: 4280,
    statut: "Payée",
    echeance: "05 juin 2026"
  },
  {
    ref: "FAC-2026-147",
    client: "Digital Store",
    montant: 1890,
    statut: "En attente",
    echeance: "20 juin 2026"
  },
  {
    ref: "FAC-2026-146",
    client: "InfoCorp",
    montant: 980,
    statut: "En retard",
    echeance: "01 juin 2026"
  },
  {
    ref: "FAC-2026-145",
    client: "Bureau Moderne",
    montant: 7450,
    statut: "Payée",
    echeance: "03 juin 2026"
  },
  {
    ref: "FAC-2026-144",
    client: "ProShop",
    montant: 3120,
    statut: "En retard",
    echeance: "30 mai 2026"
  },
  {
    ref: "FAC-2026-143",
    client: "MediaTech",
    montant: 760,
    statut: "Brouillon",
    echeance: "25 juin 2026"
  }
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
  salesOrders as b,
  fmtNumber as c,
  payments as d,
  salesForecast as e,
  fmtCurrency as f,
  stockRisks as g,
  invoices as i,
  navGroups as n,
  products as p,
  salesTrend as s,
  topProducts as t
};
