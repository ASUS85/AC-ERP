import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import * as React from "react";
import { useState, useEffect, useMemo } from "react";
import { LoaderCircle, User, Building2, SlidersHorizontal, Shield, ScrollText, Camera, MonitorSmartphone, Bot, LineChart, BarChart3, Bell, CreditCard, FileText, ShoppingBag, ShoppingCart, Warehouse, Factory, Users, FolderOpen, Package, KeyRound, Lock, ChevronDown } from "lucide-react";
import { P as PageHeader } from "./PageHeader-Dn6TWXax.js";
import { a as SectionCard, b as SearchableSelect } from "./widgets-dh2l9GK9.js";
import { c as cn, j as Route, g as getStoredUser, d as canAccessPermission, u as useGlobalLoader, k as getMe, m as getSessions, n as uploadAvatar, o as updateProfile, p as changePassword, q as revokeOtherSessions } from "./router-soiu03Zn.js";
import { c as getJournal, r as resolveAvatarUrl, g as getEntreprise, d as getSysteme, u as updateEntreprise, e as updateMaintenance, f as updateSysteme, A as Avatar, a as AvatarImage, b as AvatarFallback } from "./parametres.service-BzdHjQZ5.js";
import { I as Input, B as Button } from "./input-DgNX5wjv.js";
import { L as Label } from "./label-D88VLxpo.js";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-KhGge2Zr.js";
import { useRouteContext } from "@tanstack/react-router";
import { A as AFRICAN_CURRENCIES, a as getCurrencyMeta, s as setStoredCurrency } from "./currency-BGNe4_9Y.js";
import { toast } from "sonner";
import "react-dom";
import "@tanstack/react-query";
import "clsx";
import "tailwind-merge";
import "zod";
import "axios";
import "@radix-ui/react-avatar";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "@radix-ui/react-label";
import "@radix-ui/react-tabs";
const Switch = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  SwitchPrimitives.Root,
  {
    className: cn(
      "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
      className
    ),
    ...props,
    ref,
    children: /* @__PURE__ */ jsx(
      SwitchPrimitives.Thumb,
      {
        className: cn(
          "pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0"
        )
      }
    )
  }
));
Switch.displayName = SwitchPrimitives.Root.displayName;
function useAuth() {
  const { auth } = useRouteContext({ from: Route.id });
  const user = auth?.user ?? getStoredUser();
  if (!user) {
    throw new Error("useAuth must be used within an authenticated context.");
  }
  const hasPermission = (module, action) => {
    return canAccessPermission(user, module, action);
  };
  return { user, isAuthenticated: !!user, hasPermission };
}
const today = () => {
  const now = /* @__PURE__ */ new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
};
const bounds = (date) => ({
  dateFrom: (/* @__PURE__ */ new Date(`${date}T00:00:00`)).toISOString(),
  dateTo: (/* @__PURE__ */ new Date(`${date}T23:59:59.999`)).toISOString()
});
const unwrap = (response) => response.data;
const errorMessage = (error, fallback) => {
  const message = error.response?.data?.error?.message;
  return typeof message === "string" ? message : fallback;
};
const ACTION_META = {
  LOGIN: {
    label: "Connexion",
    color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
  },
  LOGOUT: {
    label: "Déconnexion",
    color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
  },
  CREATE: {
    label: "Création",
    color: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
  },
  UPDATE: {
    label: "Modification",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
  },
  DELETE: {
    label: "Suppression",
    color: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
  },
  ARCHIVE: {
    label: "Archivage",
    color: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
  },
  VALIDATE: {
    label: "Validation",
    color: "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300"
  },
  REJECT: {
    label: "Rejet",
    color: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300"
  },
  EXPORT: {
    label: "Export",
    color: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300"
  },
  PAYMENT: {
    label: "Paiement",
    color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300"
  }
};
const MODULE_ICONS = {
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
  ia: Bot
};
const ACTION_DOT_CLASS = {
  CREATE: "bg-green-500",
  UPDATE: "bg-blue-500",
  DELETE: "bg-red-500",
  LOGIN: "bg-emerald-500",
  LOGOUT: "bg-gray-400",
  ARCHIVE: "bg-amber-500",
  VALIDATE: "bg-teal-500",
  REJECT: "bg-rose-500",
  EXPORT: "bg-violet-500",
  PAYMENT: "bg-indigo-500"
};
const ACTION_BADGE_CLASS = {
  CREATE: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  UPDATE: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  DELETE: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  LOGIN: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  LOGOUT: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  ARCHIVE: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  VALIDATE: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300",
  REJECT: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
  EXPORT: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
  PAYMENT: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
};
const STATUS_LABELS = {
  200: {
    label: "Succès",
    className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
  },
  201: {
    label: "Créé",
    className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
  },
  204: {
    label: "Succès",
    className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
  },
  400: {
    label: "Requête invalide",
    className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
  },
  401: {
    label: "Non autorisé",
    className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
  },
  403: {
    label: "Accès refusé",
    className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
  },
  404: {
    label: "Introuvable",
    className: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
  },
  500: {
    label: "Erreur serveur",
    className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
  }
};
const DISPLAY_FIELDS = {
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
  adresse: "Adresse"
};
const HIDDEN_FIELDS = /* @__PURE__ */ new Set(["id", "createdAt", "updatedAt", "deletedAt", "password", "motDePasse", "idUtilisateur", "avatar", "mfaToken", "idCategorie", "idRole", "lockedUntil", "permissions", "failedAttempts", "refreshToken", "idProduit", "code", "donnees"]);
const MODULE_AUDIT_LABELS = {
  users: {
    create: "a créé un utilisateur.",
    update: "a modifié un utilisateur.",
    delete: "a supprimé un utilisateur."
  },
  roles: {
    create: "a créé un rôle.",
    update: "a modifié un rôle.",
    delete: "a supprimé un rôle."
  },
  produits: {
    create: "a créé un produit.",
    update: "a modifié un produit.",
    delete: "a supprimé un produit."
  },
  categories: {
    create: "a créé une catégorie.",
    update: "a modifié une catégorie.",
    delete: "a supprimé une catégorie."
  },
  clients: {
    create: "a créé un client.",
    update: "a modifié un client.",
    delete: "a supprimé un client."
  },
  fournisseurs: {
    create: "a créé un fournisseur.",
    update: "a modifié un fournisseur.",
    delete: "a supprimé un fournisseur."
  },
  factures: {
    create: "a créé une facture.",
    update: "a modifié une facture.",
    delete: "a supprimé une facture."
  },
  paiements: {
    create: "a enregistré un paiement.",
    update: "a modifié un paiement.",
    delete: "a supprimé un paiement."
  }
};
function toReadableLabel(key) {
  if (DISPLAY_FIELDS[key]) return DISPLAY_FIELDS[key];
  return key.replace(/([A-Z])/g, " $1").replace(/_/g, " ").replace(/^./, (s) => s.toUpperCase()).trim();
}
function getAuditAction(action) {
  const lower = action.toLowerCase();
  if (lower.includes("login")) return "LOGIN";
  if (lower.includes("auth")) return "LOGIN";
  if (lower.includes("logout")) return "LOGOUT";
  if (lower.includes("verify-mfa") || lower.includes("verify_mfa")) return "VERIFY_MFA";
  if (lower.startsWith("post")) return "CREATE";
  if (lower.startsWith("put") || lower.startsWith("patch")) return "UPDATE";
  if (lower.startsWith("delete")) return "DELETE";
  return action.toUpperCase();
}
function normalizeAuditModule(module) {
  const lower = module.toLowerCase();
  if (lower === "utilisateurs") return "users";
  if (lower === "parametres") return "systeme";
  return lower;
}
function getAuditRouteInfo(action) {
  const [rawMethod = "", ...rest] = action.split(" ");
  const path = rest.join(" ").toLowerCase();
  const segments = path.split("/").filter(Boolean);
  return {
    method: rawMethod.toUpperCase(),
    path,
    root: segments[2] || segments[0] || "",
    resource: segments[3] || "",
    target: segments[4] || "",
    extra: segments[5] || ""
  };
}
function getAuditPayload(audit) {
  const donnees = audit.newValues?.donnees;
  return donnees && typeof donnees === "object" && !Array.isArray(donnees) ? donnees : {};
}
function buildCrudSentence(action, module) {
  const labels = MODULE_AUDIT_LABELS[module];
  if (!labels) return null;
  if (action === "CREATE") return labels.create;
  if (action === "UPDATE") return labels.update;
  if (action === "DELETE") return labels.delete;
  return null;
}
function buildSentence(audit) {
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
    if (route.path.includes("/inventaires/") && route.path.includes("/valider")) {
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
    if (route.path.includes("/bons-commande/") && route.path.includes("/envoyer")) {
      return "a envoyé un bon de commande fournisseur.";
    }
    if (route.path.includes("/bons-commande/") && route.path.includes("/statut")) {
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
    if (route.path.includes("/bons-commande/") && route.path.includes("/dupliquer")) {
      return "a dupliqué un bon de commande fournisseur.";
    }
    if (route.path.includes("/bons-commande/") && route.path.includes("/facture")) {
      return "a créé une facture d'achat depuis un bon de commande.";
    }
    if (route.path.includes("/bons-commande/") && route.path.includes("/reception")) {
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
    if (route.path.includes("/commandes/") && route.path.includes("/confirmer")) {
      return "a confirmé une commande client.";
    }
    if (route.path.includes("/commandes/") && route.path.includes("/livraison")) {
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
      return buildCrudSentence(action, module) ?? (module === "stocks" ? "a créé un mouvement de stock." : module === "achats" ? "a créé un élément du module achats." : module === "ventes" ? "a créé un élément du module ventes." : module === "inventaires" ? "a créé un inventaire." : "a créé un élément.");
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
          return buildCrudSentence(action, module) || "a effectué une modification.";
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
function fmtTime(date) {
  return new Date(date).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
}
function getDisplayName(user) {
  const fullName = `${user?.prenom || ""} ${user?.nom || ""}`.trim();
  return fullName || user?.email || "Utilisateur";
}
function getInitials(user) {
  const initials = `${user?.prenom?.[0] || ""}${user?.nom?.[0] || ""}`;
  return (initials || user?.email?.slice(0, 2) || "AC").toUpperCase();
}
function formatAuditValue(value) {
  if (value === null || value === void 0) {
    return "—";
  }
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (Array.isArray(value)) {
    return value.join(", ");
  }
  const obj = value;
  if ("nomRole" in obj) {
    return String(obj.nomRole);
  }
  if ("prenom" in obj || "nom" in obj) {
    return `${obj.prenom ?? ""} ${obj.nom ?? ""}`.trim();
  }
  if ("nomCategorie" in obj) {
    return String(obj.nomCategorie);
  }
  if ("nomProduit" in obj) {
    return String(obj.nomProduit);
  }
  if ("raisonSociale" in obj) {
    return String(obj.raisonSociale);
  }
  return "Objet";
}
function getDisplayData(audit) {
  const donnees = audit.newValues?.donnees;
  if (!donnees || typeof donnees !== "object") {
    return [];
  }
  return Object.entries(donnees).filter(([key]) => !HIDDEN_FIELDS.has(key)).map(([key, value]) => ({
    label: toReadableLabel(key),
    value: formatAuditValue(value)
  }));
}
function AuditRow({
  audit
}) {
  const [expanded, setExpanded] = useState(false);
  const actor = audit.utilisateur ? `${audit.utilisateur.prenom} ${audit.utilisateur.nom}` : "Système";
  !audit.utilisateur;
  const action = getAuditAction(audit.action);
  const module = normalizeAuditModule(audit.module);
  const ModuleIcon = MODULE_ICONS[module];
  const dotClass = ACTION_DOT_CLASS[action] ?? "bg-gray-400";
  const badgeClass = ACTION_BADGE_CLASS[action] ?? ACTION_BADGE_CLASS.LOGOUT;
  const hasDetails = audit.newValues && Object.keys(audit.newValues).length > 0;
  const displayData = getDisplayData(audit);
  const status = typeof audit.newValues?.status === "number" ? audit.newValues.status : void 0;
  return /* @__PURE__ */ jsxs("div", { className: cn("group relative rounded-2xl border border-border/70 bg-card/80 px-5 py-4 backdrop-blur-sm transition-all hover:border-primary/30 hover:shadow-md", "hover:border-primary/30 hover:shadow-sm", expanded && "border-primary/50 shadow-sm", hasDetails && "cursor-pointer"), onClick: () => hasDetails && setExpanded((v) => !v), children: [
    /* @__PURE__ */ jsxs("div", { className: "absolute -left-8 top-0 bottom-0 flex flex-col items-center", children: [
      /* @__PURE__ */ jsx("div", { className: "flex-1 w-px bg-border" }),
      /* @__PURE__ */ jsx("div", { className: cn("h-3 w-3 rounded-full border-2 border-background", dotClass) }),
      /* @__PURE__ */ jsx("div", { className: "flex-1 w-px bg-border" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
      /* @__PURE__ */ jsxs(Avatar, { className: "h-9 w-8", children: [
        /* @__PURE__ */ jsx(AvatarImage, { src: resolveAvatarUrl(audit?.utilisateur?.avatar), alt: getDisplayName(audit.utilisateur) }),
        /* @__PURE__ */ jsx(AvatarFallback, { className: "bg-gradient-primary text-xs font-semibold text-white", children: getInitials(audit.utilisateur) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
        /* @__PURE__ */ jsxs("p", { className: "text-sm leading-snug text-foreground", children: [
          /* @__PURE__ */ jsx("span", { className: "font-semibold", children: actor }),
          " ",
          /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: buildSentence(audit) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-2 flex flex-wrap items-center gap-2", children: [
          /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-[11px] text-muted-foreground", children: [
            ModuleIcon && /* @__PURE__ */ jsx(ModuleIcon, { className: "h-3 w-3" }),
            audit.module
          ] }),
          /* @__PURE__ */ jsx("span", { className: cn("rounded-md px-2 py-1 text-[11px] font-medium", badgeClass), children: ACTION_META[action]?.label }),
          audit.ipAddress && /* @__PURE__ */ jsx("span", { className: "font-mono text-[11px] text-muted-foreground", children: audit.ipAddress })
        ] }),
        hasDetails && expanded && /* @__PURE__ */ jsxs("div", { className: "mt-3 rounded-lg border border-border/60 bg-muted/40 p-3 animate-in fade-in slide-in-from-top-1 duration-200", children: [
          /* @__PURE__ */ jsx("p", { className: "mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground", children: "Détails" }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
            status && /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "mb-1 text-xs uppercase tracking-wide text-muted-foreground", children: "Statut" }),
              /* @__PURE__ */ jsx("span", { className: cn("inline-flex rounded-md px-2 py-1 text-xs font-medium", STATUS_LABELS[status]?.className ?? "bg-gray-100 text-gray-700"), children: STATUS_LABELS[status]?.label ?? status })
            ] }),
            displayData.length > 0 && /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "mb-2 text-xs uppercase tracking-wide text-muted-foreground", children: "Nouvelles données" }),
              /* @__PURE__ */ jsx("div", { className: "space-y-2", children: displayData.map((item) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between rounded-lg border bg-background p-3", children: [
                /* @__PURE__ */ jsx("span", { className: "text-sm text-muted-foreground", children: item.label }),
                /* @__PURE__ */ jsx("span", { className: "font-medium", children: item.value })
              ] }, item.label)) })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex shrink-0 flex-col items-end gap-0.5", children: [
        /* @__PURE__ */ jsx("span", { className: "tabular-nums text-xs text-muted-foreground", children: fmtTime(audit.createdAt) }),
        hasDetails && /* @__PURE__ */ jsx(ChevronDown, { className: cn("h-4 w-4 text-muted-foreground/50 transition-transform duration-200", expanded && "rotate-180") })
      ] })
    ] })
  ] });
}
function SettingsPage() {
  const {
    hasPermission
  } = useAuth();
  const {
    runWithLoader
  } = useGlobalLoader();
  const [profile, setProfile] = useState(null);
  const [company, setCompany] = useState(null);
  const [system, setSystem] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [audits, setAudits] = useState([]);
  const [logDate, setLogDate] = useState(today);
  const [profileErrors, setProfileErrors] = useState({});
  const [companyErrors, setCompanyErrors] = useState({});
  const [passwords, setPasswords] = useState({
    current: "",
    next: "",
    confirm: ""
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [loading, setLoading] = useState(true);
  const canManageSettings = hasPermission("users", "modifier");
  const isSuperAdmin = profile?.role?.nomRole === "SUPER_ADMIN";
  useEffect(() => {
    let alive = true;
    async function loadInitialData() {
      const [meResult, sessionsResult, entrepriseResult, systemeResult] = await Promise.allSettled([getMe(), getSessions(), canManageSettings ? getEntreprise() : Promise.resolve(null), canManageSettings ? getSysteme() : Promise.resolve(null)]);
      if (!alive) return;
      if (meResult.status === "fulfilled") {
        setProfile(unwrap(meResult.value));
      }
      if (sessionsResult.status === "fulfilled") {
        setSessions(unwrap(sessionsResult.value) || []);
      }
      if (canManageSettings && entrepriseResult.status === "fulfilled") {
        const loadedCompany = unwrap(entrepriseResult.value);
        setCompany(loadedCompany);
        setStoredCurrency(loadedCompany?.devise);
      }
      if (canManageSettings && systemeResult.status === "fulfilled") {
        setSystem(unwrap(systemeResult.value));
      }
      if (meResult.status === "rejected" || sessionsResult.status === "rejected" || canManageSettings && entrepriseResult.status === "rejected" || canManageSettings && systemeResult.status === "rejected") {
        toast.error("Certains paramètres n'ont pas pu être chargés");
      }
      setLoading(false);
    }
    void loadInitialData();
    return () => {
      alive = false;
    };
  }, [canManageSettings]);
  useEffect(() => {
    if (!canManageSettings) {
      setAudits([]);
      return;
    }
    getJournal(bounds(logDate)).then((r) => setAudits(unwrap(r) || [])).catch(() => toast.error("Impossible de charger le journal"));
  }, [logDate, canManageSettings]);
  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);
  const saveProfile = async () => {
    if (!profile) return;
    const newErrors = {};
    if (!profile.nom.trim()) newErrors.nom = "Le nom est obligatoire";
    if (!profile.prenom.trim()) newErrors.prenom = "Le prénom est obligatoire";
    if (!profile.email.trim()) newErrors.email = "L'e-mail est obligatoire";
    setProfileErrors(newErrors);
    if (Object.keys(newErrors).length) return;
    try {
      const payload = {
        ...profile
      };
      if (avatarFile) {
        const uploadResponse = await runWithLoader(uploadAvatar(avatarFile), {
          target: "main",
          label: "Import de la photo..."
        });
        payload.avatar = unwrap(uploadResponse).avatar;
      }
      const response = await runWithLoader(updateProfile(payload), {
        target: "main",
        label: "Enregistrement du profil..."
      });
      const updated = unwrap(response);
      setProfile(updated);
      setProfileErrors({});
      setAvatarFile(null);
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
        setAvatarPreview("");
      }
      localStorage.setItem("erp_user", JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent("erp:user-updated", {
        detail: updated
      }));
      toast.success("Profil enregistré");
    } catch (error) {
      toast.error(errorMessage(error, "Échec de l'enregistrement"));
    }
  };
  const saveCompany = async () => {
    if (!company) return;
    const newErrors = {};
    if (!company.raisonSociale.trim()) newErrors.raisonSociale = "La raison sociale est obligatoire";
    if (!company.devise.trim()) newErrors.devise = "La devise est obligatoire";
    if (!company.fuseauHoraire.trim()) newErrors.fuseauHoraire = "Le fuseau horaire est obligatoire";
    setCompanyErrors(newErrors);
    if (Object.keys(newErrors).length) return;
    try {
      const response = await updateEntreprise(company);
      const updatedCompany = unwrap(response);
      setCompany(updatedCompany);
      setStoredCurrency(updatedCompany?.devise);
      setCompanyErrors({});
      toast.success("Paramètres entreprise enregistrés");
    } catch {
      toast.error("Échec de l'enregistrement");
    }
  };
  const updateProfileField = (field, value) => {
    if (!profile) return;
    setProfile({
      ...profile,
      [field]: value
    });
    if (profileErrors[field]) setProfileErrors((p) => ({
      ...p,
      [field]: ""
    }));
  };
  const updateCompanyField = (field, value) => {
    if (!company) return;
    setCompany({
      ...company,
      [field]: value
    });
    if (companyErrors[field]) setCompanyErrors((p) => ({
      ...p,
      [field]: ""
    }));
  };
  const handleAvatarChange = (file) => {
    if (!file || !profile) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Veuillez choisir une image JPG, PNG ou équivalent");
      return;
    }
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };
  const toggleSystem = async (field, value) => {
    if (!system) return;
    try {
      const response = field === "modeMaintenance" ? await updateMaintenance(value) : await updateSysteme({
        [field]: value
      });
      setSystem(unwrap(response));
      toast.success("Paramètre mis à jour");
    } catch (error) {
      toast.error(errorMessage(error, "Modification refusée"));
    }
  };
  const submitPassword = async () => {
    const newErrors = {};
    if (!passwords.current.trim()) newErrors.current = "Le mot de passe actuel est obligatoire";
    if (!passwords.next.trim()) newErrors.next = "Le nouveau mot de passe est obligatoire";
    if (!passwords.confirm.trim()) newErrors.confirm = "La confirmation est obligatoire";
    if (passwords.next && passwords.confirm && passwords.next !== passwords.confirm) {
      newErrors.confirm = "Les nouveaux mots de passe ne correspondent pas";
    }
    setPasswordErrors(newErrors);
    if (Object.keys(newErrors).length) return;
    try {
      await changePassword(passwords.current, passwords.next);
      setPasswords({
        current: "",
        next: "",
        confirm: ""
      });
      setPasswordErrors({});
      toast.success("Mot de passe mis à jour");
    } catch (error) {
      toast.error(errorMessage(error, "Échec du changement de mot de passe"));
    }
  };
  const revokeSessions = async () => {
    try {
      await revokeOtherSessions();
      const response = await getSessions();
      setSessions(unwrap(response) || []);
      toast.success("Les autres sessions ont été déconnectées");
    } catch {
      toast.error("Impossible de révoquer les sessions");
    }
  };
  const logDescription = useMemo(() => `${audits.length} activité${audits.length > 1 ? "s" : ""} pour cette date`, [audits.length]);
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "flex min-h-64 items-center justify-center", children: /* @__PURE__ */ jsx(LoaderCircle, { className: "h-6 w-6 animate-spin text-muted-foreground" }) });
  }
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(PageHeader, { title: "Paramètres & configuration", description: "Profil, entreprise, système et sécurité", breadcrumb: ["Administration", "Paramètres"] }),
    /* @__PURE__ */ jsxs(Tabs, { defaultValue: "profile", children: [
      /* @__PURE__ */ jsxs(TabsList, { className: "mb-4 flex-wrap", children: [
        /* @__PURE__ */ jsxs(TabsTrigger, { value: "profile", className: "gap-1.5", children: [
          /* @__PURE__ */ jsx(User, { className: "h-4 w-4" }),
          " Profil"
        ] }),
        canManageSettings ? /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsxs(TabsTrigger, { value: "company", className: "gap-1.5", children: [
            /* @__PURE__ */ jsx(Building2, { className: "h-4 w-4" }),
            " Entreprise"
          ] }),
          /* @__PURE__ */ jsxs(TabsTrigger, { value: "system", className: "gap-1.5", children: [
            /* @__PURE__ */ jsx(SlidersHorizontal, { className: "h-4 w-4" }),
            " Système"
          ] })
        ] }) : null,
        /* @__PURE__ */ jsxs(TabsTrigger, { value: "security", className: "gap-1.5", children: [
          /* @__PURE__ */ jsx(Shield, { className: "h-4 w-4" }),
          " Sécurité"
        ] }),
        canManageSettings ? /* @__PURE__ */ jsxs(TabsTrigger, { value: "log", className: "gap-1.5", children: [
          /* @__PURE__ */ jsx(ScrollText, { className: "h-4 w-4" }),
          " Journal"
        ] }) : null
      ] }),
      /* @__PURE__ */ jsx(TabsContent, { value: "profile", children: /* @__PURE__ */ jsxs(SectionCard, { title: "Profil utilisateur", description: "Vos informations personnelles", children: [
        profile && /* @__PURE__ */ jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "sm:col-span-2", children: [
            /* @__PURE__ */ jsx(Label, { className: "mb-2 block", children: "Photo de profil" }),
            /* @__PURE__ */ jsxs("label", { className: "group relative flex h-20 w-20 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-border bg-secondary text-muted-foreground shadow-sm transition-colors hover:border-primary hover:text-primary", children: [
              avatarPreview || profile.avatar ? /* @__PURE__ */ jsx("img", { src: avatarPreview || resolveAvatarUrl(profile.avatar), alt: "Photo de profil", className: "h-full w-full object-cover" }) : /* @__PURE__ */ jsx(User, { className: "h-9 w-9" }),
              /* @__PURE__ */ jsx("span", { className: "absolute inset-0 flex items-center justify-center bg-background/70 opacity-0 transition-opacity group-hover:opacity-100", children: /* @__PURE__ */ jsx(Camera, { className: "h-5 w-5" }) }),
              /* @__PURE__ */ jsx(Input, { type: "file", accept: "image/png,image/jpeg,image/jpg,image/webp,image/gif", className: "sr-only", onChange: (e) => {
                handleAvatarChange(e.target.files?.[0]);
                e.target.value = "";
              } })
            ] })
          ] }),
          /* @__PURE__ */ jsx(Field, { label: "Nom", value: profile.nom, placeholder: "Entrez votre nom", required: true, error: profileErrors.nom, onChange: (v) => updateProfileField("nom", v) }),
          /* @__PURE__ */ jsx(Field, { label: "Prénom", value: profile.prenom, placeholder: "Entrez votre prénom", required: true, error: profileErrors.prenom, onChange: (v) => updateProfileField("prenom", v) }),
          /* @__PURE__ */ jsx(Field, { label: "Adresse e-mail", value: profile.email, placeholder: "exemple@ac-erp.com", required: true, error: profileErrors.email, onChange: (v) => updateProfileField("email", v), type: "email" }),
          /* @__PURE__ */ jsx(Field, { label: "Téléphone", value: profile.telephone || "", placeholder: "Entrez votre numéro", onChange: (v) => updateProfileField("telephone", v) }),
          /* @__PURE__ */ jsx(Field, { label: "Rôle", value: profile.role?.nomRole || "", placeholder: "Rôle attribué", disabled: true }),
          /* @__PURE__ */ jsx(Field, { label: "Statut", value: profile.statut || "", placeholder: "Statut du compte", disabled: true })
        ] }),
        /* @__PURE__ */ jsx(Button, { className: "mt-4", onClick: saveProfile, children: "Enregistrer" })
      ] }) }),
      canManageSettings ? /* @__PURE__ */ jsx(TabsContent, { value: "company", children: /* @__PURE__ */ jsxs(SectionCard, { title: "Paramètres entreprise", description: "Informations utilisées sur les documents et rapports", children: [
        company && /* @__PURE__ */ jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
          /* @__PURE__ */ jsx(Field, { label: "Raison sociale", value: company.raisonSociale, placeholder: "Nom officiel de l'entreprise", required: true, error: companyErrors.raisonSociale, onChange: (v) => updateCompanyField("raisonSociale", v) }),
          /* @__PURE__ */ jsx(Field, { label: "Identifiant fiscal", value: company.numeroFiscal || "", placeholder: "Numéro fiscal ou NIU", onChange: (v) => updateCompanyField("numeroFiscal", v) }),
          /* @__PURE__ */ jsx(Field, { label: "Adresse", value: company.adresse || "", placeholder: "Adresse complète", onChange: (v) => updateCompanyField("adresse", v) }),
          /* @__PURE__ */ jsx(Field, { label: "Téléphone", value: company.telephone || "", placeholder: "Numéro de téléphone", onChange: (v) => updateCompanyField("telephone", v) }),
          /* @__PURE__ */ jsx(Field, { label: "E-mail", value: company.email || "", placeholder: "contact@entreprise.com", onChange: (v) => updateCompanyField("email", v), type: "email" }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxs(Label, { children: [
              "Devise ",
              /* @__PURE__ */ jsx("span", { className: "ml-1 text-destructive", children: "*" })
            ] }),
            /* @__PURE__ */ jsx(SearchableSelect, { value: company.devise, onValueChange: (v) => updateCompanyField("devise", v), options: AFRICAN_CURRENCIES.map((c) => ({
              value: c.code,
              label: `${c.code} - ${c.name} (${c.symbol})`
            })), placeholder: "Selectionnez une devise", searchPlaceholder: "Rechercher une devise", emptyMessage: "Aucune devise trouvee" }),
            /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
              "Symbole utilise: ",
              getCurrencyMeta(company.devise).symbol
            ] }),
            companyErrors.devise && /* @__PURE__ */ jsx("p", { className: "text-xs text-destructive", children: companyErrors.devise })
          ] }),
          /* @__PURE__ */ jsx(Field, { label: "Fuseau horaire", value: company.fuseauHoraire, placeholder: "Africa/Douala", required: true, error: companyErrors.fuseauHoraire, onChange: (v) => updateCompanyField("fuseauHoraire", v) }),
          /* @__PURE__ */ jsx(Field, { label: "Logo (URL)", value: company.logo || "", placeholder: "https://exemple.com/logo.png", onChange: (v) => updateCompanyField("logo", v) })
        ] }),
        /* @__PURE__ */ jsx(Button, { className: "mt-4", onClick: saveCompany, children: "Enregistrer" })
      ] }) }) : null,
      canManageSettings ? /* @__PURE__ */ jsx(TabsContent, { value: "system", children: /* @__PURE__ */ jsx(SectionCard, { title: "Paramètres système", description: "Préférences globales de la plateforme", children: system && /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsx(Setting, { label: "Notifications par e-mail", description: "Recevoir les alertes importantes par e-mail", checked: system.notificationsEmail, onChange: (v) => toggleSystem("notificationsEmail", v) }),
        /* @__PURE__ */ jsx(Setting, { label: "Alertes IA proactives", description: "Prévisions et recommandations automatiques", checked: system.alertesIa, onChange: (v) => toggleSystem("alertesIa", v) }),
        /* @__PURE__ */ jsx(Setting, { label: "Facturation automatique", description: "Générer les factures à la validation des ventes", checked: system.facturationAutomatique, onChange: (v) => toggleSystem("facturationAutomatique", v) }),
        /* @__PURE__ */ jsx(Setting, { label: "Mode maintenance", description: isSuperAdmin ? "Bloque les écritures pour tous sauf le super administrateur" : "Seul le super administrateur peut modifier ce réglage", checked: system.modeMaintenance, disabled: !isSuperAdmin, onChange: (v) => toggleSystem("modeMaintenance", v) })
      ] }) }) }) : null,
      /* @__PURE__ */ jsx(TabsContent, { value: "security", children: /* @__PURE__ */ jsxs("div", { className: "grid gap-4 lg:grid-cols-2", children: [
        /* @__PURE__ */ jsxs(SectionCard, { title: "Sécurité", description: "Modification du mot de passe", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
            /* @__PURE__ */ jsx(Field, { label: "Mot de passe actuel", type: "password", value: passwords.current, error: passwordErrors.current, placeholder: "Saisissez le mot de passe actuel", required: true, autoComplete: "off", onChange: (v) => {
              setPasswords({
                ...passwords,
                current: v
              });
              if (passwordErrors.current) setPasswordErrors((p) => ({
                ...p,
                current: ""
              }));
            } }),
            /* @__PURE__ */ jsx(Field, { label: "Nouveau mot de passe", type: "password", value: passwords.next, error: passwordErrors.next, placeholder: "Saisissez le nouveau mot de passe", required: true, autoComplete: "new-password", onChange: (v) => {
              setPasswords({
                ...passwords,
                next: v
              });
              if (passwordErrors.next) setPasswordErrors((p) => ({
                ...p,
                next: ""
              }));
            } }),
            /* @__PURE__ */ jsx(Field, { label: "Confirmer le mot de passe", type: "password", value: passwords.confirm, error: passwordErrors.confirm, placeholder: "Confirmez le nouveau mot de passe", required: true, autoComplete: "new-password", onChange: (v) => {
              setPasswords({
                ...passwords,
                confirm: v
              });
              if (passwordErrors.confirm) setPasswordErrors((p) => ({
                ...p,
                confirm: ""
              }));
            } })
          ] }),
          /* @__PURE__ */ jsx(Button, { className: "mt-4", onClick: submitPassword, children: "Mettre à jour" })
        ] }),
        /* @__PURE__ */ jsxs(SectionCard, { title: "Sessions actives", description: "Contrôlez les connexions à votre compte", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 rounded-lg bg-secondary/50 p-4", children: [
            /* @__PURE__ */ jsx(MonitorSmartphone, { className: "h-8 w-8 text-primary" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsxs("p", { className: "text-sm font-medium text-foreground", children: [
                sessions.length,
                " session",
                sessions.length > 1 ? "s" : "",
                " ",
                "active",
                sessions.length > 1 ? "s" : ""
              ] }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Révoquez les jetons actifs sur les autres appareils" })
            ] })
          ] }),
          /* @__PURE__ */ jsx(Button, { variant: "outline", className: "mt-4 w-full", onClick: revokeSessions, children: "Déconnecter les autres sessions" })
        ] })
      ] }) }),
      canManageSettings ? /* @__PURE__ */ jsx(TabsContent, { value: "log", children: /* @__PURE__ */ jsx(SectionCard, { title: "Activités récentes", description: logDescription, action: /* @__PURE__ */ jsx(Input, { type: "date", value: logDate, onChange: (e) => setLogDate(e.target.value || today()), className: "w-auto", "aria-label": "Filtrer le journal par date" }), children: /* @__PURE__ */ jsx("div", { className: "space-y-0", children: audits.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center py-10 text-center", children: [
        /* @__PURE__ */ jsx("img", { src: "/src/assets/sorry.svg", alt: "Aucune activité", className: "mb-3 w-28 opacity-90" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-muted-foreground", children: "Aucune activité pour cette date" }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-muted-foreground/60", children: "Sélectionnez une autre date pour consulter le journal." })
      ] }) : groupAuditsByPeriod(audits).map(([period, items]) => /* @__PURE__ */ jsxs("div", { className: "mb-8", children: [
        /* @__PURE__ */ jsx("h3", { className: "mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground", children: period }),
        /* @__PURE__ */ jsx("div", { className: "relative ml-4 border-l border-border pl-6 space-y-4", children: items.map((audit) => /* @__PURE__ */ jsx(AuditRow, { audit }, audit.id)) })
      ] }, period)) }) }) }) : null
    ] })
  ] });
}
function groupAuditsByPeriod(audits) {
  const sections = {
    "Aujourd'hui": [],
    Hier: [],
    "Cette semaine": [],
    "Ce mois": [],
    "Plus ancien": []
  };
  const now = /* @__PURE__ */ new Date();
  audits.forEach((audit) => {
    const date = new Date(audit.createdAt);
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1e3 * 60 * 60 * 24));
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
  required = false
}) {
  return /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
    /* @__PURE__ */ jsxs(Label, { children: [
      label,
      required && /* @__PURE__ */ jsx("span", { className: "ml-1 text-destructive", children: "*" })
    ] }),
    /* @__PURE__ */ jsx(Input, { type, value, placeholder, disabled, autoComplete, "aria-invalid": Boolean(error), onChange: (e) => onChange?.(e.target.value) }),
    error && /* @__PURE__ */ jsx("p", { className: "text-xs text-destructive", children: error })
  ] });
}
function Setting({
  label,
  description,
  checked,
  onChange,
  disabled
}) {
  return /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-4 rounded-lg border border-border p-3.5", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-foreground", children: label }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: description })
    ] }),
    /* @__PURE__ */ jsx(Switch, { checked, disabled, onCheckedChange: onChange })
  ] });
}
export {
  SettingsPage as component
};
