import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  User,
  Building2,
  SlidersHorizontal,
  ScrollText,
  Shield,
  MonitorSmartphone,
  LoaderCircle,
  Camera,
  Lock,
  Users,
  KeyRound,
  Package,
  FolderOpen,
  Factory,
  Warehouse,
  ShoppingCart,
  ShoppingBag,
  FileText,
  CreditCard,
  Bell,
  BarChart3,
  LineChart,
  Bot,
  Clock,
  Calendar,
  ChevronDown,
  DatabaseBackup,
} from "lucide-react";
import { PageHeader } from "@/components/erp/PageHeader";
import { SectionCard } from "@/components/erp/widgets";
import { AppModal } from "@/components/erp/AppModal";
import { useGlobalLoader } from "@/components/erp/GlobalLoader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { resolveAvatarUrl } from "@/lib/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { useAuth } from "@/hooks/useAuth";
import type { ComponentType } from "react";
import {
  changePassword,
  revokeOtherSessions,
  updateProfile,
  uploadAvatar,
} from "@/lib/api/auth.service";
import {
  getJournal,
  getSysteme,
  updateEntreprise,
  updateMaintenance,
  updateSysteme,
} from "@/lib/api/parametres.service";
import {
  createBackup,
  listBackups,
  restoreBackup,
  type BackupInfo,
} from "@/lib/api/backup.service";
import {
  AFRICAN_CURRENCIES,
  getCurrencyMeta,
  setStoredCurrency,
} from "@/lib/currency";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth.store";
import { useSettingsStore } from "@/stores/settings.store";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({ meta: [{ title: "Paramètres — AC ERP" }] }),
  component: SettingsPage,
});

// ── Types ──────────────────────────────────────────────────────────────────

type Profile = {
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  avatar?: string;
  statut?: string;
  role?: { nomRole: string };
};
type Company = {
  raisonSociale: string;
  numeroFiscal?: string;
  adresse?: string;
  telephone?: string;
  email?: string;
  devise: string;
  fuseauHoraire: string;
  logo?: string;
  lienPlateformeEchange?: string;
};
type SystemSettings = {
  notificationsEmail: boolean;
  alertesIa: boolean;
  facturationAutomatique: boolean;
  modeMaintenance: boolean;
};

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

type Audit = {
  id: string;
  action: string;
  module: string;
  newValues?: {
    status?: number;
    donnees?: Record<string, JsonValue>;
  };
  ipAddress?: string;
  createdAt: string;
  utilisateur?: { nom: string; prenom: string; email: string; avatar?: string };
};
type Session = { id: string; createdAt: string; lastSeenAt: string };
type ApiResponse<T> = { data: T };
type ApiError = { response?: { data?: { error?: { message?: unknown } } } };
type AvatarUploadResponse = { avatar: string };

// ── Helpers généraux ───────────────────────────────────────────────────────

const today = () => {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 10);
};
const bounds = (date: string) => ({
  dateFrom: new Date(`${date}T00:00:00`).toISOString(),
  dateTo: new Date(`${date}T23:59:59.999`).toISOString(),
});
const unwrap = <T,>(response: ApiResponse<T>) => response.data;
const errorMessage = (error: unknown, fallback: string) => {
  const message = (error as ApiError).response?.data?.error?.message;
  return typeof message === "string" ? message : fallback;
};

// ── Helpers journal d'activité ─────────────────────────────────────────────

const ACTION_META: Record<
  string,
  {
    label: string;
    color: string;
  }
> = {
  LOGIN: {
    label: "Connexion",
    color:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  },
  LOGOUT: {
    label: "Déconnexion",
    color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  },
  CREATE: {
    label: "Création",
    color:
      "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  },
  UPDATE: {
    label: "Modification",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  },
  DELETE: {
    label: "Suppression",
    color: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  },
  ARCHIVE: {
    label: "Archivage",
    color:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  },
  VALIDATE: {
    label: "Validation",
    color: "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300",
  },
  REJECT: {
    label: "Rejet",
    color: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
  },
  EXPORT: {
    label: "Export",
    color:
      "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
  },
  PAYMENT: {
    label: "Paiement",
    color:
      "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
  },
};

// ── Mapping icônes par module  ───────────────────────

const MODULE_ICONS: Record<string, ComponentType<{ className?: string }>> = {
  auth: Lock,
  users: Users,
  roles: KeyRound,
  produits: Package,
  categories: FolderOpen,
  clients: Users,
  fournisseurs: Factory,
  stocks: Warehouse,
  achats: ShoppingCart,
  ventes: ShoppingBag,
  factures: FileText,
  paiements: CreditCard,
  notifications: Bell,
  dashboard: BarChart3,
  rapports: LineChart,
  ia: Bot,
};

// ── Couleurs des points timeline par action ───────────────────────────────

const ACTION_DOT_CLASS: Record<string, string> = {
  CREATE: "bg-green-500",
  UPDATE: "bg-blue-500",
  DELETE: "bg-red-500",
  LOGIN: "bg-emerald-500",
  LOGOUT: "bg-gray-400",
  ARCHIVE: "bg-amber-500",
  VALIDATE: "bg-teal-500",
  REJECT: "bg-rose-500",
  EXPORT: "bg-violet-500",
  PAYMENT: "bg-indigo-500",
};

const ACTION_BADGE_CLASS: Record<string, string> = {
  CREATE:
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  UPDATE: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  DELETE: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  LOGIN:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  LOGOUT: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  ARCHIVE:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  VALIDATE: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300",
  REJECT: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
  EXPORT:
    "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
  PAYMENT:
    "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
};

const STATUS_LABELS: Record<number, { label: string; className: string }> = {
  200: {
    label: "Succès",
    className:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  },
  201: {
    label: "Créé",
    className:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  },
  204: {
    label: "Succès",
    className:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  },
  400: {
    label: "Requête invalide",
    className:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
  },
  401: {
    label: "Non autorisé",
    className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  },
  403: {
    label: "Accès refusé",
    className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  },
  404: {
    label: "Introuvable",
    className:
      "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  },
  500: {
    label: "Erreur serveur",
    className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  },
};

// ── Override explicite (libellés custom) ─────────────────────────────────
const DISPLAY_FIELDS: Record<string, string> = {
  nom: "Nom",
  prenom: "Prénom",
  email: "E-mail",
  telephone: "Téléphone",
  statut: "Statut",
  role: "Rôle",
  nomRole: "Rôle",
  raisonSociale: "Raison sociale",
  numeroFiscal: "NIU",
  devise: "Devise",
  fuseauHoraire: "Fuseau horaire",
  adresse: "Adresse",
  lienPlateformeEchange: "Lien plateforme d'échange",
};

// ── Champs techniques/sensibles à masquer ────────────────────────────────
const HIDDEN_FIELDS = new Set([
  "id",
  "createdAt",
  "updatedAt",
  "deletedAt",
  "password",
  "motDePasse",
  "idUtilisateur",
  "avatar",
  "mfaToken",
  "idCategorie",
  "idRole",
  "lockedUntil",
  "permissions",
  "failedAttempts",
  "refreshToken",
  "idProduit",
  "code",
  "donnees",
]);

const MODULE_AUDIT_LABELS: Record<
  string,
  { create: string; update: string; delete: string }
> = {
  users: {
    create: "a créé un utilisateur.",
    update: "a modifié un utilisateur.",
    delete: "a supprimé un utilisateur.",
  },
  roles: {
    create: "a créé un rôle.",
    update: "a modifié un rôle.",
    delete: "a supprimé un rôle.",
  },
  produits: {
    create: "a créé un produit.",
    update: "a modifié un produit.",
    delete: "a supprimé un produit.",
  },
  categories: {
    create: "a créé une catégorie.",
    update: "a modifié une catégorie.",
    delete: "a supprimé une catégorie.",
  },
  clients: {
    create: "a créé un client.",
    update: "a modifié un client.",
    delete: "a supprimé un client.",
  },
  fournisseurs: {
    create: "a créé un fournisseur.",
    update: "a modifié un fournisseur.",
    delete: "a supprimé un fournisseur.",
  },
  factures: {
    create: "a créé une facture.",
    update: "a modifié une facture.",
    delete: "a supprimé une facture.",
  },
  paiements: {
    create: "a enregistré un paiement.",
    update: "a modifié un paiement.",
    delete: "a supprimé un paiement.",
  },
};

// ── Génère un label lisible depuis une clé technique ─────────────────────
function toReadableLabel(key: string): string {
  // 1. Override explicite
  if (DISPLAY_FIELDS[key]) return DISPLAY_FIELDS[key];

  // 2. Génération automatique : camelCase / snake_case → mots
  return key
    .replace(/([A-Z])/g, " $1") // prixAchatHt → prix Achat Ht
    .replace(/_/g, " ") // snake_case → espaces
    .replace(/^./, (s) => s.toUpperCase()) // Majuscule initiale
    .trim();
}

// ── Regroupement par période ──────────────────────────────────────────────
function getAuditAction(action: string): string {
  const lower = action.toLowerCase();

  // ── CAS SPÉCIAUX (avant les verbes HTTP) ──
  if (lower.includes("login")) return "LOGIN";
  if (lower.includes("auth")) return "LOGIN";
  if (lower.includes("logout")) return "LOGOUT";
  if (lower.includes("verify-mfa") || lower.includes("verify_mfa"))
    return "VERIFY_MFA";

  // ── VERBES HTTP standards ──
  if (lower.startsWith("post")) return "CREATE";
  if (lower.startsWith("put") || lower.startsWith("patch")) return "UPDATE";
  if (lower.startsWith("delete")) return "DELETE";

  return action.toUpperCase();
}

function normalizeAuditModule(module: string): string {
  const lower = module.toLowerCase();

  if (lower === "utilisateurs") return "users";
  if (lower === "parametres") return "systeme";

  return lower;
}

function getAuditRouteInfo(action: string) {
  const [rawMethod = "", ...rest] = action.split(" ");
  const path = rest.join(" ").toLowerCase();
  const segments = path.split("/").filter(Boolean);

  return {
    method: rawMethod.toUpperCase(),
    path,
    root: segments[2] || segments[0] || "",
    resource: segments[3] || "",
    target: segments[4] || "",
    extra: segments[5] || "",
  };
}

function getAuditPayload(audit: Audit): Record<string, JsonValue> {
  const donnees = audit.newValues?.donnees;
  return donnees && typeof donnees === "object" && !Array.isArray(donnees)
    ? (donnees as Record<string, JsonValue>)
    : {};
}

function buildCrudSentence(action: string, module: string): string | null {
  const labels = MODULE_AUDIT_LABELS[module];
  if (!labels) return null;
  if (action === "CREATE") return labels.create;
  if (action === "UPDATE") return labels.update;
  if (action === "DELETE") return labels.delete;
  return null;
}

function buildSentence(audit: Audit): string {
  const action = getAuditAction(audit.action);
  const module = normalizeAuditModule(audit.module);
  const route = getAuditRouteInfo(audit.action);
  const payload = getAuditPayload(audit);

  if (route.root === "auth") {
    if (route.path.includes("/login")) return "s'est connecté.";
    if (route.path.includes("/logout")) return "s'est déconnecté.";
    if (route.path.includes("/verify-mfa")) {
      return "a validé la vérification en deux étapes.";
    }
    if (route.path.includes("/resend-mfa")) {
      return "a demandé le renvoi du code MFA.";
    }
    if (route.path.includes("/forgot-password")) {
      return "a demandé une réinitialisation de mot de passe.";
    }
    if (route.path.includes("/reset-password")) {
      return "a réinitialisé son mot de passe.";
    }
    if (route.path.includes("/refresh")) {
      return "a renouvelé sa session.";
    }
    if (route.path.includes("/me/avatar")) {
      return "a mis à jour sa photo de profil.";
    }
    if (route.path.includes("/change-password")) {
      return "a modifié son mot de passe.";
    }
    if (route.path.includes("/sessions/others")) {
      return "a révoqué les autres sessions actives.";
    }
    if (route.path.includes("/me")) {
      return "a mis à jour son profil.";
    }
  }

  if (route.root === "parametres") {
    if (route.path.includes("/entreprise")) {
      return "a modifié les informations de l'entreprise.";
    }
    if (route.path.includes("/systeme/maintenance")) {
      return "a modifié le mode maintenance.";
    }
    if (route.path.includes("/systeme")) {
      return "a modifié les paramètres système.";
    }
  }

  if (route.root === "notifications") {
    if (route.path.includes("/tout-lire")) {
      return "a marqué toutes les notifications comme lues.";
    }
    if (route.path.includes("/lire")) {
      return "a marqué une notification comme lue.";
    }
  }

  if (route.root === "stocks") {
    if (route.path.includes("/ajustement")) {
      if (payload.typeMouvement === "AJUSTEMENT_POS") {
        return "a effectué un ajustement positif de stock.";
      }
      if (payload.typeMouvement === "AJUSTEMENT_NEG") {
        return "a effectué un ajustement négatif de stock.";
      }
      return "a effectué un ajustement de stock.";
    }
    if (
      route.path.includes("/inventaires/") &&
      route.path.includes("/valider")
    ) {
      return "a validé un inventaire.";
    }
    if (route.path.includes("/inventaires")) {
      return "a créé un inventaire.";
    }
  }

  if (route.root === "achats") {
    if (route.path.includes("/demandes/") && route.path.includes("/valider")) {
      return "a validé une demande d'achat.";
    }
    if (route.path.includes("/demandes")) {
      return "a créé une demande d'achat.";
    }
    if (
      route.path.includes("/bons-commande/") &&
      route.path.includes("/envoyer")
    ) {
      return "a envoyé un bon de commande fournisseur.";
    }
    if (
      route.path.includes("/bons-commande/") &&
      route.path.includes("/statut")
    ) {
      if (payload.action === "SUBMIT") {
        return "a soumis un bon de commande fournisseur.";
      }
      if (payload.action === "VALIDATE") {
        return "a validé un bon de commande fournisseur.";
      }
      if (payload.action === "BACK_TO_DRAFT") {
        return "a remis un bon de commande fournisseur en brouillon.";
      }
      if (payload.action === "CANCEL") {
        return "a annulé un bon de commande fournisseur.";
      }
      return "a modifié le statut d'un bon de commande fournisseur.";
    }
    if (
      route.path.includes("/bons-commande/") &&
      route.path.includes("/dupliquer")
    ) {
      return "a dupliqué un bon de commande fournisseur.";
    }
    if (
      route.path.includes("/bons-commande/") &&
      route.path.includes("/facture")
    ) {
      return "a créé une facture d'achat depuis un bon de commande.";
    }
    if (
      route.path.includes("/bons-commande/") &&
      route.path.includes("/reception")
    ) {
      return "a enregistré une réception de marchandises.";
    }
    if (route.path.includes("/bons-commande")) {
      return "a créé un bon de commande fournisseur.";
    }
  }

  if (route.root === "ventes") {
    if (route.path.includes("/devis/") && route.path.includes("/envoyer")) {
      return "a envoyé un devis.";
    }
    if (route.path.includes("/devis/") && route.path.includes("/convertir")) {
      return "a converti un devis en commande.";
    }
    if (route.path.includes("/devis")) {
      return "a créé un devis.";
    }
    if (
      route.path.includes("/commandes/") &&
      route.path.includes("/confirmer")
    ) {
      return "a confirmé une commande client.";
    }
    if (
      route.path.includes("/commandes/") &&
      route.path.includes("/livraison")
    ) {
      return "a créé un bon de livraison client.";
    }
    if (route.path.includes("/commandes")) {
      return "a créé une commande client.";
    }
  }

  if (route.root === "factures") {
    if (route.path.includes("/avoir")) {
      return "a créé un avoir.";
    }
    if (route.path.includes("/envoyer")) {
      return "a envoyé une facture.";
    }
    if (route.method === "POST") {
      return "a créé une facture.";
    }
  }

  if (route.root === "paiements" && route.method === "POST") {
    return "a enregistré un paiement.";
  }

  if (route.root === "ia") {
    if (route.path.includes("/rapport-auto")) {
      return "a généré un rapport automatique avec l'IA.";
    }
    if (route.path.includes("/chat")) {
      return "a lancé une interaction avec l'assistant IA.";
    }
  }

  switch (action) {
    case "LOGIN":
      return "s'est connecté.";

    case "LOGOUT":
      return "s'est déconnecté.";

    case "VERIFY_MFA":
    case "VERIFY-MFA":
      return "a validé la vérification en deux étapes.";

    case "CREATE":
      return (
        buildCrudSentence(action, module) ??
        (module === "stocks"
          ? "a créé un mouvement de stock."
          : module === "achats"
            ? "a créé un élément du module achats."
            : module === "ventes"
              ? "a créé un élément du module ventes."
              : module === "inventaires"
                ? "a créé un inventaire."
                : "a créé un élément.")
      );

    case "UPDATE":
      switch (module) {
        case "me":
        case "auth":
          return "a mis à jour son profil.";
        case "users":
        case "roles":
        case "produits":
        case "categories":
        case "clients":
        case "fournisseurs":
        case "factures":
        case "paiements":
          return (
            buildCrudSentence(action, module) || "a effectué une modification."
          );
        case "stocks":
          return "a mis à jour le stock.";
        case "entreprise":
          return "a modifié les informations de l'entreprise.";
        case "systeme":
          return "a modifié les paramètres système.";
        default:
          return "a effectué une modification.";
      }

    case "DELETE":
      return buildCrudSentence(action, module) || "a supprimé un élément.";

    case "ARCHIVE":
      return "a archivé un élément.";

    case "VALIDATE":
      return "a validé une opération.";

    case "REJECT":
      return "a rejeté une opération.";

    case "EXPORT":
      return "a exporté des données.";

    case "PAYMENT":
      return "a enregistré un paiement.";

    default:
      return "a effectué une action.";
  }
}

function fmtTime(date: string | Date): string {
  return new Date(date).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

// ── Formatage date + heure d'une sauvegarde ──────────────────────────────
function fmtBackupDateTime(value: string): { time: string; date: string } {
  const d = new Date(value);
  if (isNaN(d.getTime())) return { time: "—", date: "—" };
  return {
    time: new Intl.DateTimeFormat("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(d),
    date: new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(d),
  };
}

function getDisplayName(user?: Audit["utilisateur"]) {
  const fullName = `${user?.prenom || ""} ${user?.nom || ""}`.trim();

  return fullName || user?.email || "Utilisateur";
}

function getInitials(user?: Audit["utilisateur"]) {
  const initials = `${user?.prenom?.[0] || ""}${user?.nom?.[0] || ""}`;
  return (initials || user?.email?.slice(0, 2) || "AC").toUpperCase();
}

function formatAuditValue(value: JsonValue): string {
  if (value === null || value === undefined) {
    return "—";
  }

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value.join(", ");
  }

  // Objet
  const obj = value as Record<string, JsonValue>;

  // Cas rôle
  if ("nomRole" in obj) {
    return String(obj.nomRole);
  }

  // Cas utilisateur
  if ("prenom" in obj || "nom" in obj) {
    return `${obj.prenom ?? ""} ${obj.nom ?? ""}`.trim();
  }

  // Cas catégorie
  if ("nomCategorie" in obj) {
    return String(obj.nomCategorie);
  }

  // Cas produit
  if ("nomProduit" in obj) {
    return String(obj.nomProduit);
  }

  // Cas entreprise
  if ("raisonSociale" in obj) {
    return String(obj.raisonSociale);
  }

  return "Objet";
}

function getDisplayData(audit: Audit) {
  const donnees = audit.newValues?.donnees;

  if (!donnees || typeof donnees !== "object") {
    return [];
  }

  return Object.entries(donnees)
    .filter(([key]) => !HIDDEN_FIELDS.has(key))
    .map(([key, value]) => ({
      label: toReadableLabel(key),
      value: formatAuditValue(value),
    }));
}

// ── Composant AuditRow ─────────────────────────────────────────────────────

function AuditRow({ audit }: { audit: Audit }) {
  const [expanded, setExpanded] = useState(false);
  const actor = audit.utilisateur
    ? `${audit.utilisateur.prenom} ${audit.utilisateur.nom}`
    : "Système";
  const isSystem = !audit.utilisateur;

  const action = getAuditAction(audit.action);
  const module = normalizeAuditModule(audit.module);

  const ModuleIcon = MODULE_ICONS[module];
  const dotClass = ACTION_DOT_CLASS[action] ?? "bg-gray-400";
  const badgeClass = ACTION_BADGE_CLASS[action] ?? ACTION_BADGE_CLASS.LOGOUT;
  const hasDetails = audit.newValues && Object.keys(audit.newValues).length > 0;

  const displayData = getDisplayData(audit);

  const formatDateTime = (value: string) => {
    const date = new Date(value);
    if (isNaN(date.getTime())) return { time: "", date: "" };

    const time = new Intl.DateTimeFormat("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);

    const formattedDate = new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);

    return { time, date: formattedDate };
  };

  const { time, date } = formatDateTime(audit.createdAt);

  const status =
    typeof audit.newValues?.status === "number"
      ? audit.newValues.status
      : undefined;

  return (
    <div
      className={cn(
        "group relative rounded-2xl border border-border/70 bg-card/80 px-5 py-4 backdrop-blur-sm transition-all hover:border-primary/30 hover:shadow-md",
        "hover:border-primary/30 hover:shadow-sm",
        expanded && "border-primary/50 shadow-sm",
        hasDetails && "cursor-pointer",
      )}
      onClick={() => hasDetails && setExpanded((v) => !v)}
    >
      {/* Point timeline */}
      <div className="absolute -left-8 top-0 bottom-0 flex flex-col items-center">
        <div className="flex-1 w-px bg-border" />

        <div
          className={cn(
            "h-3 w-3 rounded-full border-2 border-background",
            dotClass,
          )}
        />

        <div className="flex-1 w-px bg-border" />
      </div>

      <div className="flex items-start gap-3">
        {/* Avatar */}
        <Avatar className="h-9 w-8">
          <AvatarImage
            src={resolveAvatarUrl(audit?.utilisateur?.avatar)}
            alt={getDisplayName(audit.utilisateur)}
          />
          <AvatarFallback className="bg-gradient-primary text-xs font-semibold text-white">
            {getInitials(audit.utilisateur)}
          </AvatarFallback>
        </Avatar>

        {/* Contenu */}
        <div className="min-w-0 flex-1">
          <p className="text-sm leading-snug text-foreground">
            <span className="font-semibold">{actor}</span>{" "}
            <span className="text-muted-foreground">
              {buildSentence(audit)}
            </span>
          </p>

          {/* Badges */}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-[11px] text-muted-foreground">
              {ModuleIcon && <ModuleIcon className="h-3 w-3" />}
              {audit.module}
            </span>

            <span
              className={cn(
                "rounded-md px-2 py-1 text-[11px] font-medium",
                badgeClass,
              )}
            >
              {ACTION_META[action]?.label}
            </span>

            {audit.ipAddress && (
              <span className="font-mono text-[11px] text-muted-foreground">
                {audit.ipAddress}
              </span>
            )}
          </div>

          {/* Détails dépliables */}
          {hasDetails && expanded && (
            <div className="mt-3 rounded-lg border border-border/60 bg-muted/40 p-3 animate-in fade-in slide-in-from-top-1 duration-200">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Détails
              </p>
              <div className="space-y-4">
                {status && (
                  <div>
                    <p className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">
                      Statut
                    </p>

                    <span
                      className={cn(
                        "inline-flex rounded-md px-2 py-1 text-xs font-medium",
                        STATUS_LABELS[status]?.className ??
                          "bg-gray-100 text-gray-700",
                      )}
                    >
                      {STATUS_LABELS[status]?.label ?? status}
                    </span>
                  </div>
                )}

                {displayData.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
                      Nouvelles données
                    </p>

                    <div className="space-y-2">
                      {displayData.map((item) => (
                        <div
                          key={item.label}
                          className="flex items-center justify-between rounded-lg border bg-background p-3"
                        >
                          <span className="text-sm text-muted-foreground">
                            {item.label}
                          </span>

                          <span className="font-medium">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Heure + chevron */}
        <div className="flex shrink-0 flex-col items-end gap-0.5">
          <span className="tabular-nums text-xs text-muted-foreground">
            <div className="inline-flex flex-col items-end gap-0.5 rounded-md border border-border/40 bg-muted/30 px-2.5 py-1 text-xs">
              <div className="flex items-center gap-1 font-semibold text-foreground/80">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span>{time}</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <Calendar className="h-3 w-3 text-muted-foreground/70" />
                <span>{date}</span>
              </div>
            </div>
          </span>
          {hasDetails && (
            <ChevronDown
              className={cn(
                "h-4 w-4 text-muted-foreground/50 transition-transform duration-200",
                expanded && "rotate-180",
              )}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ── Page principale ────────────────────────────────────────────────────────

function SettingsPage() {
  const { hasPermission } = useAuth();
  const { runWithLoader } = useGlobalLoader();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [system, setSystem] = useState<SystemSettings | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [audits, setAudits] = useState<Audit[]>([]);
  const [logDate, setLogDate] = useState(today);
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>(
    {},
  );
  const [companyErrors, setCompanyErrors] = useState<Record<string, string>>(
    {},
  );
  const [passwords, setPasswords] = useState({
    current: "",
    next: "",
    confirm: "",
  });
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>(
    {},
  );
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [loading, setLoading] = useState(true);
  const [backups, setBackups] = useState<BackupInfo[]>([]);
  const [creatingBackup, setCreatingBackup] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState<BackupInfo | null>(null);
  const [restoring, setRestoring] = useState(false);

  const canManageSettings = hasPermission("users", "modifier");
  const fetchProfile = useAuthStore((state) => state.fetchProfile);
  const fetchSessions = useAuthStore((state) => state.fetchSessions);
  const setCachedUser = useAuthStore((state) => state.setUser);
  const setCachedSessions = useAuthStore((state) => state.setSessions);
  const fetchEntreprise = useSettingsStore((state) => state.fetchEntreprise);
  const fetchSysteme = useSettingsStore((state) => state.fetchSysteme);
  const setCachedEntreprise = useSettingsStore((state) => state.setEntreprise);
  const setCachedSysteme = useSettingsStore((state) => state.setSysteme);
  const isSuperAdmin = profile?.role?.nomRole === "SUPER_ADMIN" || "ADMIN";
  // L'API /backup exige la permission users:supprimer (super admin)
  const canManageBackups = hasPermission("users", "supprimer");

  // Chargement initial
  useEffect(() => {
    let alive = true;

    async function loadInitialData() {
      const [meResult, sessionsResult, entrepriseResult, systemeResult] =
        await Promise.allSettled([
          fetchProfile(),
          fetchSessions(),
          canManageSettings ? fetchEntreprise() : Promise.resolve(null),
          canManageSettings ? fetchSysteme() : Promise.resolve(null),
        ]);

      if (!alive) return;

      if (meResult.status === "fulfilled") {
        setProfile(meResult.value as Profile);
      }
      if (sessionsResult.status === "fulfilled") {
        setSessions(sessionsResult.value as Session[]);
      }
      if (canManageSettings && entrepriseResult.status === "fulfilled") {
        const loadedCompany = entrepriseResult.value as Company;
        setCompany(loadedCompany);
        setStoredCurrency(loadedCompany?.devise);
      }
      if (canManageSettings && systemeResult.status === "fulfilled") {
        setSystem(systemeResult.value as SystemSettings);
      }
      if (
        meResult.status === "rejected" ||
        sessionsResult.status === "rejected" ||
        (canManageSettings && entrepriseResult.status === "rejected") ||
        (canManageSettings && systemeResult.status === "rejected")
      ) {
        toast.error("Certains paramètres n'ont pas pu être chargés");
      }

      setLoading(false);
    }

    void loadInitialData();
    return () => {
      alive = false;
    };
  }, [
    canManageSettings,
    fetchEntreprise,
    fetchProfile,
    fetchSessions,
    fetchSysteme,
  ]);

  // Chargement journal
  useEffect(() => {
    if (!canManageSettings) {
      setAudits([]);
      return;
    }
    getJournal(bounds(logDate))
      .then((r) => setAudits(unwrap(r as ApiResponse<Audit[]>) || []))
      .catch(() => toast.error("Impossible de charger le journal"));
  }, [logDate, canManageSettings]);

  // Chargement des sauvegardes (synchronisation)
  useEffect(() => {
    if (!canManageBackups) {
      setBackups([]);
      return;
    }
    listBackups()
      .then((r) => setBackups(unwrap(r as ApiResponse<BackupInfo[]>) || []))
      .catch(() => toast.error("Impossible de charger les sauvegardes"));
  }, [canManageBackups]);

  // Nettoyage preview avatar
  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  // ── Actions ──────────────────────────────────────────────────────────────

  const saveProfile = async () => {
    if (!profile) return;
    const newErrors: Record<string, string> = {};
    if (!profile.nom.trim()) newErrors.nom = "Le nom est obligatoire";
    if (!profile.prenom.trim()) newErrors.prenom = "Le prénom est obligatoire";
    if (!profile.email.trim()) newErrors.email = "L'e-mail est obligatoire";
    setProfileErrors(newErrors);
    if (Object.keys(newErrors).length) return;

    try {
      const payload = { ...profile };
      if (avatarFile) {
        const uploadResponse = await runWithLoader(uploadAvatar(avatarFile), {
          target: "main",
          label: "Import de la photo...",
        });
        payload.avatar = unwrap(
          uploadResponse as ApiResponse<AvatarUploadResponse>,
        ).avatar;
      }
      const response = await runWithLoader(updateProfile(payload), {
        target: "main",
        label: "Enregistrement du profil...",
      });
      const updated = unwrap(response as ApiResponse<Profile>);
      setProfile(updated);
      setCachedUser(updated);
      setProfileErrors({});
      setAvatarFile(null);
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
        setAvatarPreview("");
      }
      localStorage.setItem("erp_user", JSON.stringify(updated));
      window.dispatchEvent(
        new CustomEvent("erp:user-updated", { detail: updated }),
      );
      toast.success("Profil enregistré");
    } catch (error: unknown) {
      toast.error(errorMessage(error, "Échec de l'enregistrement"));
    }
  };

  const saveCompany = async () => {
    if (!company) return;
    const newErrors: Record<string, string> = {};
    if (!company.raisonSociale.trim())
      newErrors.raisonSociale = "La raison sociale est obligatoire";
    if (!company.devise.trim()) newErrors.devise = "La devise est obligatoire";
    if (!company.fuseauHoraire.trim())
      newErrors.fuseauHoraire = "Le fuseau horaire est obligatoire";
    setCompanyErrors(newErrors);
    if (Object.keys(newErrors).length) return;

    try {
      const response = await updateEntreprise(company);
      const updatedCompany = unwrap(response as ApiResponse<Company>);
      setCompany(updatedCompany);
      setCachedEntreprise(updatedCompany);
      setStoredCurrency(updatedCompany?.devise);
      setCompanyErrors({});
      toast.success("Paramètres entreprise enregistrés");
    } catch {
      toast.error("Échec de l'enregistrement");
    }
  };

  const updateProfileField = (field: keyof Profile, value: string) => {
    if (!profile) return;
    setProfile({ ...profile, [field]: value });
    if (profileErrors[field]) setProfileErrors((p) => ({ ...p, [field]: "" }));
  };

  const updateCompanyField = (field: keyof Company, value: string) => {
    if (!company) return;
    setCompany({ ...company, [field]: value });
    if (companyErrors[field]) setCompanyErrors((p) => ({ ...p, [field]: "" }));
  };

  const handleAvatarChange = (file?: File) => {
    if (!file || !profile) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Veuillez choisir une image JPG, PNG ou équivalent");
      return;
    }
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const toggleSystem = async (field: keyof SystemSettings, value: boolean) => {
    if (!system) return;
    try {
      const response =
        field === "modeMaintenance"
          ? await updateMaintenance(value)
          : await updateSysteme({ [field]: value });
      const updatedSystem = unwrap(response as ApiResponse<SystemSettings>);
      setSystem(updatedSystem);
      setCachedSysteme(updatedSystem);
      toast.success("Paramètre mis à jour");
    } catch (error: unknown) {
      toast.error(errorMessage(error, "Modification refusée"));
    }
  };

  const submitPassword = async () => {
    const newErrors: Record<string, string> = {};
    if (!passwords.current.trim())
      newErrors.current = "Le mot de passe actuel est obligatoire";
    if (!passwords.next.trim())
      newErrors.next = "Le nouveau mot de passe est obligatoire";
    if (!passwords.confirm.trim())
      newErrors.confirm = "La confirmation est obligatoire";
    if (
      passwords.next &&
      passwords.confirm &&
      passwords.next !== passwords.confirm
    ) {
      newErrors.confirm = "Les nouveaux mots de passe ne correspondent pas";
    }
    setPasswordErrors(newErrors);
    if (Object.keys(newErrors).length) return;

    try {
      await changePassword(passwords.current, passwords.next);
      setPasswords({ current: "", next: "", confirm: "" });
      setPasswordErrors({});
      toast.success("Mot de passe mis à jour");
    } catch (error: unknown) {
      toast.error(errorMessage(error, "Échec du changement de mot de passe"));
    }
  };

  const revokeSessions = async () => {
    try {
      await revokeOtherSessions();
      const updatedSessions = await fetchSessions(true);
      setSessions(updatedSessions as Session[]);
      setCachedSessions(updatedSessions);
      toast.success("Les autres sessions ont été déconnectées");
    } catch {
      toast.error("Impossible de révoquer les sessions");
    }
  };

  const refreshBackups = async () => {
    try {
      const r = await listBackups();
      setBackups(unwrap(r as ApiResponse<BackupInfo[]>) || []);
    } catch {
      // La liste sera rafraîchie au prochain chargement
    }
  };

  const handleCreateBackup = async () => {
    if (creatingBackup) return;
    setCreatingBackup(true);
    try {
      await createBackup();
      await refreshBackups();
      toast.success("Sauvegarde créée avec succès");
    } catch (error: unknown) {
      toast.error(errorMessage(error, "Échec de la création de la sauvegarde"));
    } finally {
      setCreatingBackup(false);
    }
  };

  const handleRestore = async () => {
    if (!selectedBackup || restoring) return;

    // Vérifie l'état FRAIS du mode maintenance côté serveur
    try {
      const r = await getSysteme();
      const sys = unwrap(r as ApiResponse<SystemSettings>);
      setSystem(sys);
      setCachedSysteme(sys);
      if (!sys?.modeMaintenance) {
        toast.warning("Mode maintenance requis", {
          description:
            "La restauration nécessite que le système soit préalablement placé en mode maintenance. Activez-le dans les paramètres système avant de restaurer les données.",
        });
        return;
      }
    } catch {
      toast.error("Impossible de vérifier l'état du système");
      return;
    }

    setRestoring(true);
    try {
      await restoreBackup(selectedBackup.filename);
      toast.success("Base de données restaurée avec succès");
      setSelectedBackup(null);
    } catch (error: unknown) {
      toast.error(errorMessage(error, "Échec de la restauration"));
    } finally {
      setRestoring(false);
      await refreshBackups();
    }
  };

  const logDescription = useMemo(
    () =>
      `${audits.length} activité${audits.length > 1 ? "s" : ""} pour cette date`,
    [audits.length],
  );

  // ── Rendu ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <LoaderCircle className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Paramètres & configuration"
        description="Profil, entreprise, système et sécurité"
        breadcrumb={["Administration", "Paramètres"]}
      />

      <Tabs defaultValue="profile">
        <TabsList className="mb-4 flex-wrap">
          <TabsTrigger value="profile" className="gap-1.5">
            <User className="h-4 w-4" /> Profil
          </TabsTrigger>
          {canManageSettings ? (
            <>
              <TabsTrigger value="company" className="gap-1.5">
                <Building2 className="h-4 w-4" /> Entreprise
              </TabsTrigger>
              <TabsTrigger value="system" className="gap-1.5">
                <SlidersHorizontal className="h-4 w-4" /> Système
              </TabsTrigger>
            </>
          ) : null}
          <TabsTrigger value="security" className="gap-1.5">
            <Shield className="h-4 w-4" /> Sécurité
          </TabsTrigger>
          {canManageSettings ? (
            <TabsTrigger value="log" className="gap-1.5">
              <ScrollText className="h-4 w-4" /> Journal
            </TabsTrigger>
          ) : null}
        </TabsList>

        {/* ── Profil ── */}
        <TabsContent value="profile">
          <SectionCard
            title="Profil utilisateur"
            description="Vos informations personnelles"
          >
            {profile && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label className="mb-2 block">Photo de profil</Label>
                  <label className="group relative flex h-20 w-20 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-border bg-secondary text-muted-foreground shadow-sm transition-colors hover:border-primary hover:text-primary">
                    {avatarPreview || profile.avatar ? (
                      <img
                        src={avatarPreview || resolveAvatarUrl(profile.avatar)}
                        alt="Photo de profil"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User className="h-9 w-9" />
                    )}
                    <span className="absolute inset-0 flex items-center justify-center bg-background/70 opacity-0 transition-opacity group-hover:opacity-100">
                      <Camera className="h-5 w-5" />
                    </span>
                    <Input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                      className="sr-only"
                      onChange={(e) => {
                        handleAvatarChange(e.target.files?.[0]);
                        e.target.value = "";
                      }}
                    />
                  </label>
                </div>
                <Field
                  label="Nom"
                  value={profile.nom}
                  placeholder="Entrez votre nom"
                  required
                  error={profileErrors.nom}
                  onChange={(v) => updateProfileField("nom", v)}
                />
                <Field
                  label="Prénom"
                  value={profile.prenom}
                  placeholder="Entrez votre prénom"
                  required
                  error={profileErrors.prenom}
                  onChange={(v) => updateProfileField("prenom", v)}
                />
                <Field
                  label="Adresse e-mail"
                  value={profile.email}
                  placeholder="exemple@ac-erp.com"
                  required
                  error={profileErrors.email}
                  onChange={(v) => updateProfileField("email", v)}
                  type="email"
                />
                <Field
                  label="Téléphone"
                  value={profile.telephone || ""}
                  placeholder="Entrez votre numéro"
                  onChange={(v) => updateProfileField("telephone", v)}
                />
                <Field
                  label="Rôle"
                  value={profile.role?.nomRole || ""}
                  placeholder="Rôle attribué"
                  disabled
                />
                <Field
                  label="Statut"
                  value={profile.statut || ""}
                  placeholder="Statut du compte"
                  disabled
                />
              </div>
            )}
            <Button className="mt-4" onClick={saveProfile}>
              Enregistrer
            </Button>
          </SectionCard>
        </TabsContent>

        {/* ── Entreprise ── */}
        {canManageSettings ? (
          <TabsContent value="company">
            <SectionCard
              title="Paramètres entreprise"
              description="Informations utilisées sur les documents et rapports"
            >
              {company && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    label="Raison sociale"
                    value={company.raisonSociale}
                    placeholder="Nom officiel de l'entreprise"
                    required
                    error={companyErrors.raisonSociale}
                    onChange={(v) => updateCompanyField("raisonSociale", v)}
                  />
                  <Field
                    label="Identifiant fiscal"
                    value={company.numeroFiscal || ""}
                    placeholder="Numéro fiscal ou NIU"
                    onChange={(v) => updateCompanyField("numeroFiscal", v)}
                  />
                  <Field
                    label="Adresse"
                    value={company.adresse || ""}
                    placeholder="Adresse complète"
                    onChange={(v) => updateCompanyField("adresse", v)}
                  />
                  <Field
                    label="Téléphone"
                    value={company.telephone || ""}
                    placeholder="Numéro de téléphone"
                    onChange={(v) => updateCompanyField("telephone", v)}
                  />
                  <Field
                    label="E-mail"
                    value={company.email || ""}
                    placeholder="contact@entreprise.com"
                    onChange={(v) => updateCompanyField("email", v)}
                    type="email"
                  />
                  <div className="space-y-1.5">
                    <Label>
                      Devise <span className="ml-1 text-destructive">*</span>
                    </Label>
                    <SearchableSelect
                      value={company.devise}
                      onValueChange={(v) => updateCompanyField("devise", v)}
                      options={AFRICAN_CURRENCIES.map((c) => ({
                        value: c.code,
                        label: `${c.code} - ${c.name} (${c.symbol})`,
                      }))}
                      placeholder="Selectionnez une devise"
                      searchPlaceholder="Rechercher une devise"
                      emptyMessage="Aucune devise trouvee"
                    />
                    <p className="text-xs text-muted-foreground">
                      Symbole utilise: {getCurrencyMeta(company.devise).symbol}
                    </p>
                    {companyErrors.devise && (
                      <p className="text-xs text-destructive">
                        {companyErrors.devise}
                      </p>
                    )}
                  </div>
                  <Field
                    label="Fuseau horaire"
                    value={company.fuseauHoraire}
                    placeholder="Africa/Douala"
                    required
                    error={companyErrors.fuseauHoraire}
                    onChange={(v) => updateCompanyField("fuseauHoraire", v)}
                  />
                  <Field
                    label="Logo (URL)"
                    value={company.logo || ""}
                    placeholder="https://exemple.com/logo.png"
                    onChange={(v) => updateCompanyField("logo", v)}
                  />
                  <Field
                    label="Lien plateforme d'échange"
                    value={company.lienPlateformeEchange || ""}
                    placeholder="https://chat.whatsapp.com/... ou https://t.me/..."
                    onChange={(v) =>
                      updateCompanyField("lienPlateformeEchange", v)
                    }
                  />
                </div>
              )}
              <Button className="mt-4" onClick={saveCompany}>
                Enregistrer
              </Button>
            </SectionCard>
          </TabsContent>
        ) : null}

        {/* ── Système ── */}
        {canManageSettings ? (
          <TabsContent value="system">
            <div className="grid gap-4">
              <SectionCard
                title="Paramètres système"
                description="Préférences globales de la plateforme"
              >
                {system && (
                  <div className="space-y-4">
                    <Setting
                      label="Notifications par e-mail"
                      description="Recevoir les alertes importantes par e-mail"
                      checked={system.notificationsEmail}
                      onChange={(v) => toggleSystem("notificationsEmail", v)}
                    />
                    <Setting
                      label="Alertes IA proactives"
                      description="Prévisions et recommandations automatiques"
                      checked={system.alertesIa}
                      onChange={(v) => toggleSystem("alertesIa", v)}
                    />
                    <Setting
                      label="Facturation automatique"
                      description="Générer les factures à la validation des ventes"
                      checked={system.facturationAutomatique}
                      onChange={(v) =>
                        toggleSystem("facturationAutomatique", v)
                      }
                    />
                    <Setting
                      label="Mode maintenance"
                      description={
                        isSuperAdmin
                          ? "Bloque les écritures pour tous sauf le super administrateur"
                          : "Seul le super administrateur peut modifier ce réglage"
                      }
                      checked={system.modeMaintenance}
                      disabled={!isSuperAdmin}
                      onChange={(v) => toggleSystem("modeMaintenance", v)}
                    />
                  </div>
                )}
              </SectionCard>

              {/* ── Synchronisation (sauvegardes) ── */}
              {canManageBackups ? (
                <SectionCard
                  title="Synchronisation"
                  description="Sauvegardes de la base de données"
                >
                  <div className="flex items-center gap-3 rounded-lg bg-secondary/50 p-4">
                    <DatabaseBackup className="h-8 w-8 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {backups.length} sauvegarde
                        {backups.length > 1 ? "s" : ""} disponible
                        {backups.length > 1 ? "s" : ""}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Sauvegarde automatique chaque nuit à 2h00
                      </p>
                    </div>
                  </div>

                  {backups.length > 0 && (
                    <div className="mt-3 max-h-52 space-y-2 overflow-y-auto pr-1">
                      {backups.slice(0, 5).map((backup) => {
                        const { time, date } = fmtBackupDateTime(
                          backup.createdAt,
                        );
                        return (
                          <button
                            key={backup.filename}
                            type="button"
                            onClick={() => setSelectedBackup(backup)}
                            className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg border border-border/70 bg-background p-3 text-left transition-colors hover:border-primary/40 hover:bg-muted/30"
                          >
                            <div className="min-w-0">
                              <p className="truncate font-mono text-xs text-muted-foreground">
                                {backup.filename}
                              </p>
                              <p className="text-[11px] text-muted-foreground/70">
                                {backup.sizeKb} Ko
                              </p>
                            </div>
                            <div className="inline-flex shrink-0 flex-col items-end gap-0.5 rounded-md border border-border/40 bg-muted/30 px-2.5 py-1 text-xs">
                              <div className="flex items-center gap-1 font-semibold text-foreground/80">
                                <Clock className="h-3 w-3 text-muted-foreground" />
                                <span>{time}</span>
                              </div>
                              <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                <Calendar className="h-3 w-3 text-muted-foreground/70" />
                                <span>{date}</span>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  <Button
                    className="mt-4 w-full"
                    onClick={handleCreateBackup}
                    disabled={creatingBackup}
                  >
                    {creatingBackup ? (
                      <>
                        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                        Sauvegarde en cours...
                      </>
                    ) : (
                      <>
                        <DatabaseBackup className="mr-2 h-4 w-4" />
                        Lancer la sauvegarde
                      </>
                    )}
                  </Button>
                </SectionCard>
              ) : null}
            </div>
          </TabsContent>
        ) : null}

        {/* ── Sécurité ── */}
        <TabsContent value="security">
          <div className="grid gap-4 lg:grid-cols-2">
            <SectionCard
              title="Sécurité"
              description="Modification du mot de passe"
            >
              <div className="space-y-3">
                <Field
                  label="Mot de passe actuel"
                  type="password"
                  value={passwords.current}
                  error={passwordErrors.current}
                  placeholder="Saisissez le mot de passe actuel"
                  required
                  autoComplete="off"
                  onChange={(v) => {
                    setPasswords({ ...passwords, current: v });
                    if (passwordErrors.current)
                      setPasswordErrors((p) => ({ ...p, current: "" }));
                  }}
                />
                <Field
                  label="Nouveau mot de passe"
                  type="password"
                  value={passwords.next}
                  error={passwordErrors.next}
                  placeholder="Saisissez le nouveau mot de passe"
                  required
                  autoComplete="new-password"
                  onChange={(v) => {
                    setPasswords({ ...passwords, next: v });
                    if (passwordErrors.next)
                      setPasswordErrors((p) => ({ ...p, next: "" }));
                  }}
                />
                <Field
                  label="Confirmer le mot de passe"
                  type="password"
                  value={passwords.confirm}
                  error={passwordErrors.confirm}
                  placeholder="Confirmez le nouveau mot de passe"
                  required
                  autoComplete="new-password"
                  onChange={(v) => {
                    setPasswords({ ...passwords, confirm: v });
                    if (passwordErrors.confirm)
                      setPasswordErrors((p) => ({ ...p, confirm: "" }));
                  }}
                />
              </div>
              <Button className="mt-4" onClick={submitPassword}>
                Mettre à jour
              </Button>
            </SectionCard>

            <SectionCard
              title="Sessions actives"
              description="Contrôlez les connexions à votre compte"
            >
              <div className="flex items-center gap-3 rounded-lg bg-secondary/50 p-4">
                <MonitorSmartphone className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {sessions.length} session{sessions.length > 1 ? "s" : ""}{" "}
                    active{sessions.length > 1 ? "s" : ""}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Révoquez les jetons actifs sur les autres appareils
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                className="mt-4 w-full"
                onClick={revokeSessions}
              >
                Déconnecter les autres sessions
              </Button>
            </SectionCard>
          </div>
        </TabsContent>

        {/* ── Journal d'activité ── */}
        {canManageSettings ? (
          <TabsContent value="log">
            <SectionCard
              title="Activités récentes"
              description={logDescription}
              action={
                <Input
                  type="date"
                  value={logDate}
                  onChange={(e) => setLogDate(e.target.value || today())}
                  className="w-auto"
                  aria-label="Filtrer le journal par date"
                />
              }
            >
              <div className="space-y-0">
                {audits.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <img
                      src="/src/assets/sorry.svg"
                      alt="Aucune activité"
                      className="mb-3 w-28 opacity-90"
                    />
                    <p className="text-sm font-medium text-muted-foreground">
                      Aucune activité pour cette date
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground/60">
                      Sélectionnez une autre date pour consulter le journal.
                    </p>
                  </div>
                ) : (
                  groupAuditsByPeriod(audits).map(([period, items]) => (
                    <div key={period} className="mb-8">
                      <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {period}
                      </h3>

                      <div className="relative ml-4 border-l border-border pl-6 space-y-4">
                        {items.map((audit) => (
                          <AuditRow key={audit.id} audit={audit} />
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </SectionCard>
          </TabsContent>
        ) : null}
      </Tabs>

      {/* ── Modal détails / restauration d'une sauvegarde ── */}
      <AppModal
        open={Boolean(selectedBackup)}
        onOpenChange={(open) => {
          if (!open && !restoring) setSelectedBackup(null);
        }}
        title="Détails de la sauvegarde"
        description="Consultation d'une sauvegarde"
        size="lg"
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              disabled={restoring}
              onClick={() => setSelectedBackup(null)}
            >
              Fermer
            </Button>
            <Button onClick={handleRestore} disabled={restoring}>
              {restoring ? (
                <>
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  Restauration en cours...
                </>
              ) : (
                <>
                  <DatabaseBackup className="mr-2 h-4 w-4" />
                  Restaurer cette sauvegarde
                </>
              )}
            </Button>
          </div>
        }
      >
        {selectedBackup && (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between rounded-lg border bg-background p-3">
                <span className="text-sm text-muted-foreground">Fichier</span>
                <span className="max-w-[60%] truncate font-mono text-xs font-medium">
                  {selectedBackup.filename}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg border bg-background p-3">
                <span className="text-sm text-muted-foreground">Date</span>
                <span className="text-sm font-medium">
                  {fmtBackupDateTime(selectedBackup.createdAt).date}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg border bg-background p-3">
                <span className="text-sm text-muted-foreground">Heure</span>
                <span className="text-sm font-medium">
                  {fmtBackupDateTime(selectedBackup.createdAt).time}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg border bg-background p-3">
                <span className="text-sm text-muted-foreground">Taille</span>
                <span className="text-sm font-medium">
                  {selectedBackup.sizeKb} Ko
                </span>
              </div>
            </div>

            {!system?.modeMaintenance && (
              <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-500/40 dark:bg-amber-900/20 dark:text-amber-300">
                Le mode maintenance doit être activé avant toute restauration.
                Activez-le dans les paramètres système ci-dessus.
              </div>
            )}

            {restoring && (
              <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 text-xs text-foreground">
                Restauration en cours… Veuillez patienter et ne pas fermer cette
                page pendant l'opération.
              </div>
            )}
          </div>
        )}
      </AppModal>
    </>
  );
}

// ── Composants utilitaires ─────────────────────────────────────────────────

function groupAuditsByPeriod(audits: Audit[]) {
  const sections: Record<string, Audit[]> = {
    "Aujourd'hui": [],
    Hier: [],
    "Cette semaine": [],
    "Ce mois": [],
    "Plus ancien": [],
  };

  const now = new Date();

  audits.forEach((audit) => {
    const date = new Date(audit.createdAt);

    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffDays === 0) {
      sections["Aujourd'hui"].push(audit);
    } else if (diffDays === 1) {
      sections["Hier"].push(audit);
    } else if (diffDays < 7) {
      sections["Cette semaine"].push(audit);
    } else if (diffDays < 30) {
      sections["Ce mois"].push(audit);
    } else {
      sections["Plus ancien"].push(audit);
    }
  });

  return Object.entries(sections).filter(([, items]) => items.length > 0);
}

function Field({
  label,
  value,
  onChange,
  disabled,
  type = "text",
  error,
  autoComplete,
  placeholder,
  required = false,
}: {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  type?: string;
  error?: string;
  autoComplete?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label>
        {label}
        {required && <span className="ml-1 text-destructive">*</span>}
      </Label>
      <Input
        type={type}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
        onChange={(e) => onChange?.(e.target.value)}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function Setting({
  label,
  description,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-3.5">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch
        checked={checked}
        disabled={disabled}
        onCheckedChange={onChange}
      />
    </div>
  );
}
