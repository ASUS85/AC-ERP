import { Link } from "@tanstack/react-router";
import {
  BarChart3,
  Bell,
  Bot,
  BrainCircuit,
  ChartNoAxesCombined,
  ChevronRight,
  Contact,
  CreditCard,
  FileBarChart,
  FileText,
  Home,
  LayoutDashboard,
  Package,
  ReceiptText,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Tags,
  Truck,
  Users,
  Warehouse,
} from "lucide-react";
import type { ReactNode } from "react";

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
    BarChart3,
  ],
  "Assistant conversationnel ERP": [Bot, BrainCircuit, ChartNoAxesCombined],
  "Génération de rapports": [FileBarChart, ChartNoAxesCombined, FileText],
  "Statistiques & analyses": [BarChart3, ChartNoAxesCombined, FileBarChart],
  Utilisateurs: [Users, ShieldCheck, Contact],
  "Rôles & permissions": [ShieldCheck, Users, Settings],
  Notifications: [Bell, ChartNoAxesCombined, Settings],
  Paramètres: [Settings, ShieldCheck, Users],
} as const;

export function PageHeader({
  title,
  description,
  breadcrumb = [],
  actions,
}: {
  title: string;
  description?: string;
  breadcrumb?: string[];
  actions?: ReactNode;
}) {
  const decorativeIcons = headerIcons[title as keyof typeof headerIcons] || [
    ChartNoAxesCombined,
    FileText,
    Settings,
  ];
  const decorativeClasses = [
    "text-primary/45 -rotate-6",
    "text-info/45 rotate-3",
    "text-warning/50 rotate-12",
  ];

  return (
    <div className="relative mb-6 overflow-hidden">
      <div className="pointer-events-none absolute right-[clamp(11rem,23vw,24rem)] top-4 z-0 hidden items-center gap-9 lg:flex">
        {decorativeIcons.map((Icon, index) => (
          <Icon
            key={Icon.displayName || index}
            className={`${index === 1 ? "h-[4.5rem] w-[4.5rem]" : "h-14 w-14"} ${decorativeClasses[index]}`}
            strokeWidth={1.5}
          />
        ))}
      </div>
      <nav className="relative z-10 mb-3 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link
          to="/"
          className="flex items-center gap-1 transition-colors hover:text-foreground"
        >
          <Home className="h-3.5 w-3.5" />
          Accueil
        </Link>
        {breadcrumb.map((b) => (
          <span key={b} className="flex items-center gap-1.5">
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground/80">{b}</span>
          </span>
        ))}
      </nav>
      <div className="relative z-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-bold text-foreground">
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {actions && (
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
