import { NavLink } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import logo from "@/assets/erp-logo.png";
import {
  LayoutDashboard,
  Users,
  Building,
  Package,
  ShoppingCart,
  Receipt,
  Bell,
  Settings,
  Bot,
  Warehouse,
  Truck,
  PackagePlus,
  FileText,
  Wallet,
  UserCog,
  FolderKanban,
} from "lucide-react";

// Structure plausible des éléments de navigation
const navItems = [
  {
    title: "Tableau de bord",
    url: "/",
    icon: LayoutDashboard,
    permission: "DASHBOARD:READ",
  },
  {
    title: "Catalogue",
    links: [
      {
        title: "Produits",
        url: "/produits",
        icon: Package,
        permission: "PRODUIT:READ",
      },
      {
        title: "Catégories",
        url: "/categories",
        icon: FolderKanban,
        permission: "CATEGORIE:READ",
      },
    ],
  },
  {
    title: "Tiers",
    links: [
      {
        title: "Clients",
        url: "/clients",
        icon: Users,
        permission: "CLIENT:READ",
      },
      {
        title: "Fournisseurs",
        url: "/fournisseurs",
        icon: Building,
        permission: "FOURNISSEUR:READ",
      },
    ],
  },
  {
    title: "Ventes",
    links: [
      {
        title: "Devis",
        url: "/devis",
        icon: FileText,
        permission: "DEVIS:READ",
      },
      {
        title: "Commandes",
        url: "/bons-commande-clients",
        icon: ShoppingCart,
        permission: "COMMANDE_CLIENT:READ",
      },
      {
        title: "Livraisons",
        url: "/bons-livraison",
        icon: Truck,
        permission: "LIVRAISON:READ",
      },
    ],
  },
  {
    title: "Achats",
    links: [
      {
        title: "Commandes",
        url: "/bons-commande-fournisseurs",
        icon: ShoppingCart,
        permission: "COMMANDE_FOURNISSEUR:READ",
      },
      {
        title: "Réceptions",
        url: "/receptions",
        icon: PackagePlus,
        permission: "RECEPTION:READ",
      },
    ],
  },
  {
    title: "Stocks",
    links: [
      {
        title: "État des stocks",
        url: "/stocks",
        icon: Warehouse,
        permission: "STOCK:READ",
      },
      {
        title: "Inventaires",
        url: "/inventaires",
        icon: FolderKanban,
        permission: "INVENTAIRE:READ",
      },
    ],
  },
  {
    title: "Facturation",
    links: [
      {
        title: "Factures",
        url: "/factures",
        icon: Receipt,
        permission: "FACTURE:READ",
      },
      {
        title: "Paiements",
        url: "/paiements",
        icon: Wallet,
        permission: "PAIEMENT:READ",
      },
    ],
  },
  { title: "Notifications", url: "/notifications", icon: Bell },
  {
    title: "Administration",
    links: [
      {
        title: "Utilisateurs",
        url: "/utilisateurs",
        icon: Users,
        permission: "UTILISATEUR:READ",
      },
      { title: "Rôles", url: "/roles", icon: UserCog, permission: "ROLE:READ" },
      {
        title: "Paramètres",
        url: "/parametres",
        icon: Settings,
        permission: "PARAMETRE:READ",
      },
    ],
  },
  {
    title: "Assistant IA",
    url: "/ai-assistant",
    icon: Bot,
    permission: "IA_CONFIG:READ",
  },
];

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const { hasPermission } = useAuth();

  const renderLink = (item: {
    title: string;
    url: string;
    icon: React.ElementType;
    permission?: string;
  }) => {
    if (item.permission) {
      const [module, action] = item.permission.split(":");
      if (!hasPermission(module, action)) return null;
    }

    return (
      <NavLink
        key={item.url}
        to={item.url}
        onClick={onNavigate}
        className={({ isActive }) =>
          cn(
            buttonVariants({ variant: isActive ? "secondary" : "ghost" }),
            "w-full justify-start gap-3",
          )
        }
      >
        <item.icon className="h-4 w-4" />
        {item.title}
      </NavLink>
    );
  };

  return (
    <div className="flex h-full flex-col bg-card">
      <div className="flex h-16 items-center gap-3 border-b px-4">
        <img src={logo} alt="Logo AC ERP" className="h-8 w-8 rounded-lg" />
        <span className="font-display text-lg font-bold">AC ERP</span>
      </div>
      <nav className="main-scrollbar flex-1 space-y-1 overflow-y-auto p-2">
        {navItems.map((item, index) => {
          if ("links" in item) {
            const visibleLinks = item.links.filter(
              (link) =>
                !link.permission ||
                hasPermission(
                  link.permission.split(":")[0],
                  link.permission.split(":")[1],
                ),
            );
            if (visibleLinks.length === 0) return null;
            return (
              <div key={index} className="space-y-1 py-2">
                <h4 className="px-3 pb-1 text-xs font-semibold uppercase text-muted-foreground">
                  {item.title}
                </h4>
                {visibleLinks.map(renderLink)}
              </div>
            );
          }
          return (
            <div key={index} className="py-1">
              {renderLink(item)}
            </div>
          );
        })}
      </nav>
    </div>
  );
}
